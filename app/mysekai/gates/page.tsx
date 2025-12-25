'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchMysekaiGates, fetchMysekaiGateLevels, fetchMysekaiGateLevelMaterialCosts, getMysekaiGateImageUrl } from '@/lib/api'
import { UNIT_NAMES_TW, type UnitId } from '@/lib/types'

interface Gate {
  id: number
  seq: number
  name: string
  unit: string
  assetbundleName: string
}

interface GateLevel {
  mysekaiGateId: number
  level: number
  power1BonusRate: number
  power2BonusRate: number
  power3BonusRate: number
  power1AllMatchBonusRate: number
  power2AllMatchBonusRate: number
  power3AllMatchBonusRate: number
  maxVisitorCount?: number
}

interface MaterialCost {
  mysekaiGateId: number
  level: number
  mysekaiMaterialId: number
  quantity: number
}

const UNIT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'piapro': { bg: 'from-unit-ln/20 to-unit-ln/5', border: 'border-unit-ln/50', text: 'text-unit-ln' },
  'light_sound': { bg: 'from-unit-ln/20 to-unit-ln/5', border: 'border-unit-ln/50', text: 'text-unit-ln' },
  'idol': { bg: 'from-unit-mmj/20 to-unit-mmj/5', border: 'border-unit-mmj/50', text: 'text-unit-mmj' },
  'street': { bg: 'from-unit-vbs/20 to-unit-vbs/5', border: 'border-unit-vbs/50', text: 'text-unit-vbs' },
  'theme_park': { bg: 'from-unit-wxs/20 to-unit-wxs/5', border: 'border-unit-wxs/50', text: 'text-unit-wxs' },
  'school_refusal': { bg: 'from-unit-niigo/20 to-unit-niigo/5', border: 'border-unit-niigo/50', text: 'text-unit-niigo' },
}

const UNIT_DISPLAY_NAMES: Record<string, string> = {
  'piapro': 'VIRTUAL SINGER',
  'light_sound': 'Leo/need',
  'idol': 'MORE MORE JUMP!',
  'street': 'Vivid BAD SQUAD',
  'theme_park': 'Wonderlands×Showtime',
  'school_refusal': '25時，在Night Code。',
}

