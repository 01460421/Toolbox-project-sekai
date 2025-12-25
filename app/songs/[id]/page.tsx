'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchMusics, fetchMusicDifficulties, fetchMusicVocals, getMusicJacketUrl } from '@/lib/api'
import Link from 'next/link'

const DIFFICULTY_INFO: Record<string, { name: string; color: string; bg: string }> = {
  easy: { name: 'Easy', color: 'text-green-400', bg: 'bg-green-500' },
  normal: { name: 'Normal', color: 'text-blue-400', bg: 'bg-blue-500' },
  hard: { name: 'Hard', color: 'text-yellow-400', bg: 'bg-yellow-500' },
  expert: { name: 'Expert', color: 'text-red-400', bg: 'bg-red-500' },
  master: { name: 'Master', color: 'text-purple-400', bg: 'bg-purple-500' },
  append: { name: 'Append', color: 'text-pink-400', bg: 'bg-pink-500' },
}

const DIFFICULTY_ORDER = ['easy', 'normal', 'hard', 'expert', 'master', 'append']

export default function SongDetailPage() {
  const params = useParams()
  const router = useRouter()
  const songId = Number(params.id)
  
  const [music, setMusic] = useState<any>(null)
  const [difficulties, setDifficulties] = useState<any[]>([])
  const [vocals, setVocals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('master')

  useEffect(() => {
    async function loadData() {
      try {
        const [musicData, diffData, vocalData] = await Promise.all([
          fetchMusics(),
          fetchMusicDifficulties(),
          fetchMusicVocals()
        ])
        
        const targetMusic = musicData.find((m: any) => m.id === songId)
        if (!targetMusic) {
          router.push('/songs')
          return
        }
        
        setMusic(targetMusic)
        setDifficulties(diffData.filter((d: any) => d.musicId === songId))
        setVocals(vocalData.filter((v: any) => v.musicId === songId))
      } catch (error) {
        console.error('Error loading song data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [songId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-soft border-t-transparent" />
      </div>
    )
  }

  if (!music) return null

  const sortedDifficulties = [...difficulties].sort((a, b) => 
    DIFFICULTY_ORDER.indexOf(a.musicDifficulty) - DIFFICULTY_ORDER.indexOf(b.musicDifficulty)
  )

  const selectedDiff = difficulties.find(d => d.musicDifficulty === selectedDifficulty)
  const totalNotes = difficulties.reduce((sum, d) => sum + d.noteCount, 0)

  // Calculate estimated duration (based on note count and typical BPM assumptions)
  const estimatedDuration = selectedDiff ? Math.ceil(selectedDiff.noteCount / 8) : 0

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/songs" className="text-sekai-silver hover:text-gold-soft transition-colors">
            ← 返回歌曲列表
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Jacket & Basic Info */}
          <div className="lg:col-span-1">
            <div className="card overflow-hidden sticky top-24">
              {/* Jacket */}
              <div className="relative aspect-square">
                <img
                  src={getMusicJacketUrl(music.assetbundleName)}
                  alt={music.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sekai-void/60 to-transparent" />
              </div>

              {/* Info */}
              <div className="p-6">
                <h1 className="heading-2 text-sekai-pearl mb-2">{music.title}</h1>
                {music.pronunciation && music.pronunciation !== music.title && (
                  <p className="text-sekai-silver text-sm mb-4">{music.pronunciation}</p>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">ID</span>
                    <span className="text-sekai-pearl">{music.id}</span>
                  </div>
                  {music.composer && (
                    <div className="flex justify-between">
                      <span className="text-sekai-mist">作曲</span>
                      <span className="text-sekai-pearl text-right">{music.composer}</span>
                    </div>
                  )}
                  {music.lyricist && (
                    <div className="flex justify-between">
                      <span className="text-sekai-mist">作詞</span>
                      <span className="text-sekai-pearl text-right">{music.lyricist}</span>
                    </div>
                  )}
                  {music.arranger && (
                    <div className="flex justify-between">
                      <span className="text-sekai-mist">編曲</span>
                      <span className="text-sekai-pearl text-right">{music.arranger}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">發佈日期</span>
                    <span className="text-sekai-pearl">
                      {new Date(music.publishedAt).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sekai-mist">總音符數</span>
                    <span className="text-sekai-pearl">{totalNotes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Difficulties & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Difficulty Selector */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">難度資訊</h2>
              
              {/* Difficulty Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {sortedDifficulties.map((diff) => {
                  const info = DIFFICULTY_INFO[diff.musicDifficulty]
                  const isSelected = selectedDifficulty === diff.musicDifficulty
                  
                  return (
                    <button
                      key={diff.id}
                      onClick={() => setSelectedDifficulty(diff.musicDifficulty)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        isSelected 
                          ? `${info.bg} text-white` 
                          : `bg-sekai-charcoal ${info.color} hover:bg-sekai-ash/50`
                      }`}
                    >
                      <span className="mr-2">{info.name}</span>
                      <span className="font-bold">{diff.playLevel}</span>
                    </button>
                  )
                })}
              </div>

              {/* Selected Difficulty Details */}
              {selectedDiff && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-sekai-charcoal rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-gold-soft">
                      {selectedDiff.playLevel}
                    </div>
                    <div className="text-sm text-sekai-mist mt-1">等級</div>
                  </div>
                  <div className="bg-sekai-charcoal rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-sekai-pearl">
                      {selectedDiff.noteCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-sekai-mist mt-1">音符數</div>
                  </div>
                  <div className="bg-sekai-charcoal rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-sekai-pearl">
                      {(selectedDiff.noteCount / 100 * 2).toFixed(1)}
                    </div>
                    <div className="text-sm text-sekai-mist mt-1">理論分數 (萬)</div>
                  </div>
                  <div className="bg-sekai-charcoal rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-sekai-pearl">
                      ~{Math.ceil(selectedDiff.noteCount / 10)}
                    </div>
                    <div className="text-sm text-sekai-mist mt-1">NPS (估計)</div>
                  </div>
                </div>
              )}
            </div>

            {/* All Difficulties Comparison */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">難度比較</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-sekai-mist border-b border-sekai-ash/30">
                      <th className="text-left py-3 px-2">難度</th>
                      <th className="text-right py-3 px-2">等級</th>
                      <th className="text-right py-3 px-2">音符數</th>
                      <th className="text-right py-3 px-2">理論分數</th>
                      <th className="text-right py-3 px-2">效率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDifficulties.map((diff) => {
                      const info = DIFFICULTY_INFO[diff.musicDifficulty]
                      const score = diff.noteCount * 200 // Simplified score calculation
                      
                      return (
                        <tr 
                          key={diff.id} 
                          className={`border-b border-sekai-ash/20 ${
                            selectedDifficulty === diff.musicDifficulty ? 'bg-sekai-charcoal/50' : ''
                          }`}
                        >
                          <td className={`py-3 px-2 font-medium ${info.color}`}>
                            {info.name}
                          </td>
                          <td className="text-right py-3 px-2">
                            <span className={`inline-block px-2 py-0.5 rounded ${info.bg} text-white font-bold`}>
                              {diff.playLevel}
                            </span>
                          </td>
                          <td className="text-right py-3 px-2 text-sekai-pearl">
                            {diff.noteCount.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-2 text-sekai-pearl">
                            {(score / 10000).toFixed(1)}萬
                          </td>
                          <td className="text-right py-3 px-2 text-sekai-silver">
                            {((diff.noteCount / sortedDifficulties[sortedDifficulties.length - 1]?.noteCount || 1) * 100).toFixed(0)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vocal Versions */}
            {vocals.length > 0 && (
              <div className="card p-6">
                <h2 className="heading-3 mb-4">歌唱版本</h2>
                <div className="grid gap-3">
                  {vocals.map((vocal) => (
                    <div 
                      key={vocal.id}
                      className="bg-sekai-charcoal rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sekai-pearl font-medium">
                          {vocal.caption || `版本 ${vocal.id}`}
                        </div>
                        <div className="text-sm text-sekai-mist mt-1">
                          {vocal.musicVocalType}
                        </div>
                      </div>
                      <div className="text-sm text-sekai-silver">
                        ID: {vocal.id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="heading-3 mb-4">快速連結</h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://sekai.best/music/${music.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  在 Sekai.best 查看 →
                </a>
                <a
                  href={`https://pjsekai.sega.jp/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm"
                >
                  官方網站 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
