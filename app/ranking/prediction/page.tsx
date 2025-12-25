'use client'

import { useState, useMemo } from 'react'
import { predictBorder, formatScore } from '@/lib/ranking'

interface PredictionInput {
  rank: number
  currentScore: number
  label: string
}

export default function PredictionPage() {
  const [elapsedHours, setElapsedHours] = useState(48)
  const [totalHours, setTotalHours] = useState(120)
  const [borders, setBorders] = useState<PredictionInput[]>([
    { rank: 100, currentScore: 15000000, label: 'T100' },
    { rank: 1000, currentScore: 8000000, label: 'T1000' },
    { rank: 5000, currentScore: 4000000, label: 'T5000' },
    { rank: 10000, currentScore: 2000000, label: 'T10000' },
  ])

  const predictions = useMemo(() => {
    return borders.map((border) => ({
      ...border,
      prediction: predictBorder(
        border.rank,
        border.currentScore,
        elapsedHours,
        totalHours
      ),
    }))
  }, [borders, elapsedHours, totalHours])

  const updateBorderScore = (rank: number, score: number) => {
    setBorders(borders.map((b) => (b.rank === rank ? { ...b, currentScore: score } : b)))
  }

  const progress = (elapsedHours / totalHours) * 100

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">邊線預測</h1>
          <p className="mt-2 text-sekai-silver">根據目前分數預測活動結算邊線</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Time Settings */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">活動時間</h2>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">已經過時間 (小時)</label>
                  <input
                    type="number"
                    min="1"
                    max={totalHours - 1}
                    value={elapsedHours}
                    onChange={(e) => setElapsedHours(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">活動總時長 (小時)</label>
                  <input
                    type="number"
                    min="24"
                    max="240"
                    value={totalHours}
                    onChange={(e) => setTotalHours(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-sekai-mist mb-1">
                  <span>活動進度</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-sekai-mist mt-1">
                  <span>0h</span>
                  <span>剩餘 {totalHours - elapsedHours}h</span>
                  <span>{totalHours}h</span>
                </div>
              </div>
            </div>

            {/* Current Borders Input */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">目前邊線分數</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {borders.map((border) => (
                  <div key={border.rank}>
                    <label className="block text-sm text-sekai-silver mb-2">{border.label} (#{border.rank})</label>
                    <input
                      type="number"
                      value={border.currentScore}
                      onChange={(e) => updateBorderScore(border.rank, Number(e.target.value))}
                      className="input"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Predictions */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <h2 className="heading-section mb-6">預測結果</h2>
              
              <div className="space-y-4">
                {predictions.map(({ rank, label, currentScore, prediction }) => (
                  <div
                    key={rank}
                    className="p-4 rounded-lg bg-sekai-charcoal/50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sekai-pearl">{label}</span>
                      <span className={`tag text-xs ${
                        prediction.trend === 'accelerating' ? 'bg-unit-vbs/20 text-unit-vbs border-unit-vbs/30' :
                        prediction.trend === 'decelerating' ? 'bg-unit-mmj/20 text-unit-mmj border-unit-mmj/30' :
                        'bg-sekai-ash/20 text-sekai-silver border-sekai-ash/30'
                      }`}>
                        {prediction.trend === 'accelerating' ? '加速中' :
                         prediction.trend === 'decelerating' ? '減速中' : '穩定'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-sekai-mist">目前</p>
                        <p className="number-md">{formatScore(currentScore)}</p>
                      </div>
                      <div>
                        <p className="text-sekai-mist">預測</p>
                        <p className="number-md text-gold-soft">{formatScore(prediction.predictedFinal)}</p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-sekai-ash/30 flex justify-between text-xs">
                      <span className="text-sekai-mist">預測增量</span>
                      <span className="text-unit-ln">+{formatScore(prediction.predictedFinal - currentScore)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-gold-dim/5 border border-gold-dim/20">
                <p className="text-sm text-gold-soft mb-2">⚠️ 注意事項</p>
                <ul className="text-xs text-sekai-silver space-y-1">
                  <li>• 預測基於線性推算</li>
                  <li>• 活動後期通常會加速</li>
                  <li>• 實際結果可能有較大差異</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