export default function GatesPage() {
  const [gates, setGates] = useState<Gate[]>([])
  const [gateLevels, setGateLevels] = useState<GateLevel[]>([])
  const [materialCosts, setMaterialCosts] = useState<MaterialCost[]>([])
  const [loading, setLoading] = useState(true)
  const [userLevels, setUserLevels] = useState<Record<number, number>>({})

  useEffect(() => {
    async function loadData() {
      try {
        const [gatesData, levelsData, costsData] = await Promise.all([
          fetchMysekaiGates(),
          fetchMysekaiGateLevels().catch(() => []),
          fetchMysekaiGateLevelMaterialCosts().catch(() => [])
        ])
        setGates(gatesData.sort((a: Gate, b: Gate) => a.seq - b.seq))
        setGateLevels(levelsData)
        setMaterialCosts(costsData)
        
        // Initialize user levels
        const initialLevels: Record<number, number> = {}
        gatesData.forEach((g: Gate) => { initialLevels[g.id] = 1 })
        setUserLevels(initialLevels)
      } catch (error) {
        console.error('Failed to load gates:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('mysekai-gate-levels')
    if (saved) setUserLevels(JSON.parse(saved))
  }, [])

  const updateLevel = (gateId: number, level: number) => {
    const newLevels = { ...userLevels, [gateId]: Math.max(1, Math.min(15, level)) }
    setUserLevels(newLevels)
    localStorage.setItem('mysekai-gate-levels', JSON.stringify(newLevels))
  }

  const getGateLevelData = (gateId: number, level: number) => {
    return gateLevels.find(gl => gl.mysekaiGateId === gateId && gl.level === level)
  }

  const getMaxLevel = (gateId: number) => {
    const levels = gateLevels.filter(gl => gl.mysekaiGateId === gateId)
    return levels.length > 0 ? Math.max(...levels.map(l => l.level)) : 15
  }

  const getTotalBonus = useMemo(() => {
    let totalBonus = 0
    gates.forEach(gate => {
      const level = userLevels[gate.id] || 1
      const levelData = getGateLevelData(gate.id, level)
      if (levelData) {
        totalBonus += (levelData.power1BonusRate + levelData.power2BonusRate + levelData.power3BonusRate)
      }
    })
    return totalBonus
  }, [gates, userLevels, gateLevels])

  const getUnitColor = (unit: string) => {
    return UNIT_COLORS[unit] || { bg: 'from-sekai-charcoal to-sekai-ink', border: 'border-sekai-ash/50', text: 'text-sekai-silver' }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-sekai-silver">載入門資料中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
              MySEKAI 門
            </span>
          </h1>
          <p className="mt-2 text-sekai-silver">各團體之門等級與綜合力加成計算</p>
        </div>

        {/* Total Bonus */}
        <div className="card p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
          <div className="text-center relative">
            <p className="text-sm text-sekai-silver mb-2">總綜合力加成率</p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              +{(getTotalBonus / 100).toFixed(1)}%
            </p>
            <p className="text-xs text-sekai-mist mt-2">
              適用於同團隊卡片
            </p>
          </div>
        </div>

        {/* Gates Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gates.map((gate) => {
            const level = userLevels[gate.id] || 1
            const maxLevel = getMaxLevel(gate.id)
            const levelData = getGateLevelData(gate.id, level)
            const colors = getUnitColor(gate.unit)
            const progress = (level / maxLevel) * 100
            const bonusRate = levelData 
              ? (levelData.power1BonusRate + levelData.power2BonusRate + levelData.power3BonusRate) / 100
              : 0

            return (
              <div
                key={gate.id}
                className={`card p-6 border-2 ${colors.border} relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sekai-pearl text-lg">{gate.name}</h3>
                      <p className={`text-sm ${colors.text}`}>
                        {UNIT_DISPLAY_NAMES[gate.unit] || gate.unit}
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-sekai-charcoal/50 flex items-center justify-center overflow-hidden border border-sekai-ash/20">
                      <img
                        src={getMysekaiGateImageUrl(gate.assetbundleName)}
                        alt={gate.name}
                        className="w-14 h-14 object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          img.style.display = 'none'
                          img.parentElement!.innerHTML = '🚪'
                        }}
                      />
                    </div>
                  </div>

                  {/* Level Control */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-sekai-silver">等級</span>
                      <span className={`text-lg font-bold ${colors.text}`}>Lv. {level}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={maxLevel}
                      value={level}
                      onChange={(e) => updateLevel(gate.id, Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                    <div className="flex justify-between text-xs text-sekai-mist mt-1">
                      <span>1</span>
                      <span>{maxLevel}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="progress-bar h-2">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                      <p className="text-xs text-sekai-silver">綜合力加成</p>
                      <p className={`text-lg font-bold ${colors.text}`}>
                        +{bonusRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                      <p className="text-xs text-sekai-silver">訪客數上限</p>
                      <p className="text-lg font-bold text-sekai-pearl">
                        {levelData?.maxVisitorCount || Math.min(2 + Math.floor(level / 3), 5)}
                      </p>
                    </div>
                  </div>

                  {/* Level Details */}
                  {levelData && (
                    <div className="mt-3 pt-3 border-t border-sekai-ash/30 text-xs text-sekai-mist">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <span className="text-pink-400">表現</span>
                          <span className="ml-1">+{(levelData.power1BonusRate / 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-center">
                          <span className="text-yellow-400">技巧</span>
                          <span className="ml-1">+{(levelData.power2BonusRate / 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-center">
                          <span className="text-blue-400">耐久</span>
                          <span className="ml-1">+{(levelData.power3BonusRate / 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Info */}
        <div className="mt-8 card p-6">
          <h3 className="heading-section mb-4">門的功能</h3>
          <div className="grid sm:grid-cols-2 gap-6 text-sm text-sekai-silver">
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">🚪 角色訪問</h4>
              <p>每天 05:00 和 17:00 (JST) 會有角色通過門來訪問您的 MySEKAI。等級越高，同時來訪的角色數量上限越高。</p>
            </div>
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">💎 回憶碎片</h4>
              <p>與來訪的角色對話可以獲得該角色的回憶碎片 (Memoria)，每天每個角色限定一次。</p>
            </div>
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">📈 綜合力加成</h4>
              <p>升級門可以增加對應團體卡片的綜合力加成。Virtual Singer 卡片會根據其支援團體獲得加成。</p>
            </div>
            <div>
              <h4 className="font-medium text-sekai-pearl mb-2">🔄 門的切換</h4>
              <p>可以手動切換不同團體的門，但切換後需等待 24 小時才能再次更換。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
