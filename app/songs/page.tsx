'use client'

import { useState, useEffect, useMemo } from 'react'
import { fetchMusics, fetchMusicDifficulties, getMusicJacketUrl } from '@/lib/api'
import Link from 'next/link'

interface Music {
  id: number
  seq: number
  title: string
  pronunciation: string
  lyricist: string
  composer: string
  arranger: string
  dancerCount: number
  selfDancerPosition: number
  assetbundleName: string
  liveTalkBackgroundAssetbundleName: string
  publishedAt: number
  fillerSec: number
  categories: string[]
}

interface MusicDifficulty {
  id: number
  musicId: number
  musicDifficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'master' | 'append'
  playLevel: number
  noteCount: number
  totalNoteCount?: number
}

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  easy: { bg: 'rgba(72, 187, 120, 0.15)', text: '#68D391', border: 'rgba(72, 187, 120, 0.4)' },
  normal: { bg: 'rgba(66, 153, 225, 0.15)', text: '#63B3ED', border: 'rgba(66, 153, 225, 0.4)' },
  hard: { bg: 'rgba(237, 189, 36, 0.15)', text: '#F6E05E', border: 'rgba(237, 189, 36, 0.4)' },
  expert: { bg: 'rgba(245, 101, 101, 0.15)', text: '#FC8181', border: 'rgba(245, 101, 101, 0.4)' },
  master: { bg: 'rgba(159, 122, 234, 0.15)', text: '#B794F4', border: 'rgba(159, 122, 234, 0.4)' },
  append: { bg: 'rgba(237, 100, 166, 0.15)', text: '#F687B3', border: 'rgba(237, 100, 166, 0.4)' },
}

const DIFFICULTY_ORDER = ['easy', 'normal', 'hard', 'expert', 'master', 'append']

