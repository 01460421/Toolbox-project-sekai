'use client'

import { useState, useMemo } from 'react'
import { CHARACTER_NAMES_TW, CHARACTER_UNIT, UNIT_SHORT_NAMES, type UnitId } from '@/lib/types'
import { calculateCRProgress } from '@/lib/bonds'

const unitColors: Record<UnitId, string> = {
  ln: 'text-unit-ln',
  mmj: 'text-unit-mmj',
  vbs: 'text-unit-vbs',
  wxs: 'text-unit-wxs',
  niigo: 'text-unit-niigo',
  vs: 'text-unit-vs',
}

export default function CharacterRankPage() {
  const [selectedChar, setSelectedChar] = useState(1)
  const [currentLevel, setCurrentLevel] = useState(50)
  const [currentExp, setCurrentExp] = useState(0)
  const [targetLevel, setTargetLevel] = useState(100)

  const calculation = useMemo(() => {
    return calculateCRProgress(currentLevel, currentExp, targetLevel)
  }, [currentLevel, currentExp, targetLevel])

  const charUnit = CHARACTER_UNIT[selectedChar]

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">CR 等級規劃</h1>
          <p className="mt-2 text-sekai-silver">角色等級升級需求與綜合力加成</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="heading-section mb-4">選擇角色</h2>
              
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                {Object.entries(CHARACTER_NAMES_TW).map(([id, name]) => {
                  const charId = Number(id)
                  const unit = CHARACTER_UNIT[charId]
                  const isSelected = selectedChar === charId

                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedChar(charId)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        isSelected
                          ? 'bg-gold-dim/20 border border-gold-dim/50'
                          : 'bg-sekai-charcoal hover:bg-sekai-ash/50'
                      }`}
                    >
                      <div className={`text-xs font-medium truncate ${isSelected ? 'text-gold-soft' : unitColors[unit]}`}>
                        {name.slice(0, 2)}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-sekai-charcoal/50 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gold-dim/20 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <h3 className="text-lg font-medium text-sekai-pearl">{CHARACTER_NAMES_TW[selectedChar]}</h3>
                  <p className={`text-sm ${unitColors[charUnit]}`}>{UNIT_SHORT_NAMES[charUnit]}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="heading-section mb-4">等級設定</h2>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">目前等級</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">目標等級</label>
                  <input
                    type="number"
                    min={currentLevel}
                    max="200"
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[50, 75, 100, 150, 200].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setTargetLevel(lv)}
                    disabled={lv <= currentLevel}
                    className={`px-3 py-1 rounded text-sm ${
                      targetLevel === lv
                        ? 'bg-gold-dim/20 text-gold-soft'
                        : lv <= currentLevel
                        ? 'bg-sekai-charcoal/30 text-sekai-mist cursor-not-allowed'
                        : 'bg-sekai-charcoal text-sekai-silver hover:text-gold-soft'
                    }`}
                  >
                    Lv.{lv}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <h2 className="heading-section mb-6">計算結果</h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-sekai-charcoal/60 to-sekai-ink/80 border border-gold-dim/20 text-center">
                  <p className="text-sm text-sekai-silver">綜合力增加</p>
                  <p className="text-3xl font-mono font-bold text-gradient-gold mt-1">+{calculation.powerIncrease.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                    <p className="text-xs text-sekai-silver">需要經驗</p>
                    <p className="number-lg mt-1">{calculation.requiredExp.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                    <p className="text-xs text-sekai-silver">預估場次</p>
                    <p className="number-lg mt-1">{calculation.estimatedGames.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                    <p className="text-xs text-sekai-silver">預估時間</p>
                    <p className="number-lg mt-1">{calculation.estimatedHours.toFixed(1)}h</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                    <p className="text-xs text-sekai-silver">等級差</p>
                    <p className="number-lg mt-1">+{targetLevel - currentLevel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
