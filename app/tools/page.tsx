'use client'

import { useState } from 'react'
import Link from 'next/link'

const tools = [
  {
    title: '活動PT計算機',
    description: '計算衝榜所需的PT、能量飲料與時間',
    icon: '🔋',
    href: '/ranking/planner',
  },
  {
    title: '控分計算器',
    description: '計算特定分數需要的動作組合',
    icon: '🎯',
    href: '/ranking/score-calculator',
  },
  {
    title: '效率歌曲推薦',
    description: '根據難度和時長推薦最佳效率歌曲',
    icon: '🎵',
    href: '/tools/best-songs',
  },
  {
    title: '羈絆經驗計算',
    description: '計算羈絆升級所需經驗',
    icon: '💕',
    href: '/growth/bonds',
  },
  {
    title: 'CR 升級計算',
    description: '計算角色等級升級進度',
    icon: '📈',
    href: '/growth/character-rank',
  },
  {
    title: '綜合力計算',
    description: '計算隊伍總綜合力',
    icon: '⚡',
    href: '/calculator',
  },
]

export default function ToolsPage() {
  const [stamina, setStamina] = useState(10)
  const [boostMultiplier, setBoostMultiplier] = useState(5)
  const [efficiency, setEfficiency] = useState(200) // PT per boost
  const [targetPT, setTargetPT] = useState(1000000)
  const [currentPT, setCurrentPT] = useState(0)

  // Quick Calculator Results
  const remainingPT = targetPT - currentPT
  const boostsNeeded = Math.ceil(remainingPT / efficiency)
  const energyNeeded = boostsNeeded * stamina
  const drinksNeeded = Math.ceil(energyNeeded / 10) // 10 stamina per drink
  const gamesNeeded = Math.ceil(boostsNeeded / boostMultiplier)
  const timeNeeded = gamesNeeded * 2.5 // ~2.5 min per game

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 text-gradient-gold mb-4">工具集</h1>
          <p className="text-sekai-silver">
            各種實用計算器與工具
          </p>
        </div>

        {/* Quick Calculator */}
        <div className="card p-6 mb-8">
          <h2 className="heading-2 mb-6">快速 PT 計算</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="label mb-2">目標 PT</label>
                <input
                  type="number"
                  className="input w-full"
                  value={targetPT}
                  onChange={(e) => setTargetPT(Number(e.target.value))}
                  step={100000}
                />
              </div>
              
              <div>
                <label className="label mb-2">目前 PT</label>
                <input
                  type="number"
                  className="input w-full"
                  value={currentPT}
                  onChange={(e) => setCurrentPT(Number(e.target.value))}
                  step={10000}
                />
              </div>

              <div>
                <label className="label mb-2">每局 PT 效率</label>
                <input
                  type="number"
                  className="input w-full"
                  value={efficiency}
                  onChange={(e) => setEfficiency(Number(e.target.value))}
                />
                <p className="text-xs text-sekai-mist mt-1">單次消耗體力可獲得的 PT</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label mb-2">體力消耗</label>
                  <select 
                    className="input w-full"
                    value={stamina}
                    onChange={(e) => setStamina(Number(e.target.value))}
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                  </select>
                </div>
                <div>
                  <label className="label mb-2">倍率</label>
                  <select 
                    className="input w-full"
                    value={boostMultiplier}
                    onChange={(e) => setBoostMultiplier(Number(e.target.value))}
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-sekai-charcoal rounded-xl p-6">
              <h3 className="heading-3 mb-4 text-gold-soft">計算結果</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sekai-mist">需要 PT</span>
                  <span className="text-2xl font-bold text-sekai-pearl">
                    {remainingPT.toLocaleString()}
                  </span>
                </div>
                
                <div className="border-t border-sekai-ash/30 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">需要場次</span>
                    <span className="text-sekai-pearl font-medium">{gamesNeeded.toLocaleString()} 場</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">需要體力</span>
                    <span className="text-sekai-pearl font-medium">{energyNeeded.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">大型能量飲料</span>
                    <span className="text-sekai-pearl font-medium">~{drinksNeeded.toLocaleString()} 瓶</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">預估時間</span>
                    <span className="text-sekai-pearl font-medium">
                      ~{Math.floor(timeNeeded / 60)}h {Math.round(timeNeeded % 60)}m
                    </span>
                  </div>
                </div>

                <div className="border-t border-sekai-ash/30 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-sekai-mist">進度</span>
                    <span className="text-gold-soft">
                      {((currentPT / targetPT) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-sekai-ink rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gold-dim to-gold-soft rounded-full transition-all"
                      style={{ width: `${Math.min((currentPT / targetPT) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <h2 className="heading-2 mb-6">其他工具</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="card p-6 group hover:glow-gold transition-all"
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h3 className="heading-3 text-sekai-pearl group-hover:text-gold-soft transition-colors">
                {tool.title}
              </h3>
              <p className="mt-2 text-sekai-silver text-sm">
                {tool.description}
              </p>
              <div className="mt-4 flex items-center text-gold-dim text-sm font-medium group-hover:text-gold-soft transition-colors">
                <span>開啟</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Reference Tables */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stamina Reference */}
          <div className="card p-6">
            <h3 className="heading-3 mb-4">體力回復參考</h3>
            <table className="w-full text-sm">
              <thead className="text-sekai-mist border-b border-sekai-ash/30">
                <tr>
                  <th className="text-left py-2">道具</th>
                  <th className="text-right py-2">回復量</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-sekai-ash/20">
                  <td className="py-2 text-sekai-pearl">小型能量飲料</td>
                  <td className="text-right text-sekai-silver">1</td>
                </tr>
                <tr className="border-b border-sekai-ash/20">
                  <td className="py-2 text-sekai-pearl">大型能量飲料</td>
                  <td className="text-right text-sekai-silver">10</td>
                </tr>
                <tr>
                  <td className="py-2 text-sekai-pearl">水晶回復</td>
                  <td className="text-right text-sekai-silver">體力上限 100%</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-sekai-mist mt-3">* 自然恢復：每 5 分鐘回復 1 點體力</p>
          </div>

          {/* Boost Multiplier Reference */}
          <div className="card p-6">
            <h3 className="heading-3 mb-4">活動倍率參考</h3>
            <table className="w-full text-sm">
              <thead className="text-sekai-mist border-b border-sekai-ash/30">
                <tr>
                  <th className="text-left py-2">倍率</th>
                  <th className="text-right py-2">體力消耗</th>
                  <th className="text-right py-2">效率</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 5, 10].map(mult => (
                  <tr key={mult} className="border-b border-sekai-ash/20 last:border-0">
                    <td className="py-2 text-sekai-pearl">{mult}x</td>
                    <td className="text-right text-sekai-silver">{mult * 10}</td>
                    <td className="text-right text-gold-soft">100%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-sekai-mist mt-3">* 使用較高倍率可節省遊玩時間</p>
          </div>
        </div>
      </div>
    </div>
  )
}