export default function SongsPage() {
  const [musics, setMusics] = useState<Music[]>([])
  const [difficulties, setDifficulties] = useState<MusicDifficulty[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'date' | 'level'>('date')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterMinLevel, setFilterMinLevel] = useState<number>(0)
  const [filterMaxLevel, setFilterMaxLevel] = useState<number>(40)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function loadData() {
      try {
        const [musicData, diffData] = await Promise.all([
          fetchMusics(),
          fetchMusicDifficulties()
        ])
        setMusics(musicData)
        setDifficulties(diffData)
      } catch (error) {
        console.error('Error loading music data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const difficultyMap = useMemo(() => {
    const map: Record<number, MusicDifficulty[]> = {}
    difficulties.forEach(d => {
      if (!map[d.musicId]) map[d.musicId] = []
      map[d.musicId].push(d)
    })
    return map
  }, [difficulties])

  const filteredMusics = useMemo(() => {
    let result = musics.filter(m => {
      if (search) {
        const searchLower = search.toLowerCase()
        if (!m.title.toLowerCase().includes(searchLower) &&
            !m.pronunciation?.toLowerCase().includes(searchLower) &&
            !m.composer?.toLowerCase().includes(searchLower) &&
            !m.lyricist?.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      const musicDiffs = difficultyMap[m.id] || []
      if (filterDifficulty !== 'all') {
        const targetDiff = musicDiffs.find(d => d.musicDifficulty === filterDifficulty)
        if (!targetDiff || targetDiff.playLevel < filterMinLevel || targetDiff.playLevel > filterMaxLevel) {
          return false
        }
      } else {
        const hasMatchingLevel = musicDiffs.some(d => 
          d.playLevel >= filterMinLevel && d.playLevel <= filterMaxLevel
        )
        if (!hasMatchingLevel && musicDiffs.length > 0) return false
      }

      return true
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.pronunciation || a.title).localeCompare(b.pronunciation || b.title, 'ja')
        case 'date':
          return b.publishedAt - a.publishedAt
        case 'level':
          const aDiffs = difficultyMap[a.id] || []
          const bDiffs = difficultyMap[b.id] || []
          const aMax = Math.max(...aDiffs.map(d => d.playLevel), 0)
          const bMax = Math.max(...bDiffs.map(d => d.playLevel), 0)
          return bMax - aMax
        default:
          return b.id - a.id
      }
    })

    return result
  }, [musics, search, sortBy, filterDifficulty, filterMinLevel, filterMaxLevel, difficultyMap])

  const handleImageError = (musicId: number) => {
    setImageErrors(prev => new Set(prev).add(musicId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-gold-dim/30 border-t-gold-soft rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sekai-silver font-serif italic">載入歌曲資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold-dim/40" />
            <span className="text-gold-muted text-xs tracking-[0.25em] uppercase font-display">Music Database</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold-dim/40" />
          </div>
          <h1 className="heading-1 text-gradient-gold mb-4">歌曲資料庫</h1>
          <p className="text-sekai-silver font-serif">
            收錄 <span className="text-gold-soft">{musics.length}</span> 首歌曲，支援搜尋、篩選與難度查詢
          </p>
        </div>

        {/* Filters */}
        <div className="card-luxury p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Search */}
            <div>
              <label className="block text-sm text-gold-muted mb-2 font-serif tracking-wide">搜尋</label>
              <input
                type="text"
                placeholder="歌曲名稱、作曲者..."
                className="input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm text-gold-muted mb-2 font-serif tracking-wide">排序</label>
              <select 
                className="select w-full"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="date">發佈日期</option>
                <option value="title">標題</option>
                <option value="level">最高難度</option>
                <option value="id">ID</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm text-gold-muted mb-2 font-serif tracking-wide">難度</label>
              <select 
                className="select w-full"
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <option value="all">全部</option>
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
                <option value="master">Master</option>
                <option value="append">Append</option>
              </select>
            </div>

            {/* Level Range */}
            <div>
              <label className="block text-sm text-gold-muted mb-2 font-serif tracking-wide">
                等級: <span className="text-gold-pale">{filterMinLevel}</span> – <span className="text-gold-pale">{filterMaxLevel}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={filterMinLevel}
                  onChange={(e) => setFilterMinLevel(Number(e.target.value))}
                  className="flex-1 accent-gold-soft"
                />
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={filterMaxLevel}
                  onChange={(e) => setFilterMaxLevel(Number(e.target.value))}
                  className="flex-1 accent-gold-soft"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sekai-silver font-serif">
            顯示 <span className="text-gold-soft">{filteredMusics.length}</span> / {musics.length} 首歌曲
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sekai-mist text-xs">◇</span>
          </div>
        </div>

        {/* Songs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMusics.map((music) => {
            const musicDiffs = difficultyMap[music.id] || []
            const sortedDiffs = [...musicDiffs].sort((a, b) => 
              DIFFICULTY_ORDER.indexOf(a.musicDifficulty) - DIFFICULTY_ORDER.indexOf(b.musicDifficulty)
            )
            const hasError = imageErrors.has(music.id)

            return (
              <Link
                key={music.id}
                href={`/songs/${music.id}`}
                className="group card overflow-hidden hover:glow-gold transition-all duration-500"
              >
                {/* Jacket Image */}
                <div className="relative aspect-square overflow-hidden">
                  {hasError ? (
                    <div className="w-full h-full flex items-center justify-center bg-sekai-charcoal/50">
                      <span className="text-4xl text-sekai-mist/50">♪</span>
                    </div>
                  ) : (
                    <img
                      src={getMusicJacketUrl(music.assetbundleName)}
                      alt={music.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      onError={() => handleImageError(music.id)}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-sekai-void via-sekai-void/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                  
                  {/* Difficulty Badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                    {sortedDiffs.map((diff) => {
                      const style = DIFFICULTY_STYLES[diff.musicDifficulty]
                      return (
                        <span
                          key={diff.id}
                          className="px-2 py-0.5 text-xs font-display font-medium rounded"
                          style={{
                            background: style.bg,
                            color: style.text,
                            border: `1px solid ${style.border}`,
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          {diff.playLevel}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display font-medium text-sekai-pearl group-hover:text-gold-pale transition-colors line-clamp-2 tracking-wide">
                    {music.title}
                  </h3>
                  <p className="text-sm text-sekai-silver mt-2 line-clamp-1 font-serif italic">
                    {music.composer}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-sekai-mist font-serif">
                    <span>№ {music.id}</span>
                    {musicDiffs.length > 0 && (
                      <>
                        <span className="text-gold-dim/50">·</span>
                        <span>{musicDiffs.reduce((sum, d) => sum + d.noteCount, 0).toLocaleString()} notes</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredMusics.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl text-sekai-mist/30 mb-4 block">♪</span>
            <p className="text-sekai-silver font-serif italic">沒有找到符合條件的歌曲</p>
          </div>
        )}

        {/* Footer Decoration */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-dim/20 to-transparent" />
          <span className="text-gold-dim/40 text-xs">◇</span>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-dim/20 to-transparent" />
        </div>
      </div>
    </div>
  )
}
