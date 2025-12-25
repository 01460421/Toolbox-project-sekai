'use client'

import { useState, useMemo } from 'react'
import { estimateLevelUpSpeed } from '@/lib/bonds'

export default function LevelSpeedPage() {
  const [currentLevel, setCurrentLevel] = useState(50)
  const [targetLevel, setTargetLevel] = useState(100)
  const [dailyHours, setDailyHours] = useState(2)
  const [gameMinutes, setGameMinutes] = useState(3)

  const estimates = useMemo(() => {
    const targets = [50, 75, 100, 125, 150, 175, 200].filter(t => t > currentLevel)
    return targets.map(target => ({
      target,
      ...estimateLevelUpSpeed(currentLevel, target, dailyHours, gameMinutes)
    }))
  }, [currentLevel, dailyHours, gameMinutes])

  const mainEstimate = useMemo(() => {
    return estimateLevelUpSpeed(currentLevel, targetLevel, dailyHours, gameMinutes)
  }, [currentLevel, targetLevel, dailyHours, gameMinutes])

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">升等速度預估</h1>
          <p className="mt-2 text-sekai-silver">根據每日遊玩時間預估達成目標所需天數</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="heading-section mb-4">設定</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">目前等級</label>
                  <input
                    type="number"
                    min="1"
                    max="199"
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">目標等級</label>
                  <input
                    type="number"
                    min={currentLevel + 1}
                    max="200"
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">每日遊玩時間 (小時)</label>
                  <input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">每場時間 (分鐘)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={gameMinutes}
                    onChange={(e) => setGameMinutes(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-sm text-sekai-silver">快速設定：</span>
                {[1, 2, 3, 4, 5].map((h) => (
                  <button
                    key={h}
                    onClick={() => setDailyHours(h)}
                    className={`px-3 py-1 rounded text-sm ${
                      dailyHours === h
                        ? 'bg-gold-dim/20 text-gold-soft'
                        : 'bg-sekai-charcoal text-sekai-silver hover:text-gold-soft'
                    }`}
                  >
                    {h}h/日
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="heading-section mb-4">各目標預估</h2>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>目標等級</th>
                      <th className="text-right">需要場次</th>
                      <th className="text-right">需要天數</th>
                      <th className="text-right">需要週數</th>
                      <th className="text-right">體力消耗</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimates.map((est) => (
                      <tr key={est.target} className={est.target === targetLevel ? 'bg-gold-dim/10' : ''}>
                        <td className={est.target === targetLevel ? 'text-gold-soft font-medium' : ''}>
                          Lv.{est.target}
                        </td>
                        <td className="text-right number-md">{est.gamesRequired.toLocaleString()}</td>
                        <td className="text-right number-md">{est.daysRequired}</td>
                        <td className="text-right text-sekai-silver">{est.weeksRequired}</td>
                        <td className="text-right text-sekai-silver">{est.staminaRequired.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <h2 className="heading-section mb-6">Lv.{currentLevel} → Lv.{targetLevel}</h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-sekai-charcoal/60 to-sekai-ink/80 border border-gold-dim/20 text-center">
                  <p className="text-sm text-sekai-silver">預估天數</p>
                  <p className="text-4xl font-mono font-bold text-gradient-gold mt-1">{mainEstimate.daysRequired}</p>
                  <p className="text-sm text-sekai-mist mt-1">約 {mainEstimate.weeksRequired} 週</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                    <p className="text-xs text-sekai-silver">總場次</p>
                    <p className="number-lg mt-1">{mainEstimate.gamesRequired.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                    <p className="text-xs text-sekai-silver">總體力</p>
                    <p className="number-lg mt-1">{mainEstimate.staminaRequired.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gold-dim/5 border border-gold-dim/20">
                  <p className="text-sm text-gold-soft mb-2">📊 每日進度</p>
                  <p className="text-sekai-silver text-sm">
                    每天 {dailyHours} 小時 ≈ {Math.floor((dailyHours * 60) / gameMinutes)} 場
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
