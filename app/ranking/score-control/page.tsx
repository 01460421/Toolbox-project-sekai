'use client'

import { useState, useMemo } from 'react'
import { generateScoreControlTable, formatNumber, COMMON_BONUSES, type ScoreControlData } from '@/lib/score-control'
import scoreControlDataRaw from '@/lib/score-control-data.json'

const scoreControlData = scoreControlDataRaw as ScoreControlData

export default function ScoreControlTablePage() {
  const [bonusMin, setBonusMin] = useState(0)
  const [bonusMax, setBonusMax] = useState(3)
  const [scoreFilter, setScoreFilter] = useState<number | null>(null)
  const [highlightBonus, setHighlightBonus] = useState<number | null>(null)
  const [bonusStep, setBonusStep] = useState(0.5)
  const [useRealData, setUseRealData] = useState(true)
  const [highlightPT, setHighlightPT] = useState<number | null>(null)

  // 使用真實資料或公式生成
  const tableData = useMemo(() => {
    if (useRealData && scoreControlData) {
      const filteredBonusIndices: number[] = []
      const filteredBonuses: number[] = []
      
      scoreControlData.bonuses.forEach((b, i) => {
        if (b >= bonusMin && b <= bonusMax) {
          const stepMatch = bonusStep === 0.01 || 
            Math.abs(Math.round(b / bonusStep) * bonusStep - b) < 0.001
          if (stepMatch) {
            filteredBonusIndices.push(i)
            filteredBonuses.push(b)
          }
        }
      })
      
      const rows = scoreControlData.scoreRanges.map((range, rowIndex) => ({
        scoreRange: range,
        pts: filteredBonusIndices.map(i => scoreControlData.ptTable[rowIndex][i])
      }))
      
      return { bonuses: filteredBonuses, rows }
    }
    return generateScoreControlTable(bonusMin, bonusMax, bonusStep)
  }, [bonusMin, bonusMax, bonusStep, useRealData])

  const filteredRows = useMemo(() => {
    if (scoreFilter === null) return tableData.rows
    const targetIndex = Math.min(Math.floor(scoreFilter / 20000), 124)
    const start = Math.max(0, targetIndex - 5)
    const end = Math.min(tableData.rows.length - 1, targetIndex + 5)
    return tableData.rows.slice(start, end + 1)
  }, [tableData.rows, scoreFilter])

  const highlightedBonusIndex = highlightBonus !== null 
    ? tableData.bonuses.findIndex(b => Math.abs(b - highlightBonus) < 0.001)
    : -1

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-8">
          <h1 className="heading-2">控分表</h1>
          <p className="mt-2 text-sekai-silver">
            {scoreControlData.songName} · {scoreControlData.mode}
          </p>
          <p className="mt-1 text-xs text-sekai-mist">資料來源: SYLVIA0x0 控分表</p>
        </div>

        {/* 設定區 */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-section">篩選設定</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useRealData}
                onChange={(e) => setUseRealData(e.target.checked)}
                className="rounded border-sekai-ash bg-sekai-charcoal text-gold-soft focus:ring-gold-dim"
              />
              <span className="text-sekai-silver">使用實際資料</span>
            </label>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-sekai-silver mb-2">ボーナス下限 (%)</label>
              <input
                type="number"
                value={bonusMin * 100}
                onChange={(e) => setBonusMin(Number(e.target.value) / 100)}
                step="10"
                min="0"
                max="700"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-sekai-silver mb-2">ボーナス上限 (%)</label>
              <input
                type="number"
                value={bonusMax * 100}
                onChange={(e) => setBonusMax(Number(e.target.value) / 100)}
                step="10"
                min="0"
                max="715"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-sekai-silver mb-2">步進值 (%)</label>
              <select value={bonusStep} onChange={(e) => setBonusStep(Number(e.target.value))} className="input">
                <option value={0.01}>1%</option>
                <option value={0.05}>5%</option>
                <option value={0.10}>10%</option>
                <option value={0.25}>25%</option>
                <option value={0.50}>50%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-sekai-silver mb-2">分數篩選</label>
              <input
                type="number"
                value={scoreFilter ?? ''}
                onChange={(e) => setScoreFilter(e.target.value ? Number(e.target.value) : null)}
                placeholder="輸入分數..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-sekai-silver mb-2">標記 PT 值</label>
              <input
                type="number"
                value={highlightPT ?? ''}
                onChange={(e) => setHighlightPT(e.target.value ? Number(e.target.value) : null)}
                placeholder="輸入PT..."
                className="input"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-sekai-silver mb-2">快速選擇範圍</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '低 (0~100%)', min: 0, max: 1 },
                { label: '中 (100~300%)', min: 1, max: 3 },
                { label: '高 (300~500%)', min: 3, max: 5 },
                { label: '極高 (500~715%)', min: 5, max: 7.15 },
                { label: '全部', min: 0, max: 7.15 },
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => { setBonusMin(preset.min); setBonusMax(preset.max) }}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    bonusMin === preset.min && bonusMax === preset.max
                      ? 'bg-gold-dim/20 text-gold-soft'
                      : 'bg-sekai-charcoal text-sekai-silver hover:text-gold-soft'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-sekai-silver mb-2">標記 ボーナス</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setHighlightBonus(null)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  highlightBonus === null ? 'bg-gold-dim/20 text-gold-soft' : 'bg-sekai-charcoal text-sekai-silver hover:text-gold-soft'
                }`}
              >
                無
              </button>
              {COMMON_BONUSES.filter(b => b.value >= bonusMin && b.value <= bonusMax).map(b => (
                <button
                  key={b.value}
                  onClick={() => setHighlightBonus(b.value)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    highlightBonus === b.value ? 'bg-gold-dim/20 text-gold-soft' : 'bg-sekai-charcoal text-sekai-silver hover:text-gold-soft'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 表格資訊 */}
        <div className="card p-4 mb-4">
          <div className="flex flex-wrap gap-4 text-sm text-sekai-silver">
            <span>顯示 <span className="text-gold-soft">{tableData.bonuses.length}</span> 個 bonus</span>
            <span>•</span>
            <span>顯示 <span className="text-gold-soft">{filteredRows.length}</span> 個分數區間</span>
            {scoreFilter !== null && (
              <>
                <span>•</span>
                <span>篩選: <span className="text-gold-soft">{formatNumber(scoreFilter)}</span></span>
              </>
            )}
          </div>
        </div>

        {/* 表格區 */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-sekai-charcoal/50">
                <tr>
                  <th className="sticky left-0 bg-sekai-charcoal z-10 px-3 py-3 text-left font-medium text-sekai-silver min-w-[140px]">
                    分數區間
                  </th>
                  {tableData.bonuses.map((bonus, i) => (
                    <th 
                      key={bonus}
                      className={`px-3 py-3 text-center font-medium whitespace-nowrap ${
                        i === highlightedBonusIndex ? 'bg-gold-dim/30 text-gold-soft' : 'text-sekai-silver'
                      }`}
                    >
                      {(bonus * 100).toFixed(0)}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rowIndex) => {
                  const isCurrentScore = scoreFilter !== null && scoreFilter >= row.scoreRange.min && scoreFilter <= row.scoreRange.max
                  return (
                    <tr 
                      key={row.scoreRange.min}
                      className={`border-t border-sekai-ash/20 ${isCurrentScore ? 'bg-gold-dim/10' : rowIndex % 2 === 0 ? '' : 'bg-sekai-charcoal/20'}`}
                    >
                      <td className={`sticky left-0 z-10 px-3 py-2 font-mono text-xs whitespace-nowrap ${
                        isCurrentScore ? 'bg-gold-dim/20 text-gold-soft font-bold' : 'bg-sekai-ink text-sekai-silver'
                      }`}>
                        {formatNumber(row.scoreRange.min)} ~ {formatNumber(row.scoreRange.max)}
                      </td>
                      {row.pts.map((pt, i) => {
                        const isHighlightedPT = highlightPT !== null && pt === highlightPT
                        return (
                          <td 
                            key={i}
                            className={`px-3 py-2 text-center font-mono ${
                              isHighlightedPT ? 'bg-green-500/30 text-green-300 font-bold'
                                : i === highlightedBonusIndex ? 'bg-gold-dim/20 text-gold-soft font-bold'
                                : 'text-sekai-pearl'
                            }`}
                          >
                            {pt}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 公式說明 */}
        <div className="card p-6 mt-6">
          <h2 className="heading-section mb-4">計算公式</h2>
          <div className="bg-sekai-charcoal/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-sekai-pearl">PT = floor(basePT × (1 + bonus))</p>
            <p className="text-sekai-silver mt-2">其中：basePT = 100 + floor(score ÷ 20000)</p>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-sekai-charcoal/30 rounded-lg p-3">
              <p className="text-sekai-silver">分數區間對應 basePT：</p>
              <p className="text-sekai-pearl mt-1">0~19999 → 100, 20000~39999 → 101, ...</p>
            </div>
            <div className="bg-sekai-charcoal/30 rounded-lg p-3">
              <p className="text-sekai-silver">倍率影響：</p>
              <p className="text-sekai-pearl mt-1">1倍 = PT, 2倍 = PT×2, 3倍 = PT×3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
