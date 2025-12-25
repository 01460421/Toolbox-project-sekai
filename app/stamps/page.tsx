'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchStamps, getStampImageUrl } from '@/lib/api'
import { CHARACTER_NAMES_TW, CHARACTER_UNIT, UnitId, UNIT_NAMES_TW } from '@/lib/types'

interface Stamp {
  id: number
  stampType: string
  characterId1: number
  characterId2?: number
  name: string
  assetbundleName: string
  description: string
  archiveDisplayType: string
  archivePublishedAt?: number
}

const UNIT_COLORS: Record<UnitId, string> = {
  ln: 'bg-unit-ln',
  mmj: 'bg-unit-mmj',
  vbs: 'bg-unit-vbs',
  wxs: 'bg-unit-wxs',
  niigo: 'bg-unit-niigo',
  vs: 'bg-unit-vs',
}

export default function StampsPage() {
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCharacter, setFilterCharacter] = useState<number | 'all'>('all')
  const [filterUnit, setFilterUnit] = useState<UnitId | 'all'>('all')
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const stampData = await fetchStamps()
        // Filter to only show character stamps
        setStamps(stampData.filter((s: Stamp) => s.characterId1 && s.characterId1 <= 26))
      } catch (error) {
        console.error('Error loading stamps:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredStamps = useMemo(() => {
    return stamps.filter(stamp => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        if (!stamp.name?.toLowerCase().includes(searchLower) &&
            !stamp.description?.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Character filter
      if (filterCharacter !== 'all' && stamp.characterId1 !== filterCharacter) {
        return false
      }

      // Unit filter
      if (filterUnit !== 'all') {
        const stampUnit = CHARACTER_UNIT[stamp.characterId1]
        if (stampUnit !== filterUnit) return false
      }

      return true
    })
  }, [stamps, search, filterCharacter, filterUnit])

  // Group stamps by character
  const stampsByCharacter = useMemo(() => {
    const grouped: Record<number, Stamp[]> = {}
    filteredStamps.forEach(stamp => {
      if (!grouped[stamp.characterId1]) grouped[stamp.characterId1] = []
      grouped[stamp.characterId1].push(stamp)
    })
    return grouped
  }, [filteredStamps])

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
          <h1 className="heading-1 text-gradient-gold mb-4">貼圖圖鑑</h1>
          <p className="text-sekai-silver">
            收錄 {stamps.length} 張貼圖，支援搜尋與篩選
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="label mb-2">搜尋</label>
              <input
                type="text"
                placeholder="貼圖名稱、說明..."
                className="input w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Unit Filter */}
            <div>
              <label className="label mb-2">團體</label>
              <select 
                className="input w-full"
                value={filterUnit}
                onChange={(e) => {
                  setFilterUnit(e.target.value as UnitId | 'all')
                  setFilterCharacter('all')
                }}
              >
                <option value="all">全部</option>
                {Object.entries(UNIT_NAMES_TW).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            {/* Character Filter */}
            <div>
              <label className="label mb-2">角色</label>
              <select 
                className="input w-full"
                value={filterCharacter}
                onChange={(e) => setFilterCharacter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">全部</option>
                {Object.entries(CHARACTER_NAMES_TW)
                  .filter(([id]) => filterUnit === 'all' || CHARACTER_UNIT[Number(id)] === filterUnit)
                  .map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sekai-silver">
          顯示 {filteredStamps.length} / {stamps.length} 張貼圖
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredStamps.map((stamp) => {
            const unit = CHARACTER_UNIT[stamp.characterId1]
            
            return (
              <button
                key={stamp.id}
                onClick={() => setSelectedStamp(stamp)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-sekai-charcoal hover:ring-2 hover:ring-gold-soft transition-all"
              >
                <img
                  src={getStampImageUrl(stamp.assetbundleName)}
                  alt={stamp.name}
                  className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png'
                  }}
                />
                
                {/* Unit indicator */}
                <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${UNIT_COLORS[unit] || 'bg-sekai-silver'}`} />
              </button>
            )
          })}
        </div>

        {filteredStamps.length === 0 && (
          <div className="text-center py-12 text-sekai-silver">
            沒有找到符合條件的貼圖
          </div>
        )}

        {/* Stamp Detail Modal */}
        {selectedStamp && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-sekai-void/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedStamp(null)}
          >
            <div 
              className="card p-6 max-w-sm w-full animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedStamp(null)}
                className="absolute top-4 right-4 text-sekai-silver hover:text-sekai-pearl transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Stamp Image */}
              <div className="aspect-square bg-sekai-charcoal rounded-xl overflow-hidden mb-4">
                <img
                  src={getStampImageUrl(selectedStamp.assetbundleName)}
                  alt={selectedStamp.name}
                  className="w-full h-full object-contain p-4"
                />
              </div>

              {/* Stamp Info */}
              <h3 className="heading-3 text-sekai-pearl mb-2">{selectedStamp.name}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-sekai-mist">角色</span>
                  <span className="text-sekai-pearl">
                    {CHARACTER_NAMES_TW[selectedStamp.characterId1]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sekai-mist">團體</span>
                  <span className="text-sekai-pearl">
                    {UNIT_NAMES_TW[CHARACTER_UNIT[selectedStamp.characterId1]]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sekai-mist">ID</span>
                  <span className="text-sekai-pearl">{selectedStamp.id}</span>
                </div>
                {selectedStamp.description && (
                  <div className="pt-2 mt-2 border-t border-sekai-ash/30">
                    <span className="text-sekai-mist">說明</span>
                    <p className="text-sekai-silver mt-1">{selectedStamp.description}</p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <div className="mt-6">
                <a
                  href={getStampImageUrl(selectedStamp.assetbundleName)}
                  download={`stamp_${selectedStamp.id}.webp`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  下載貼圖
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
