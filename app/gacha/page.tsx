'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGachas, fetchCards, fetchGachaCardRarityRates, getCardThumbnailUrl, getGachaBannerUrl } from '@/lib/api'
import { CHARACTER_NAMES_TW } from '@/lib/types'

interface Gacha {
  id: number
  gachaType: string
  name: string
  assetbundleName: string
  startAt: number
  endAt: number
  gachaBonusId: number
  gachaInformation: {
    summary: string
    description: string
  }
  gachaCeilItemId: number
}

interface Card {
  id: number
  characterId: number
  cardRarityType: string
  prefix: string
  assetbundleName: string
}

interface GachaResult {
  card: Card
  isNew: boolean
  isPityBonus: boolean
}

// Gacha rates (simplified)
const RARITY_RATES = {
  rarity_4: 0.03, // 3%
  rarity_3: 0.085, // 8.5%
  rarity_2: 0.885, // 88.5%
}

const RARITY_COLORS: Record<string, string> = {
  rarity_4: 'from-yellow-400 to-amber-500',
  rarity_3: 'from-purple-400 to-pink-500',
  rarity_2: 'from-blue-400 to-cyan-500',
  rarity_1: 'from-gray-400 to-gray-500',
  rarity_birthday: 'from-pink-400 to-rose-500',
}

const RARITY_NAMES: Record<string, string> = {
  rarity_4: '★4',
  rarity_3: '★3',
  rarity_2: '★2',
  rarity_1: '★1',
  rarity_birthday: '★BD',
}

