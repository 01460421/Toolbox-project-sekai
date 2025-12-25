'use client'

import { useState, useMemo } from 'react'
import { calculatePT, calculateGamePlan, calculateRequiredScore, formatNumber, COMMON_BONUSES, SCORE_CONTROL_PRESETS, type ScoreControlData } from '@/lib/score-control'
import scoreControlDataRaw from '@/lib/score-control-data.json'

const scoreControlData = scoreControlDataRaw as ScoreControlData

export default function ScoreCalculatorPage() {
  // 基本設定
  const [score, setScore] = useState(800000)
  const [bonus, setBonus] = useState(2.50)
  const [boostMultiplier, setBoostMultiplier] = useState<1 | 2 | 3>(1)
  
  // 衝榜規劃
  const [targetPT, setTargetPT] = useState(1000000)
  const [currentPT, setCurrentPT] = useState(0)
  
  // 反向計算
  const [targetPTReverse, setTargetPTReverse] = useState(300)
  
  // 控分協助
  const [controlMode, setControlMode] = useState<'exact' | 'range'>('exact')
  const [targetSinglePT, setTargetSinglePT] = useState(350)

  // 計算結果
  const ptResult = useMemo(() => calculatePT(score, bonus), [score, bonus])
  const gamePlan = useMemo(() => calculateGamePlan(targetPT, currentPT, score, bonus, boostMultiplier), [targetPT, currentPT, score, bonus, boostMultiplier])
  const reverseResult = useMemo(() => calculateRequiredScore(targetPTReverse, bonus), [targetPTReverse, bonus])

  // 從真實資料查找PT
  const realPT = useMemo(() => {
    const scoreIndex = scoreControlData.scoreRanges.findIndex(r => score >= r.min && score <= r.max)
    const bonusIndex = scoreControlData.bonuses.findIndex(b => Math.abs(b - bonus) < 0.001)
    if (scoreIndex === -1 || bonusIndex === -1) return null
    return scoreControlData.ptTable[scoreIndex]?.[bonusIndex] ?? null
  }, [score, bonus])

  // 控分協助：找出達到目標PT的分數區間
  const controlSuggestions = useMemo(() => {
    const bonusIndex = scoreControlData.bonuses.findIndex(b => Math.abs(b - bonus) < 0.001)
    if (bonusIndex === -1) return []
    
    const results: { scoreRange: { min: number; max: number }; pt: number; basePT: number }[] = []
    
    for (let i = 0; i < scoreControlData.ptTable.length; i++) {
      const pt = scoreControlData.ptTable[i][bonusIndex]
      if (controlMode === 'exact') {
        if (pt === targetSinglePT) {
          results.push({ scoreRange: scoreControlData.scoreRanges[i], pt, basePT: 100 + i })
        }
      } else {
        // 範圍模式：找接近的
        if (Math.abs(pt - targetSinglePT) <= 10) {
          results.push({ scoreRange: scoreControlData.scoreRanges[i], pt, basePT: 100 + i })
        }
      }
    }
    return results
  }, [bonus, targetSinglePT, controlMode])

  // 計算不同倍率的結果
  const boostResults = useMemo(() => {
    return [1, 2, 3].map(mult => ({
      multiplier: mult,
      pt: ptResult.finalPT * mult,
      games: gamePlan.remaining > 0 ? Math.ceil(gamePlan.remaining / (ptResult.finalPT * mult)) : 0
    }))
  }, [ptResult.finalPT, gamePlan.remaining])

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-8">
          <h1 className="heading-2">控分計算器</h1>
          <p className="mt-2 text-sekai-silver">PT 計算、場次規劃、控分協助</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左側：輸入區 */}
          <div className="space-y-6">
            {/* 基本設定 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">📊 基本設定</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">遊玩分數</label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="input"
                    step="10000"
                  />
                  <p className="text-xs text-sekai-mist mt-1">
                    分數區間: {formatNumber(ptResult.scoreRange.min)} ~ {formatNumber(ptResult.scoreRange.max)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-sekai-silver mb-2">
                    編成ボーナス: <span className="text-gold-soft">{(bonus * 100).toFixed(0)}%</span>
                  </label>
                  <input
                    type="range"
                    value={bonus * 100}
                    onChange={(e) => setBonus(Number(e.target.value) / 100)}
                    min="0"
                    max="715"
                    step="1"
                    className="w-full accent-gold-soft"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMMON_BONUSES.map(b => (
                      <button
                        key={b.value}
                        onClick={() => setBonus(b.value)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          Math.abs(bonus - b.value) < 0.001
                            ? 'bg-gold-dim/20 text-gold-soft'
                            : 'bg-sekai-charcoal text-sekai-silver hover:text-gold-soft'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-sekai-silver mb-2">倍率</label>
                  <div className="flex gap-2">
                    {([1, 2, 3] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setBoostMultiplier(m)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          boostMultiplier === m
                            ? 'bg-gold-dim/20 text-gold-soft border border-gold-dim/50'
                            : 'bg-sekai-charcoal text-sekai-silver hover:text-gold-soft'
                        }`}
                      >
                        {m}倍
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 控分協助 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">🎯 控分協助</h2>
              <p className="text-sm text-sekai-silver mb-4">輸入目標單場 PT，找出需要的分數區間</p>
              
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setControlMode('exact')}
                  className={`flex-1 py-2 rounded text-sm transition-colors ${
                    controlMode === 'exact' ? 'bg-gold-dim/20 text-gold-soft' : 'bg-sekai-charcoal text-sekai-silver'
                  }`}
                >
                  精確匹配
                </button>
                <button
                  onClick={() => setControlMode('range')}
                  className={`flex-1 py-2 rounded text-sm transition-colors ${
                    controlMode === 'range' ? 'bg-gold-dim/20 text-gold-soft' : 'bg-sekai-charcoal text-sekai-silver'
                  }`}
                >
                  範圍搜尋 (±10)
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-sekai-silver mb-2">目標單場 PT</label>
                <input
                  type="number"
                  value={targetSinglePT}
                  onChange={(e) => setTargetSinglePT(Number(e.target.value))}
                  className="input"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {SCORE_CONTROL_PRESETS.common.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setTargetSinglePT(p.value)}
                      className={`px-2 py-1 rounded text-xs ${
                        targetSinglePT === p.value ? 'bg-gold-dim/20 text-gold-soft' : 'bg-sekai-charcoal text-sekai-silver'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {controlSuggestions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {controlSuggestions.map((s, i) => (
                    <div key={i} className="p-3 rounded-lg bg-sekai-charcoal/50 flex justify-between items-center">
                      <div>
                        <p className="font-mono text-sm text-sekai-pearl">
                          {formatNumber(s.scoreRange.min)} ~ {formatNumber(s.scoreRange.max)}
                        </p>
                        <p className="text-xs text-sekai-mist">basePT: {s.basePT}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gold-soft">{s.pt} pt</p>
                        <p className="text-xs text-sekai-mist">{boostMultiplier}倍 = {s.pt * boostMultiplier}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-sekai-charcoal/30 text-center text-sekai-mist text-sm">
                  找不到符合的分數區間，請調整目標或 bonus
                </div>
              )}
            </div>

            {/* 衝榜規劃 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">📈 衝榜規劃</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">目標總 PT</label>
                  <input
                    type="number"
                    value={targetPT}
                    onChange={(e) => setTargetPT(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">目前累計 PT</label>
                  <input
                    type="number"
                    value={currentPT}
                    onChange={(e) => setCurrentPT(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {SCORE_CONTROL_PRESETS.rankingTargets.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setTargetPT(p.value)}
                    className={`px-2 py-1 rounded text-xs ${
                      targetPT === p.value ? 'bg-gold-dim/20 text-gold-soft' : 'bg-sekai-charcoal text-sekai-silver'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右側：結果區 */}
          <div className="space-y-6">
            {/* 單場 PT 結果 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">⚡ 單場 PT</h2>
              
              <div className="p-4 rounded-lg bg-gradient-to-br from-sekai-charcoal/60 to-sekai-ink/80 border border-gold-dim/20 text-center mb-4">
                <p className="text-sm text-sekai-silver">基礎 PT (basePT)</p>
                <p className="text-4xl font-mono font-bold text-sekai-pearl mt-1">{ptResult.basePT}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {boostResults.map(r => (
                  <div 
                    key={r.multiplier}
                    className={`p-3 rounded-lg text-center ${
                      r.multiplier === boostMultiplier
                        ? 'bg-gold-dim/20 border border-gold-dim/50'
                        : 'bg-sekai-charcoal/50'
                    }`}
                  >
                    <p className="text-xs text-sekai-silver">{r.multiplier}倍</p>
                    <p className={`text-2xl font-mono font-bold mt-1 ${
                      r.multiplier === boostMultiplier ? 'text-gold-soft' : 'text-sekai-pearl'
                    }`}>
                      {r.pt}
                    </p>
                  </div>
                ))}
              </div>

              {realPT && realPT !== ptResult.finalPT && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ 實際資料 PT: {realPT} (公式計算: {ptResult.finalPT})
                  </p>
                </div>
              )}

              <div className="mt-4 p-3 rounded-lg bg-sekai-charcoal/30">
                <p className="text-xs text-sekai-mist">
                  計算: {ptResult.basePT} × (1 + {(bonus * 100).toFixed(0)}%) = {ptResult.finalPT}
                </p>
              </div>
            </div>

            {/* 場次規劃結果 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">📊 場次規劃</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-sekai-charcoal/50">
                  <span className="text-sekai-silver">剩餘 PT</span>
                  <span className="font-mono text-xl text-sekai-pearl">{formatNumber(gamePlan.remaining)}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-sekai-charcoal/50">
                  <span className="text-sekai-silver">每場獲得 ({boostMultiplier}倍)</span>
                  <span className="font-mono text-xl text-gold-soft">{formatNumber(gamePlan.ptPerGame)}</span>
                </div>

                <div className="divider-gold my-4" />

                <div className="p-4 rounded-lg bg-gradient-to-br from-gold-dim/10 to-sekai-charcoal/60 border border-gold-dim/30 text-center">
                  <p className="text-sm text-sekai-silver">需要場次</p>
                  <p className="text-5xl font-mono font-bold text-gradient-gold mt-2">{formatNumber(gamePlan.gamesNeeded)}</p>
                  <p className="text-xs text-sekai-mist mt-2">
                    可獲得 {formatNumber(gamePlan.totalPTFromGames)} PT
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {boostResults.map(r => (
                    <div 
                      key={r.multiplier}
                      className={`p-2 rounded text-center ${
                        r.multiplier === boostMultiplier ? 'bg-gold-dim/10 border border-gold-dim/30' : 'bg-sekai-charcoal/30'
                      }`}
                    >
                      <p className="text-xs text-sekai-mist">{r.multiplier}倍</p>
                      <p className={`font-mono font-bold ${r.multiplier === boostMultiplier ? 'text-gold-soft' : 'text-sekai-silver'}`}>
                        {formatNumber(r.games)} 場
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 時間估算 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">⏱ 時間估算</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                  <p className="text-xs text-sekai-silver">2分鐘/場</p>
                  <p className="text-xl font-mono text-sekai-pearl mt-1">
                    {(gamePlan.gamesNeeded * 2 / 60).toFixed(1)} 小時
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-sekai-charcoal/50 text-center">
                  <p className="text-xs text-sekai-silver">3分鐘/場</p>
                  <p className="text-xl font-mono text-sekai-pearl mt-1">
                    {(gamePlan.gamesNeeded * 3 / 60).toFixed(1)} 小時
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-gold-dim/5 border border-gold-dim/20">
                <p className="text-sm text-gold-soft">💡 效率提示</p>
                <p className="text-xs text-sekai-silver mt-1">
                  使用 3 倍可減少 {formatNumber(boostResults[0].games - boostResults[2].games)} 場次
                  （節省約 {((boostResults[0].games - boostResults[2].games) * 2 / 60).toFixed(1)} 小時）
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
