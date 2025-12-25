'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchEvents, fetchEventCards, fetchCards, getEventBannerUrl, getCardThumbnailUrl } from '@/lib/api'
import { CHARACTER_NAMES_TW } from '@/lib/types'
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
}

interface EventCard {
  id: number
  eventId: number
  cardId: number
  bonusRate: number
}

const EVENT_TYPE_NAMES: Record<string, string> = {
  marathon: '馬拉松',
  cheerful_carnival: '嘉年華對抗戰',
  world_bloom: '世界開花',
}

const BONUS_COLORS: Record<number, string> = {
  50: 'text-gold-soft',
  25: 'text-yellow-400',
  15: 'text-blue-400',
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Number(params.id)

  const [event, setEvent] = useState<Event | null>(null)
  const [eventCards, setEventCards] = useState<EventCard[]>([])
  const [allCards, setAllCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [eventsData, eventCardsData, cardsData] = await Promise.all([
          fetchEvents(),
          fetchEventCards(),
          fetchCards()
        ])
        
        const targetEvent = eventsData.find((e: Event) => e.id === eventId)
        if (!targetEvent) {
          router.push('/events')
          return
        }
        
        setEvent(targetEvent)
        setEventCards(eventCardsData.filter((ec: EventCard) => ec.eventId === eventId))
        setAllCards(cardsData)
      } catch (error) {
        console.error('Error loading event data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [eventId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-soft border-t-transparent" />
      </div>
    )
  }

  if (!event) return null

  const now = Date.now()
  const isOngoing = now >= event.startAt && now <= event.aggregateAt
  const isUpcoming = now < event.startAt
  const remainingTime = event.aggregateAt - now
  const daysRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)))
  const hoursRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60)))

  // Group event cards by bonus rate
  const cardsByBonus: Record<number, any[]> = {}
  eventCards.forEach((ec) => {
    const card = allCards.find(c => c.id === ec.cardId)
    if (card) {
      if (!cardsByBonus[ec.bonusRate]) cardsByBonus[ec.bonusRate] = []
      cardsByBonus[ec.bonusRate].push({ ...card, bonusRate: ec.bonusRate })
    }
  })

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/events" className="text-sekai-silver hover:text-gold-soft transition-colors">
            ← 返回活動列表
          </Link>
        </nav>

        {/* Event Banner */}
        <div className="card overflow-hidden mb-8">
          <div className="relative aspect-[3/1] bg-sekai-charcoal">
            <img
              src={getEventBannerUrl(event.assetbundleName)}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sekai-void/80 to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                isOngoing ? 'bg-green-500 text-white animate-pulse' :
                isUpcoming ? 'bg-blue-500 text-white' :
                'bg-sekai-ash text-sekai-silver'
              }`}>
                {isOngoing && '⚡ 進行中'}
                {isUpcoming && '即將開始'}
                {!isOngoing && !isUpcoming && '已結束'}
              </span>
            </div>

            {/* Event Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-sekai-charcoal/80 text-sekai-silver mb-2">
                {EVENT_TYPE_NAMES[event.eventType] || event.eventType}
              </div>
              <h1 className="heading-1 text-sekai-pearl">{event.name}</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Event Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Time Info */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">活動時間</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-sekai-mist">開始時間</span>
                  <span className="text-sekai-pearl">
                    {new Date(event.startAt).toLocaleString('zh-TW')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sekai-mist">結算時間</span>
                  <span className="text-sekai-pearl">
                    {new Date(event.aggregateAt).toLocaleString('zh-TW')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sekai-mist">排名發表</span>
                  <span className="text-sekai-pearl">
                    {new Date(event.rankingAnnounceAt).toLocaleString('zh-TW')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-sekai-mist">結束時間</span>
                  <span className="text-sekai-pearl">
                    {new Date(event.closedAt).toLocaleString('zh-TW')}
                  </span>
                </div>

                {isOngoing && (
                  <div className="mt-4 pt-4 border-t border-sekai-ash/30">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gold-soft">
                        {daysRemaining > 0 ? `${daysRemaining}天` : `${hoursRemaining}小時`}
                      </div>
                      <div className="text-sm text-sekai-mist mt-1">剩餘時間</div>
                    </div>
                    <div className="mt-3 h-2 bg-sekai-charcoal rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-gold-dim to-gold-soft rounded-full"
                        style={{ 
                          width: `${Math.max(0, (1 - remainingTime / (event.aggregateAt - event.startAt)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">快速連結</h2>
              <div className="space-y-3">
                <Link href="/ranking/planner" className="btn-primary w-full justify-center">
                  衝榜規劃
                </Link>
                <Link href="/ranking/analysis" className="btn-secondary w-full justify-center">
                  排名分析
                </Link>
                <Link href="/ranking/prediction" className="btn-secondary w-full justify-center">
                  邊線預測
                </Link>
              </div>
            </div>

            {/* Event Info */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">活動資訊</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sekai-mist">活動 ID</span>
                  <span className="text-sekai-pearl">{event.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sekai-mist">活動類型</span>
                  <span className="text-sekai-pearl">{EVENT_TYPE_NAMES[event.eventType] || event.eventType}</span>
                </div>
                {event.unit && (
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">主角團體</span>
                    <span className="text-sekai-pearl">{event.unit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Bonus Cards */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="heading-3 mb-6">加成卡片</h2>
              
              {Object.keys(cardsByBonus).length > 0 ? (
                <div className="space-y-8">
                  {[50, 25, 15].map(bonusRate => {
                    const cards = cardsByBonus[bonusRate]
                    if (!cards || cards.length === 0) return null
                    
                    return (
                      <div key={bonusRate}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`text-lg font-bold ${BONUS_COLORS[bonusRate] || 'text-sekai-pearl'}`}>
                            +{bonusRate}%
                          </span>
                          <span className="text-sekai-mist text-sm">
                            ({cards.length} 張)
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                          {cards.map((card: any) => (
                            <Link
                              key={card.id}
                              href={`/calculator/cards?id=${card.id}`}
                              className="group relative aspect-square rounded-lg overflow-hidden bg-sekai-charcoal hover:ring-2 hover:ring-gold-soft transition-all"
                            >
                              <img
                                src={getCardThumbnailUrl(card.assetbundleName)}
                                alt={card.prefix}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                loading="lazy"
                              />
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                <div className="text-[10px] text-white truncate">
                                  {CHARACTER_NAMES_TW[card.characterId]?.slice(0, 3)}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-sekai-mist">
                  無加成卡片資料
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
