'use client'

import { useState, useMemo } from 'react'
import { CHARACTER_NAMES_TW, UNIT_MEMBERS, UNIT_SHORT_NAMES, type UnitId } from '@/lib/types'
import { calculateBondProgress, BOND_EXP_TABLE } from '@/lib/bonds'

export default function BondsPage() {
  const [char1, setChar1] = useState(1)
  const [char2, setChar2] = useState(2)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentExp, setCurrentExp] = useState(0)
  const [targetLevel, setTargetLevel] = useState(50)

  const calculation = useMemo(() => {
    return calculateBondProgress(currentLevel, currentExp, targetLevel)
  }, [currentLevel, currentExp, targetLevel])

  const char1Unit = Object.entries(UNIT_MEMBERS).find(([_, members]) => 
    members.includes(char1)
  )?.[0] as UnitId

  const char2Unit = Object.entries(UNIT_MEMBERS).find(([_, members]) => 
    members.includes(char2)
  )?.[0] as UnitId

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">羈絆計算</h1>
          <p className="mt-2 text-sekai-silver">計算羈絆升級所需經驗與時間</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="space-y-6">
            {/* Character Selection */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">選擇角色</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">角色 1</label>
                  <select
                    value={char1}
                    onChange={(e) => setChar1(Number(e.target.value))}
                    className="select"
                  >
                    {Object.entries(CHARACTER_NAMES_TW).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">角色 2</label>
                  <select
                    value={char2}
                    onChange={(e) => setChar2(Number(e.target.value))}
                    className="select"
                  >
                    {Object.entries(CHARACTER_NAMES_TW).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Selected Pair */}
              <div className="mt-4 p-4 rounded-lg bg-sekai-charcoal/50 flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full bg-unit-${char1Unit}/20 flex items-center justify-center text-2xl mb-2`}>
                    💕
                  </div>
                  <p className="text-sm text-sekai-pearl">{CHARACTER_NAMES_TW[char1]}</p>
                  <p className="text-xs text-sekai-mist">{UNIT_SHORT_NAMES[char1Unit]}</p>
                </div>
                
                <div className="text-2xl text-gold-dim">×</div>
                
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full bg-unit-${char2Unit}/20 flex items-center justify-center text-2xl mb-2`}>
                    💕
                  </div>
                  <p className="text-sm text-sekai-pearl">{CHARACTER_NAMES_TW[char2]}</p>
                  <p className="text-xs text-sekai-mist">{UNIT_SHORT_NAMES[char2Unit]}</p>
                </div>
              </div>
            </div>

            {/* Level Input */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">等級設定</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <label className="block text-sm text-sekai-silver mb-2">目前經驗</label>
                  <input
                    type="number"
                    min="0"
                    max={BOND_EXP_TABLE[currentLevel] - 1}
                    value={currentExp}
                    onChange={(e) => setCurrentExp(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-sekai-silver mb-2">目標等級</label>
                <input
                  type="range"
                  min={currentLevel}
                  max="200"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-sekai-mist mt-1">
                  <span>Lv.{currentLevel}</span>
                  <span className="text-gold-soft">Lv.{targetLevel}</span>
                  <span>Lv.200</span>
                </div>
              </div>

              {/* Quick Select */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[50, 100, 150, 200].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setTargetLevel(lv)}
                    className={`px-3 py-1 rounded text-sm ${
                      targetLevel === lv
                        ? 'bg-gold-dim/20 text-gold-soft'
                        : 'bg-sekai-charcoal text-sekai-silver hover:text-gold-soft'
                    }`}
                  >
                    Lv.{lv}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Main Stats */}
            <div className="card p-6">
              <h2 className="heading-section mb-6">計算結果</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-sekai-charcoal/50 text-center">
                  <p className="text-sm text-sekai-silver">需要經驗</p>
                  <p className="number-xl mt-1">{calculation.requiredExp.toLocaleString()}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-sekai-charcoal/50 text-center">
                  <p className="text-sm text-sekai-silver">預估場次</p>
                  <p className="number-xl mt-1">{calculation.estimatedGames.toLocaleString()}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-sekai-charcoal/50 text-center">
                  <p className="text-sm text-sekai-silver">預估時間</p>
                  <p className="number-xl mt-1">{calculation.estimatedHours.toFixed(1)}h</p>
                </div>
                
                <div className="p-4 rounded-lg bg-sekai-charcoal/50 text-center">
                  <p className="text-sm text-sekai-silver">獎勵數量</p>
                  <p className="number-xl mt-1">{calculation.rewards.length}</p>
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">途中獎勵</h2>
              
              {calculation.rewards.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {calculation.rewards.map((reward, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-sekai-charcoal/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {reward.rewardType === 'crystal' ? '💎' : 
                           reward.rewardType === 'honor' ? '🏅' : '⚡'}
                        </span>
                        <div>
                          <p className="text-sm text-sekai-pearl">{reward.description}</p>
                          <p className="text-xs text-sekai-mist">Lv.{reward.level}</p>
                        </div>
                      </div>
                      <span className="text-gold-soft">×{reward.amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sekai-mist py-8">
                  此區間無獎勵
                </p>
              )}
            </div>

            {/* Tips */}
            <div className="card p-6 bg-gold-dim/5 border-gold-dim/20">
              <h3 className="text-sm font-medium text-gold-soft mb-2">💡 提示</h3>
              <ul className="text-sm text-sekai-silver space-y-1">
                <li>• 每場 Live 約獲得 10 羈絆經驗</li>
                <li>• 使用雙倍道具可加快進度</li>
                <li>• 活動期間經驗加成更高效</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