export default function GachaSimulatorPage() {
  const [gachas, setGachas] = useState<Gacha[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGacha, setSelectedGacha] = useState<Gacha | null>(null)
  const [results, setResults] = useState<GachaResult[]>([])
  const [pullHistory, setPullHistory] = useState<{ rarity: string; count: number }[]>([])
  const [totalPulls, setTotalPulls] = useState(0)
  const [totalCrystals, setTotalCrystals] = useState(0)
  const [star4Count, setStar4Count] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [gachaData, cardData] = await Promise.all([
          fetchGachas(),
          fetchCards()
        ])
        // Sort by start date descending and filter valid gachas
        const sorted = [...gachaData]
          .filter((g: Gacha) => g.gachaType === 'normal' || g.gachaType === 'limited')
          .sort((a: Gacha, b: Gacha) => b.startAt - a.startAt)
        setGachas(sorted)
        setCards(cardData.filter((c: Card) => 
          c.cardRarityType === 'rarity_4' || 
          c.cardRarityType === 'rarity_3' || 
          c.cardRarityType === 'rarity_2'
        ))
        if (sorted.length > 0) {
          setSelectedGacha(sorted[0])
        }
      } catch (error) {
        console.error('Error loading gacha data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const simulatePull = useCallback((count: number) => {
    if (cards.length === 0) return

    const star4Cards = cards.filter(c => c.cardRarityType === 'rarity_4')
    const star3Cards = cards.filter(c => c.cardRarityType === 'rarity_3')
    const star2Cards = cards.filter(c => c.cardRarityType === 'rarity_2')

    const newResults: GachaResult[] = []
    let newStar4Count = 0

    for (let i = 0; i < count; i++) {
      const rand = Math.random()
      let selectedCard: Card
      
      // For 10-pull, guarantee at least one ★3+ in the last slot
      const isGuaranteeSlot = count === 10 && i === 9 && newResults.every(r => 
        r.card.cardRarityType !== 'rarity_4' && r.card.cardRarityType !== 'rarity_3'
      )

      if (isGuaranteeSlot) {
        // Guarantee ★3 or ★4
        if (rand < RARITY_RATES.rarity_4) {
          selectedCard = star4Cards[Math.floor(Math.random() * star4Cards.length)]
          newStar4Count++
        } else {
          selectedCard = star3Cards[Math.floor(Math.random() * star3Cards.length)]
        }
      } else if (rand < RARITY_RATES.rarity_4) {
        selectedCard = star4Cards[Math.floor(Math.random() * star4Cards.length)]
        newStar4Count++
      } else if (rand < RARITY_RATES.rarity_4 + RARITY_RATES.rarity_3) {
        selectedCard = star3Cards[Math.floor(Math.random() * star3Cards.length)]
      } else {
        selectedCard = star2Cards[Math.floor(Math.random() * star2Cards.length)]
      }

      newResults.push({
        card: selectedCard,
        isNew: Math.random() > 0.7, // Random "new" flag for simulation
        isPityBonus: false,
      })
    }

    // Sort results by rarity (★4 first)
    newResults.sort((a, b) => {
      const rarityOrder: Record<string, number> = { rarity_4: 0, rarity_birthday: 1, rarity_3: 2, rarity_2: 3, rarity_1: 4 }
      return (rarityOrder[a.card.cardRarityType] || 5) - (rarityOrder[b.card.cardRarityType] || 5)
    })

    setShowAnimation(true)
    setTimeout(() => {
      setResults(newResults)
      setTotalPulls(prev => prev + count)
      setTotalCrystals(prev => prev + (count === 1 ? 300 : 3000))
      setStar4Count(prev => prev + newStar4Count)
      setShowAnimation(false)
    }, 500)
  }, [cards])

  const resetStats = () => {
    setResults([])
    setTotalPulls(0)
    setTotalCrystals(0)
    setStar4Count(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-soft border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 text-gradient-gold mb-4">轉蛋模擬器</h1>
          <p className="text-sekai-silver">
            模擬抽卡體驗，不花任何水晶！
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Gacha Selection & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Gacha Selection */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">選擇卡池</h2>
              <select
                className="input w-full"
                value={selectedGacha?.id || ''}
                onChange={(e) => {
                  const gacha = gachas.find(g => g.id === Number(e.target.value))
                  setSelectedGacha(gacha || null)
                }}
              >
                {gachas.slice(0, 20).map((gacha) => (
                  <option key={gacha.id} value={gacha.id}>
                    {gacha.name}
                  </option>
                ))}
              </select>

              {selectedGacha && (
                <div className="mt-4">
                  <div className="aspect-[2/1] rounded-lg overflow-hidden bg-sekai-charcoal">
                    <img
                      src={getGachaBannerUrl(selectedGacha.assetbundleName)}
                      alt={selectedGacha.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="mt-3 text-sm text-sekai-mist">
                    {new Date(selectedGacha.startAt).toLocaleDateString('zh-TW')} ~ {new Date(selectedGacha.endAt).toLocaleDateString('zh-TW')}
                  </div>
                </div>
              )}
            </div>

            {/* Pull Buttons */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">抽卡</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => simulatePull(1)}
                  disabled={showAnimation}
                  className="flex-1 btn-secondary"
                >
                  <div className="text-lg font-bold">單抽</div>
                  <div className="text-xs text-sekai-mist">300 💎</div>
                </button>
                <button
                  onClick={() => simulatePull(10)}
                  disabled={showAnimation}
                  className="flex-1 btn-primary"
                >
                  <div className="text-lg font-bold">十連</div>
                  <div className="text-xs opacity-80">3000 💎</div>
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-3">統計</h2>
                <button
                  onClick={resetStats}
                  className="text-sm text-sekai-silver hover:text-gold-soft transition-colors"
                >
                  重置
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sekai-mist">總抽數</span>
                  <span className="text-sekai-pearl font-bold">{totalPulls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sekai-mist">消耗水晶</span>
                  <span className="text-sekai-pearl font-bold">{totalCrystals.toLocaleString()} 💎</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sekai-mist">★4 數量</span>
                  <span className="text-gold-soft font-bold">{star4Count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sekai-mist">★4 機率</span>
                  <span className={`font-bold ${
                    totalPulls > 0 && (star4Count / totalPulls) > 0.03 
                      ? 'text-green-400' 
                      : 'text-sekai-pearl'
                  }`}>
                    {totalPulls > 0 ? ((star4Count / totalPulls) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                
                {totalPulls > 0 && (
                  <div className="pt-4 border-t border-sekai-ash/30">
                    <div className="text-xs text-sekai-mist mb-2">期望值比較</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-sekai-charcoal rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-gold-dim to-gold-soft rounded-full transition-all"
                          style={{ width: `${Math.min((star4Count / totalPulls) / 0.03 * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-sekai-silver">
                        {((star4Count / totalPulls) / 0.03 * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-sekai-mist mt-1">
                      相對於 3% 基礎機率
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rates Info */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">機率說明</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gold-soft">★4</span>
                  <span className="text-sekai-pearl">3.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">★3</span>
                  <span className="text-sekai-pearl">8.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">★2</span>
                  <span className="text-sekai-pearl">88.5%</span>
                </div>
                <div className="pt-2 mt-2 border-t border-sekai-ash/30 text-sekai-mist text-xs">
                  * 十連保底至少一張 ★3 以上
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="heading-3 mb-6">抽卡結果</h2>
              
              {showAnimation ? (
                <div className="flex items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gold-dim to-gold-soft animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-sekai-void" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">✨</span>
                    </div>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map((result, index) => {
                    const rarityColor = RARITY_COLORS[result.card.cardRarityType] || RARITY_COLORS.rarity_2
                    const rarityName = RARITY_NAMES[result.card.cardRarityType] || '★?'
                    const isStar4 = result.card.cardRarityType === 'rarity_4'

                    return (
                      <div
                        key={`${result.card.id}-${index}`}
                        className={`relative rounded-xl overflow-hidden ${
                          isStar4 ? 'ring-2 ring-gold-soft animate-pulse' : ''
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Card Image */}
                        <div className={`aspect-square bg-gradient-to-br ${rarityColor}`}>
                          <img
                            src={getCardThumbnailUrl(result.card.assetbundleName)}
                            alt={result.card.prefix}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Rarity Badge */}
                        <div className={`absolute top-1 left-1 px-1.5 py-0.5 text-xs font-bold rounded bg-gradient-to-r ${rarityColor} text-white`}>
                          {rarityName}
                        </div>

                        {/* New Badge */}
                        {result.isNew && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 text-xs font-bold rounded bg-red-500 text-white">
                            NEW
                          </div>
                        )}

                        {/* Character Name */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <div className="text-xs text-white truncate">
                            {CHARACTER_NAMES_TW[result.card.characterId]}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-20 text-sekai-mist">
                  <svg className="w-20 h-20 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg">點擊上方按鈕開始抽卡</p>
                  <p className="text-sm mt-2">模擬抽卡不會消耗任何資源</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
