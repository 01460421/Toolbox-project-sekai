'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchGameCharacters, getCharacterIconUrl } from '@/lib/api'
import { CHARACTER_NAMES_TW, UNIT_NAMES_TW, CHARACTER_UNIT, type UnitId } from '@/lib/types'

interface PlushieSize {
  name: string
  bonus: number
  memoriaRequired: number
}

const PLUSHIE_SIZES: PlushieSize[] = [
  { name: 'S', bonus: 1, memoriaRequired: 30 },
  { name: 'M', bonus: 3, memoriaRequired: 100 },
  { name: 'L', bonus: 6, memoriaRequired: 300 },
]

const MAX_BONUS = 100

const UNIT_COLORS: Record<UnitId, string> = {
  'ln': 'from-unit-ln/20 to-unit-ln/5 border-unit-ln/30',
  'mmj': 'from-unit-mmj/20 to-unit-mmj/5 border-unit-mmj/30',
  'vbs': 'from-unit-vbs/20 to-unit-vbs/5 border-unit-vbs/30',
  'wxs': 'from-unit-wxs/20 to-unit-wxs/5 border-unit-wxs/30',
  'niigo': 'from-unit-niigo/20 to-unit-niigo/5 border-unit-niigo/30',
  'vs': 'from-unit-vs/20 to-unit-vs/5 border-unit-vs/30',
}

