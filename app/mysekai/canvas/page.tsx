'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchCards, fetchCardMysekaiCanvasBonuses, getCardThumbnailUrl } from '@/lib/api'
import { CHARACTER_NAMES_TW, UNIT_NAMES_TW, CHARACTER_UNIT, type UnitId } from '@/lib/types'

interface Card {
  id: number
  characterId: number
  cardRarityType: string
  prefix: string
  assetbundleName: string
}

interface CanvasBonus {
  cardRarityType: string
  power1Bonus: number
  power2Bonus: number
  power3Bonus: number
}

// Canvas bonus based on card rarity
const RARITY_BONUS: Record<string, number> = {
  'rarity_1': 5,
  'rarity_2': 10,
  'rarity_3': 20,
  'rarity_4': 30,
  'rarity_birthday': 30,
}

const RARITY_NAMES: Record<string, string> = {
  'rarity_1': '★1',
  'rarity_2': '★2',
  'rarity_3': '★3',
  'rarity_4': '★4',
  'rarity_birthday': '生日',
}

const RARITY_COLORS: Record<string, string> = {
  'rarity_1': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'rarity_2': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'rarity_3': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'rarity_4': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'rarity_birthday': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
}

export default function CanvasPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [canvasBonuses, setCanvasBonuses] = useState<CanvasBonus[]>([])
  const [loading, setLoading] = useState(true)
  const [owned, setOwned] = useState<Set<number>>(new Set())
  const [filterCharacter, setFilterCharacter] = useState<number | 'all'>('all')
  const [filterRarity, setFilterRarity] = useState<string | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [cardsData, bonusesData] = await Promise.all([
          fetchCards(),
          fetchCardMysekaiCanvasBonuses().catch(() => [])
        ])
        // Only include ★3+ cards for canvas
        setCards(cardsData.filter((c: Card) => 
          c.cardRarityType === 'rarity_3' || 
          c.cardRarityType === 'rarity_4' ||
          c.cardRarityType === 'rarity_birthday'
        ).sort((a: Card, b: Card) => b.id - a.id))
        setCanvasBonuses(bonusesData)
      } catch (error) {
        console.error('Failed to load cards:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('mysekai-canvas-owned')
    if (saved) setOwned(new Set(JSON.parse(saved)))
  }, [])

  const toggleOwned = (cardId: number) => {
    const newOwned = new Set(owned)
    if (newOwned.has(cardId)) newOwned.delete(cardId)
    else newOwned.add(cardId)
    setOwned(newOwned)
    localStorage.setItem('mysekai-canvas-owned', JSON.stringify(Array.from(newOwned)))
  }

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (filterCharacter !== 'all' && card.characterId !== filterCharacter) return false
      if (filterRarity !== 'all' && card.cardRarityType !== filterRarity) return false
      if (search && !card.prefix.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [cards, filterCharacter, filterRarity, search])

  const stats = useMemo(() => {
    // Only count one canvas per character (highest bonus)
    const characterBonuses: Record<number, number> = {}
    
    cards.forEach(card => {
      if (owned.has(card.id)) {
        const bonus = RARITY_BONUS[card.cardRarityType] || 0
        const currentBonus = characterBonuses[card.characterId] || 0
        characterBonuses[card.characterId] = Math.max(currentBonus, bonus)
      }
    })

    const totalBonus = Object.values(characterBonuses).reduce((sum, b) => sum + b, 0)
    const charactersWithCanvas = Object.keys(characterBonuses).length

    return {
      totalCards: cards.length,
      collected: owned.size,
      totalBonus,
      charactersWithCanvas,
    }
  }, [cards, owned])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-sekai-silver">載入卡片資料中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
              MySEKAI 無框畫
            </span>
          </h1>
          <p className="mt-2 text-sekai-silver">追蹤您的卡片無框畫與綜合力加成</p>
        </div>

        {/* Stats */}
        <div className="card p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
          <div className="grid sm:grid-cols-4 gap-6 relative">
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">總卡片數</p>
              <p className="number-xl mt-1">{stats.totalCards}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">已製作</p>
              <p className="number-xl mt-1 text-cyan-400">{stats.collected}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">角色數</p>
              <p className="number-xl mt-1">{stats.charactersWithCanvas}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">總加成</p>
              <p className="number-xl mt-1 text-blue-400">+{stats.totalBonus}</p>
            </div>
          </div>
        </div>

        {/* Bonus Legend */}
        <div className="card p-4 mb-6">
          <h3 className="text-sm font-medium text-sekai-pearl mb-3">稀有度對應加成</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(RARITY_BONUS).map(([rarity, bonus]) => (
              <div key={rarity} className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded border ${RARITY_COLORS[rarity]}`}>
                  {RARITY_NAMES[rarity]}
                </span>
                <span className="text-sekai-silver">+{bonus}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-sekai-mist mt-2">
            ※ 同一角色只計算一次加成（取最高值），需消耗回憶碎片製作
          </p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋卡片..."
              className="input flex-1"
            />
            <select
              value={filterCharacter === 'all' ? 'all' : filterCharacter}
              onChange={(e) => setFilterCharacter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="input w-full sm:w-40"
            >
              <option value="all">全部角色</option>
              {Array.from({ length: 26 }, (_, i) => i + 1).map(id => (
                <option key={id} value={id}>{CHARACTER_NAMES_TW[id]}</option>
              ))}
            </select>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="input w-full sm:w-32"
            >
              <option value="all">全部稀有度</option>
              {Object.entries(RARITY_NAMES).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-sekai-silver">
            顯示 {filteredCards.length} 張卡片
          </p>
          <button
            onClick={() => {
              setOwned(new Set())
              localStorage.removeItem('mysekai-canvas-owned')
            }}
            className="text-sm text-sekai-mist hover:text-unit-vbs"
          >
            重置收集
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCards.map((card) => {
            const isOwned = owned.has(card.id)
            const bonus = RARITY_BONUS[card.cardRarityType] || 0
            const unit = CHARACTER_UNIT[card.characterId]

            return (
              <div
                key={card.id}
                onClick={() => toggleOwned(card.id)}
                className={`card p-2 cursor-pointer transition-all group ${
                  isOwned
                    ? 'border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10'
                    : 'hover:border-cyan-500/30'
                }`}
              >
                {/* Card Image */}
                <div className="relative mb-2">
                  <div className="aspect-[3/4] rounded-lg bg-sekai-charcoal overflow-hidden">
                    <img
                      src={getCardThumbnailUrl(card.assetbundleName, 'after_training')}
                      alt={card.prefix}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = getCardThumbnailUrl(card.assetbundleName, 'normal')
                      }}
                    />
                  </div>
                  
                  {/* Owned indicator */}
                  {isOwned && (
                    <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs">
                      ✓
                    </div>
                  )}
                  
                  {/* Rarity badge */}
                  <div className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs border ${RARITY_COLORS[card.cardRarityType]}`}>
                    {RARITY_NAMES[card.cardRarityType]}
                  </div>
                </div>

                {/* Info */}
                <div className="text-center">
                  <p className="text-xs text-sekai-silver truncate">{CHARACTER_NAMES_TW[card.characterId]}</p>
                  <p className="text-xs text-sekai-mist truncate">{card.prefix}</p>
                  {isOwned && (
                    <p className="text-xs text-cyan-400 mt-1">+{bonus}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-12 text-sekai-silver">
            沒有找到符合條件的卡片
          </div>
        )}

        {/* Info */}
        <div className="mt-8 card p-6">
          <h3 className="heading-section mb-4">無框畫系統說明</h3>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-sekai-silver">
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">🖼️ 無框畫製作</h4>
              <p>使用回憶碎片製作卡片的無框畫，可展示您擁有的卡片並獲得綜合力加成。</p>
            </div>
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">📈 綜合力加成</h4>
              <p>加成基於卡片稀有度，★3 +20、★4/生日 +30。同一角色只計算最高加成。</p>
            </div>
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">🎯 藍圖獲取</h4>
              <p>無框畫藍圖可透過完成 MySEKAI 任務獲得。</p>
            </div>
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">💎 回憶碎片</h4>
              <p>製作無框畫需要對應角色的回憶碎片，稀有度越高需要越多。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
