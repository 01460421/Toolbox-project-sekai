'use client'

import { useState, useEffect } from 'react'
import { fetchLiveEventRanking, fetchEventList } from '@/lib/api'
import { formatScore } from '@/lib/ranking'

interface RankingEntry {
  rank: number
  name: string
  score: number
  speed?: number
}

interface EventInfo {
  id: number
  name: string
  startAt: number
  endAt: number
}

export default function RankingAnalysisPage() {
  const [liveData, setLiveData] = useState<any>(null)
  const [eventList, setEventList] = useState<EventInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRanks] = useState([1, 2, 3, 10, 100, 1000, 5000, 10000])
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [live, events] = await Promise.all([
          fetchLiveEventRanking(),
          fetchEventList()
        ])
        setLiveData(live)
        setEventList(events.slice(-10).reverse())
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    if (autoRefresh) {
      const interval = setInterval(loadData, 20000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getRankData = (rank: number): RankingEntry | null => {
    if (!liveData?.top_100_player_rankings) return null
    const entry = liveData.top_100_player_rankings.find((e: any) => e.rank === rank)
    if (entry) return { rank: entry.rank, name: entry.name, score: entry.score }
    return null
  }

  const getEventProgress = () => {
    if (!liveData) return 0
    const now = Date.now()
    const start = liveData.startAt
    const end = liveData.aggregateAt || liveData.endAt
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
  }

  const getRemainingTime = () => {
    if (!liveData) return ''
    const end = liveData.aggregateAt || liveData.endAt
    const remaining = end - Date.now()
    if (remaining <= 0) return '已結束'
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">衝榜分析系統</h1>
          <p className="mt-2 text-sekai-silver">即時排名追蹤與歷史活動分析</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-gold-dim border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sekai-silver">載入中...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live Event */}
            {liveData && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="heading-3">{liveData.name || '當前活動'}</h2>
                    <p className="text-sm text-sekai-silver mt-1">
                      剩餘時間：<span className="text-gold-soft">{getRemainingTime()}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-sekai-silver">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded border-sekai-ash"
                      />
                      自動更新
                    </label>
                    <span className="tag tag-gold">LIVE</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-sekai-mist mb-1">
                    <span>活動進度</span>
                    <span>{getEventProgress().toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${getEventProgress()}%` }} />
                  </div>
                </div>

                {/* Ranking Table */}
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>排名</th>
                        <th>玩家</th>
                        <th className="text-right">分數</th>
                        <th className="text-right">時速估計</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRanks.map((rank) => {
                        const data = getRankData(rank)
                        if (!data) return (
                          <tr key={rank}>
                            <td className="font-medium">#{rank}</td>
                            <td colSpan={3} className="text-sekai-mist">資料不可用</td>
                          </tr>
                        )

                        return (
                          <tr key={rank}>
                            <td>
                              <span className={`font-medium ${
                                rank === 1 ? 'text-gold-soft' :
                                rank <= 3 ? 'text-gold-dim' :
                                rank <= 10 ? 'text-unit-ln' :
                                'text-sekai-pearl'
                              }`}>
                                #{rank}
                              </span>
                            </td>
                            <td className="truncate max-w-[150px]">{data.name}</td>
                            <td className="text-right number-md">{formatScore(data.score)}</td>
                            <td className="text-right text-sekai-silver">
                              {getEventProgress() > 0 
                                ? formatScore(Math.floor(data.score / (getEventProgress() / 100) / (120))) + '/h'
                                : '-'
                              }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Border Summary */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">邊線速覽</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { rank: 100, label: 'T100' },
                  { rank: 1000, label: 'T1000' },
                  { rank: 5000, label: 'T5000' },
                  { rank: 10000, label: 'T10000' },
                ].map(({ rank, label }) => {
                  const data = getRankData(rank)
                  return (
                    <div key={rank} className="p-4 rounded-lg bg-sekai-charcoal/50 text-center">
                      <p className="text-sm text-sekai-silver">{label}</p>
                      <p className="number-xl mt-1">
                        {data ? formatScore(data.score) : '-'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Past Events */}
            <div className="card p-6">
              <h2 className="heading-section mb-4">近期活動</h2>
              
              {eventList.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>活動名稱</th>
                        <th className="text-right">開始時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventList.map((event) => (
                        <tr key={event.id}>
                          <td className="text-sekai-mist">#{event.id}</td>
                          <td>{event.name}</td>
                          <td className="text-right text-sekai-silver">
                            {new Date(event.startAt).toLocaleDateString('zh-TW')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-sekai-mist py-8">無歷史資料</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
