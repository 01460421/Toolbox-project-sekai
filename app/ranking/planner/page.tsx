'use client'

import { useState, useMemo } from 'react'
import { formatNumber } from '@/lib/score-control'

interface PlanResult {
  gamesNeeded: number
  totalStamina: number
  naturalRecovery: number
  staminaNeeded: number
  largeBottles: number   // 10能量飲料
  smallBottles: number   // 1能量飲料
  crystalsForStamina: number
  totalPlayTime: number  // 分鐘
}

export default function RankingPlannerPage() {
  // 基本設定
  const [targetPT, setTargetPT] = useState(1000000)
  const [currentPT, setCurrentPT] = useState(0)
  const [ptPerGame, setPtPerGame] = useState(350)
  const [boostMultiplier, setBoostMultiplier] = useState<1 | 2 | 3>(1)
  
  // 體力設定
  const [staminaPerGame, setStaminaPerGame] = useState(10) // 1倍=10, 2倍=20, 3倍=30
  const [currentStamina, setCurrentStamina] = useState(100)
  const [maxStamina, setMaxStamina] = useState(100)
  
  // 時間設定
  const [remainingHours, setRemainingHours] = useState(120) // 剩餘時間(小時)
  const [minutesPerGame, setMinutesPerGame] = useState(2.5)
  
  // 道具庫存
  const [largeBotlesOwned, setLargeBotlesOwned] = useState(100)
  const [smallBotlesOwned, setSmallBotlesOwned] = useState(50)
  
  // 計算實際消耗的體力
  const actualStaminaPerGame = staminaPerGame * boostMultiplier

  // 計算結果
  const result = useMemo<PlanResult>(() => {
    const remaining = Math.max(0, targetPT - currentPT)
    const effectivePT = ptPerGame * boostMultiplier
    const gamesNeeded = Math.ceil(remaining / effectivePT)
    
    const totalStamina = gamesNeeded * actualStaminaPerGame
    // 自然恢復：每5分鐘1點
    const naturalRecovery = Math.floor(remainingHours * 60 / 5)
    const staminaNeeded = Math.max(0, totalStamina - currentStamina - naturalRecovery)
    
    // 優先使用10能量飲料
    const largeBottles = Math.floor(staminaNeeded / 10)
    const smallBottles = staminaNeeded % 10
    
    // 如果道具不夠，計算需要的水晶
    const largeBottleDeficit = Math.max(0, largeBottles - largeBotlesOwned)
    const smallBottleDeficit = Math.max(0, smallBottles - smallBotlesOwned)
    // 假設用水晶補體力：50水晶 = maxStamina 點體力
    const staminaFromDeficit = largeBottleDeficit * 10 + smallBottleDeficit
    const crystalsForStamina = Math.ceil(staminaFromDeficit / maxStamina) * 50
    
    const totalPlayTime = gamesNeeded * minutesPerGame
    
    return {
      gamesNeeded,
      totalStamina,
      naturalRecovery,
      staminaNeeded,
      largeBottles,
      smallBottles,
      crystalsForStamina,
      totalPlayTime
    }
  }, [targetPT, currentPT, ptPerGame, boostMultiplier, actualStaminaPerGame, 
      remainingHours, currentStamina, maxStamina, largeBotlesOwned, smallBotlesOwned, minutesPerGame])

  // 不同倍率比較
  const boostComparison = useMemo(() => {
    return [1, 2, 3].map(mult => {
      const remaining = Math.max(0, targetPT - currentPT)
      const effectivePT = ptPerGame * mult
      const games = Math.ceil(remaining / effectivePT)
      const stamina = games * staminaPerGame * mult
      const time = games * minutesPerGame
      return { mult, games, stamina, time }
    })
  }, [targetPT, currentPT, ptPerGame, staminaPerGame, minutesPerGame])

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-8">
          <h1 className="heading-2">衝榜資源規劃</h1>
          <p className="mt-2 text-sekai-silver">計算所需場次、體力與能量飲料消耗</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左側：輸入 */}
          <div className="space-y-6">
            {/* PT 設定 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">🎯 目標設定</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">目標總 PT</label>
                  <input
                    type="number"
                    value={targetPT}
                    onChange={(e) => setTargetPT(Number(e.target.value))}
                    className="input"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[100000, 500000, 1000000, 5000000, 10000000].map(v => (
                      <button
                        key={v}
                        onClick={() => setTargetPT(v)}
                        className={`px-2 py-1 rounded text-xs ${
                          targetPT === v ? 'bg-gold-dim/20 text-gold-soft' : 'bg-sekai-charcoal text-sekai-silver'
                        }`}
                      >
                        {formatNumber(v)}
                      </button>
                    ))}
                  </div>
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
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">單場 PT (1倍)</label>
                  <input
                    type="number"
                    value={ptPerGame}
                    onChange={(e) => setPtPerGame(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">倍率</label>
                  <div className="flex gap-2">
                    {([1, 2, 3] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => {
                          setBoostMultiplier(m)
                          setStaminaPerGame(10) // 重置為基礎體力
                        }}
                        className={`flex-1 py-2 rounded text-sm ${
                          boostMultiplier === m
                            ? 'bg-gold-dim/20 text-gold-soft border border-gold-dim/50'
                            : 'bg-sekai-charcoal text-sekai-silver'
                        }`}
                      >
                        {m}倍
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 體力設定 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">⚡ 體力設定</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">每場體力 (1倍基礎)</label>
                  <input
                    type="number"
                    value={staminaPerGame}
                    onChange={(e) => setStaminaPerGame(Number(e.target.value))}
                    className="input"
                  />
                  <p className="text-xs text-sekai-mist mt-1">
                    {boostMultiplier}倍實際消耗: {actualStaminaPerGame}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">當前體力</label>
                  <input
                    type="number"
                    value={currentStamina}
                    onChange={(e) => setCurrentStamina(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">體力上限</label>
                  <input
                    type="number"
                    value={maxStamina}
                    onChange={(e) => setMaxStamina(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">剩餘時間 (小時)</label>
                  <input
                    type="number"
                    value={remainingHours}
                    onChange={(e) => setRemainingHours(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* 道具庫存 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">⚡ 能量飲料庫存</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">
                    <span className="text-lg mr-1">🔋</span> 大型能量飲料 (10體力)
                  </label>
                  <input
                    type="number"
                    value={largeBotlesOwned}
                    onChange={(e) => setLargeBotlesOwned(Number(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-sekai-silver mb-2">
                    <span className="text-lg mr-1">🔋</span> 小型能量飲料 (1體力)
                  </label>
                  <input
                    type="number"
                    value={smallBotlesOwned}
                    onChange={(e) => setSmallBotlesOwned(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>
              <p className="text-xs text-sekai-mist mt-3">
                庫存總體力: {formatNumber(largeBotlesOwned * 10 + smallBotlesOwned)}
              </p>
            </div>

            {/* 時間設定 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">⏱ 遊玩效率</h2>
              <div>
                <label className="block text-sm text-sekai-silver mb-2">每場遊玩時間 (分鐘)</label>
                <input
                  type="number"
                  step="0.5"
                  value={minutesPerGame}
                  onChange={(e) => setMinutesPerGame(Number(e.target.value))}
                  className="input"
                />
                <div className="flex gap-2 mt-2">
                  {[2, 2.5, 3, 3.5].map(v => (
                    <button
                      key={v}
                      onClick={() => setMinutesPerGame(v)}
                      className={`px-3 py-1 rounded text-xs ${
                        minutesPerGame === v ? 'bg-gold-dim/20 text-gold-soft' : 'bg-sekai-charcoal text-sekai-silver'
                      }`}
                    >
                      {v}分
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 右側：結果 */}
          <div className="space-y-6">
            {/* 主要結果 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">📊 計算結果</h2>

              <div className="p-4 rounded-xl bg-gradient-to-br from-sekai-charcoal/60 to-sekai-ink/80 border border-gold-dim/20 text-center mb-6">
                <p className="text-sm text-sekai-silver">需要場次</p>
                <p className="text-5xl font-mono font-bold text-gradient-gold mt-2">
                  {formatNumber(result.gamesNeeded)}
                </p>
                <p className="text-xs text-sekai-mist mt-2">
                  {boostMultiplier}倍 × {ptPerGame} pt = {formatNumber(ptPerGame * boostMultiplier)} pt/場
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-sekai-charcoal/50">
                  <span className="text-sekai-silver">剩餘 PT</span>
                  <span className="font-mono text-xl">{formatNumber(targetPT - currentPT)}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-sekai-charcoal/50">
                  <span className="text-sekai-silver">所需總體力</span>
                  <span className="font-mono text-xl text-sekai-pearl">{formatNumber(result.totalStamina)}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-sekai-charcoal/50">
                  <span className="text-sekai-silver">自然恢復 ({remainingHours}h)</span>
                  <span className="font-mono text-green-400">+{formatNumber(result.naturalRecovery)}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-sekai-charcoal/50">
                  <span className="text-sekai-silver">當前體力</span>
                  <span className="font-mono text-green-400">+{formatNumber(currentStamina)}</span>
                </div>

                <div className="divider-gold" />

                <div className="flex justify-between items-center p-3 rounded-lg bg-gold-dim/10 border border-gold-dim/30">
                  <span className="text-gold-soft">需補充體力</span>
                  <span className="font-mono text-2xl text-gold-soft">{formatNumber(result.staminaNeeded)}</span>
                </div>
              </div>
            </div>

            {/* 能量飲料消耗 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">⚡ 能量飲料消耗</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-sekai-charcoal/50 text-center">
                  <p className="text-3xl mb-1">🔋</p>
                  <p className="text-xs text-sekai-silver">大型 (10體力)</p>
                  <p className="text-3xl font-mono font-bold text-sekai-pearl">{result.largeBottles}</p>
                  <p className={`text-xs mt-1 ${result.largeBottles <= largeBotlesOwned ? 'text-green-400' : 'text-red-400'}`}>
                    庫存: {largeBotlesOwned} {result.largeBottles <= largeBotlesOwned ? '✓' : `(缺 ${result.largeBottles - largeBotlesOwned})`}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-sekai-charcoal/50 text-center">
                  <p className="text-3xl mb-1">🔋</p>
                  <p className="text-xs text-sekai-silver">小型 (1體力)</p>
                  <p className="text-3xl font-mono font-bold text-sekai-pearl">{result.smallBottles}</p>
                  <p className={`text-xs mt-1 ${result.smallBottles <= smallBotlesOwned ? 'text-green-400' : 'text-red-400'}`}>
                    庫存: {smallBotlesOwned} {result.smallBottles <= smallBotlesOwned ? '✓' : `(缺 ${result.smallBottles - smallBotlesOwned})`}
                  </p>
                </div>
              </div>

              {result.crystalsForStamina > 0 && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                  <p className="text-red-400 text-sm">
                    ⚠️ 能量飲料不足！需要約 {formatNumber(result.crystalsForStamina)} 水晶補充體力
                  </p>
                </div>
              )}
            </div>

            {/* 時間估算 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">⏱ 時間估算</h2>

              <div className="p-4 rounded-lg bg-sekai-charcoal/50 text-center mb-4">
                <p className="text-sm text-sekai-silver">預估遊玩時間</p>
                <p className="text-3xl font-mono font-bold text-sekai-pearl mt-1">
                  {(result.totalPlayTime / 60).toFixed(1)} 小時
                </p>
                <p className="text-xs text-sekai-mist">
                  ({formatNumber(result.gamesNeeded)} 場 × {minutesPerGame} 分)
                </p>
              </div>

              <div className={`p-3 rounded-lg ${result.totalPlayTime / 60 <= remainingHours ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                <p className={result.totalPlayTime / 60 <= remainingHours ? 'text-green-400' : 'text-red-400'}>
                  {result.totalPlayTime / 60 <= remainingHours 
                    ? `✓ 時間充足 (剩餘 ${(remainingHours - result.totalPlayTime / 60).toFixed(1)} 小時)`
                    : `⚠️ 時間不足！超出 ${(result.totalPlayTime / 60 - remainingHours).toFixed(1)} 小時`
                  }
                </p>
              </div>
            </div>

            {/* 倍率比較 */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">📈 倍率比較</h2>

              <div className="space-y-2">
                {boostComparison.map(c => (
                  <div 
                    key={c.mult} 
                    className={`p-3 rounded-lg flex justify-between items-center ${
                      c.mult === boostMultiplier ? 'bg-gold-dim/20 border border-gold-dim/50' : 'bg-sekai-charcoal/30'
                    }`}
                  >
                    <span className={c.mult === boostMultiplier ? 'text-gold-soft font-bold' : 'text-sekai-silver'}>
                      {c.mult}倍
                    </span>
                    <div className="text-right text-sm">
                      <span className="font-mono">{formatNumber(c.games)} 場</span>
                      <span className="text-sekai-mist mx-2">|</span>
                      <span className="font-mono">{formatNumber(c.stamina)} 體力</span>
                      <span className="text-sekai-mist mx-2">|</span>
                      <span className="font-mono">{(c.time / 60).toFixed(1)}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
