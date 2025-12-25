'use client'

import { useState, useEffect } from 'react'
import { fetchEvents, fetchEventCards, getEventBannerUrl } from '@/lib/api'
import Link from 'next/link'

interface Event {
  id: number
  eventType: string
  name: string
  assetbundleName: string
  startAt: number
  aggregateAt: number
  rankingAnnounceAt: number
  distributionStartAt: number
  closedAt: number
  distributionEndAt: number
  virtualLiveId: number
  unit: string
  eventRankingRewardRanges: any[]
}

const EVENT_TYPE_NAMES: Record<string, string> = {
  marathon: '馬拉松',
  cheerful_carnival: '嘉年華對抗戰',
  world_bloom: '世界開花',
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  marathon: 'bg-blue-500',
  cheerful_carnival: 'bg-pink-500',
  world_bloom: 'bg-green-500',
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'current' | 'upcoming' | 'past'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    async function loadData() {
      try {
        const eventData = await fetchEvents()
        // Sort by start date descending
        const sorted = [...eventData].sort((a: Event, b: Event) => b.startAt - a.startAt)
        setEvents(sorted)
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const now = Date.now()

  const getEventStatus = (event: Event): 'current' | 'upcoming' | 'past' => {
    if (now < event.startAt) return 'upcoming'
    if (now > event.aggregateAt) return 'past'
    return 'current'
  }

  const filteredEvents = events.filter(event => {
    const status = getEventStatus(event)
    if (filter !== 'all' && status !== filter) return false
    if (typeFilter !== 'all' && event.eventType !== typeFilter) return false
    return true
  })

  const currentEvent = events.find(e => getEventStatus(e) === 'current')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-soft border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-1 text-gradient-gold mb-4">活動列表</h1>
          <p className="text-sekai-silver">
            收錄全部 {events.length} 個活動
          </p>
        </div>

        {/* Current Event Banner */}
        {currentEvent && (
          <div className="card mb-8 overflow-hidden">
            <div className="relative">
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full animate-pulse">
                  ⚡ 進行中
                </span>
              </div>
              <div className="aspect-[4/1] relative">
                <img
                  src={getEventBannerUrl(currentEvent.assetbundleName)}
                  alt={currentEvent.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-sekai-void/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="heading-2 text-sekai-pearl mb-2">{currentEvent.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-sekai-silver">
                    <span className={`px-2 py-0.5 rounded ${EVENT_TYPE_COLORS[currentEvent.eventType] || 'bg-sekai-charcoal'} text-white`}>
                      {EVENT_TYPE_NAMES[currentEvent.eventType] || currentEvent.eventType}
                    </span>
                    <span>
                      結束於: {new Date(currentEvent.aggregateAt).toLocaleString('zh-TW')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 flex gap-3">
              <Link href="/ranking/analysis" className="btn-primary text-sm">
                查看排名分析
              </Link>
              <Link href="/ranking/prediction" className="btn-secondary text-sm">
                邊線預測
              </Link>
              <Link href="/ranking/planner" className="btn-secondary text-sm">
                衝榜規劃
              </Link>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card p-4 mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              {(['all', 'current', 'upcoming', 'past'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === status
                      ? 'bg-gold-soft text-sekai-void'
                      : 'bg-sekai-charcoal text-sekai-silver hover:text-sekai-pearl'
                  }`}
                >
                  {status === 'all' && '全部'}
                  {status === 'current' && '進行中'}
                  {status === 'upcoming' && '即將開始'}
                  {status === 'past' && '已結束'}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  typeFilter === 'all'
                    ? 'bg-unit-vs text-white'
                    : 'bg-sekai-charcoal text-sekai-silver hover:text-sekai-pearl'
                }`}
              >
                全類型
              </button>
              {Object.entries(EVENT_TYPE_NAMES).map(([type, name]) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === type
                      ? `${EVENT_TYPE_COLORS[type]} text-white`
                      : 'bg-sekai-charcoal text-sekai-silver hover:text-sekai-pearl'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sekai-silver">
          顯示 {filteredEvents.length} / {events.length} 個活動
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event)
            const remainingTime = event.aggregateAt - now
            const daysRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)))

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card group hover:glow-gold transition-all overflow-hidden"
              >
                {/* Event Banner */}
                <div className="aspect-[2/1] relative bg-sekai-charcoal">
                  <img
                    src={getEventBannerUrl(event.assetbundleName)}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sekai-void/80 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      status === 'current' ? 'bg-green-500 text-white' :
                      status === 'upcoming' ? 'bg-blue-500 text-white' :
                      'bg-sekai-ash text-sekai-silver'
                    }`}>
                      {status === 'current' && '進行中'}
                      {status === 'upcoming' && '即將開始'}
                      {status === 'past' && '已結束'}
                    </span>
                  </div>

                  {/* Event Type */}
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${EVENT_TYPE_COLORS[event.eventType] || 'bg-sekai-charcoal'} text-white`}>
                      {EVENT_TYPE_NAMES[event.eventType] || event.eventType}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display font-semibold text-sekai-pearl group-hover:text-gold-soft transition-colors line-clamp-2">
                    {event.name}
                  </h3>
                  
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between text-sekai-mist">
                      <span>開始</span>
                      <span className="text-sekai-silver">
                        {new Date(event.startAt).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sekai-mist">
                      <span>結束</span>
                      <span className="text-sekai-silver">
                        {new Date(event.aggregateAt).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                    {status === 'current' && (
                      <div className="flex justify-between text-sekai-mist">
                        <span>剩餘</span>
                        <span className="text-gold-soft font-medium">
                          {daysRemaining} 天
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center text-gold-dim text-sm font-medium group-hover:text-gold-soft transition-colors">
                    <span>查看詳情</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-sekai-silver">
            沒有找到符合條件的活動
          </div>
        )}
      </div>
    </div>
  )
}