export default function DollsPage() {
  const [characters, setCharacters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [owned, setOwned] = useState<Record<number, string>>({}) // characterId -> size ('S', 'M', 'L' or '')
  const [filterUnit, setFilterUnit] = useState<UnitId | 'all'>('all')

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGameCharacters()
        // Filter only main characters (id 1-26)
        setCharacters(data.filter((c: any) => c.id >= 1 && c.id <= 26))
      } catch (error) {
        console.error('Failed to load characters:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('mysekai-dolls-owned')
    if (saved) setOwned(JSON.parse(saved))
  }, [])

  const updateOwned = (characterId: number, size: string) => {
    const newOwned = { ...owned }
    if (size === owned[characterId]) {
      delete newOwned[characterId]
    } else {
      newOwned[characterId] = size
    }
    setOwned(newOwned)
    localStorage.setItem('mysekai-dolls-owned', JSON.stringify(newOwned))
  }

  const filteredCharacters = useMemo(() => {
    if (filterUnit === 'all') return characters
    return characters.filter((c: any) => CHARACTER_UNIT[c.id as number] === filterUnit)
  }, [characters, filterUnit])

  const stats = useMemo(() => {
    let totalBonus = 0
    let totalMemoria = 0
    
    Object.entries(owned).forEach(([id, size]) => {
      const plushie = PLUSHIE_SIZES.find(p => p.name === size)
      if (plushie) {
        totalBonus += plushie.bonus
        totalMemoria += plushie.memoriaRequired
      }
    })

    return {
      totalBonus: Math.min(totalBonus, MAX_BONUS),
      remainingBonus: Math.max(0, MAX_BONUS - totalBonus),
      totalMemoria,
      collectedCount: Object.keys(owned).length,
    }
  }, [owned])

  const getCharacterUnit = (characterId: number): UnitId => {
    return CHARACTER_UNIT[characterId] || 'vs'
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-sekai-silver">載入角色資料中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400">
              MySEKAI 娃娃
            </span>
          </h1>
          <p className="mt-2 text-sekai-silver">追蹤您的角色娃娃收集與加成</p>
        </div>

        {/* Stats */}
        <div className="card p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5" />
          <div className="grid sm:grid-cols-4 gap-6 relative">
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">已收集</p>
              <p className="number-xl mt-1">{stats.collectedCount} / 26</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">當前加成</p>
              <p className="number-xl mt-1 text-pink-400">+{stats.totalBonus}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">剩餘可加</p>
              <p className="number-xl mt-1 text-sekai-mist">+{stats.remainingBonus}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">消耗回憶</p>
              <p className="number-xl mt-1 text-fuchsia-400">{stats.totalMemoria}</p>
            </div>
          </div>
          
          {/* Progress to max bonus */}
          <div className="mt-4 relative">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-sekai-silver">角色加成進度</span>
              <span className="text-pink-400">{stats.totalBonus} / {MAX_BONUS}</span>
            </div>
            <div className="progress-bar h-2">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all"
                style={{ width: `${(stats.totalBonus / MAX_BONUS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Size Legend */}
        <div className="card p-4 mb-6">
          <h3 className="text-sm font-medium text-sekai-pearl mb-3">娃娃尺寸與加成</h3>
          <div className="flex flex-wrap gap-4">
            {PLUSHIE_SIZES.map(size => (
              <div key={size.name} className="flex items-center gap-2 text-sm">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                  size.name === 'S' ? 'bg-emerald-500/20 text-emerald-400' :
                  size.name === 'M' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {size.name}
                </span>
                <span className="text-sekai-silver">
                  +{size.bonus} 加成 · {size.memoriaRequired} 回憶
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-sekai-mist mt-2">
            ※ 角色加成上限為 +{MAX_BONUS}，同一角色只計算最大尺寸的加成
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterUnit('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              filterUnit === 'all'
                ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-400 border border-pink-500/30'
                : 'bg-sekai-charcoal text-sekai-silver hover:text-pink-400 border border-transparent'
            }`}
          >
            全部
          </button>
          {(['ln', 'mmj', 'vbs', 'wxs', 'niigo', 'vs'] as UnitId[]).map(unit => (
            <button
              key={unit}
              onClick={() => setFilterUnit(unit)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filterUnit === unit
                  ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-400 border border-pink-500/30'
                  : 'bg-sekai-charcoal text-sekai-silver hover:text-pink-400 border border-transparent'
              }`}
            >
              {UNIT_NAMES_TW[unit]}
            </button>
          ))}
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCharacters.map((character: any) => {
            const ownedSize = owned[character.id] || ''
            const unit = getCharacterUnit(character.id)
            const plushie = PLUSHIE_SIZES.find(p => p.name === ownedSize)

            return (
              <div
                key={character.id}
                className={`card p-3 transition-all ${
                  ownedSize
                    ? `bg-gradient-to-br ${UNIT_COLORS[unit]} border-2`
                    : 'hover:border-pink-500/30'
                }`}
              >
                {/* Character Icon */}
                <div className="relative mb-3">
                  <div className="w-full aspect-square rounded-xl bg-sekai-charcoal/50 flex items-center justify-center overflow-hidden">
                    <img
                      src={getCharacterIconUrl(character.id)}
                      alt={CHARACTER_NAMES_TW[character.id]}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.style.display = 'none'
                        img.parentElement!.innerHTML = '🧸'
                      }}
                    />
                  </div>
                  {ownedSize && (
                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      ownedSize === 'S' ? 'bg-emerald-500 text-white' :
                      ownedSize === 'M' ? 'bg-blue-500 text-white' :
                      'bg-purple-500 text-white'
                    }`}>
                      {ownedSize}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-sm font-medium text-sekai-pearl text-center truncate mb-2">
                  {CHARACTER_NAMES_TW[character.id]}
                </h3>

                {/* Size Buttons */}
                <div className="flex gap-1 justify-center">
                  {PLUSHIE_SIZES.map(size => (
                    <button
                      key={size.name}
                      onClick={() => updateOwned(character.id, size.name)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        ownedSize === size.name
                          ? size.name === 'S' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                            size.name === 'M' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
                            'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-sekai-charcoal/50 text-sekai-silver hover:text-white hover:bg-sekai-charcoal'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>

                {/* Bonus */}
                {plushie && (
                  <div className="mt-2 text-center text-xs">
                    <span className="text-pink-400">+{plushie.bonus}</span>
                    <span className="text-sekai-mist"> 加成</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Info */}
        <div className="mt-8 card p-6">
          <h3 className="heading-section mb-4">娃娃系統說明</h3>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-sekai-silver">
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">🧸 娃娃製作</h4>
              <p>使用回憶碎片 (Memoria) 在工作檯製作角色娃娃。需要先獲得對應的藍圖。</p>
            </div>
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">📈 角色加成</h4>
              <p>放置娃娃可獲得對應角色的綜合力加成。加成上限為 +{MAX_BONUS}。</p>
            </div>
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">🎯 藍圖獲取</h4>
              <p>基礎藍圖可透過 MySEKAI 任務獲得，特殊服裝藍圖需要購買 MySEKAI Mission Pass。</p>
            </div>
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">💎 回憶碎片</h4>
              <p>與來訪角色對話每天可獲得 1 個該角色的回憶碎片，製作娃娃需要大量回憶碎片。</p>
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setOwned({})
              localStorage.removeItem('mysekai-dolls-owned')
            }}
            className="text-sm text-sekai-mist hover:text-unit-vbs"
          >
            重置所有收集
          </button>
        </div>
      </div>
    </div>
  )
}
