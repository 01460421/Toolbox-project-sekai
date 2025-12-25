'use client'

import { useState, useEffect } from 'react'
import { fetchGameCharacters, fetchCharacterProfiles, getCharacterIconUrl } from '@/lib/api'
import { CHARACTER_NAMES_TW, UNIT_NAMES_TW, CHARACTER_UNIT, UnitId } from '@/lib/types'

interface Character {
  id: number
  seq: number
  resourceId: number
  firstName: string
  givenName: string
  firstNameRuby: string
  givenNameRuby: string
  gender: string
  height: number
  live2dHeightAdjustment: number
  figure: string
  breastSize: string
  modelName: string
  unit: string
  supportUnitType: string
}

interface CharacterProfile {
  characterId: number
  characterVoice: string
  birthday: string
  height: string
  school: string
  schoolYear: string
  hobby: string
  specialSkill: string
  favoriteFood: string
  hatedFood: string
  weak: string
  introduction: string
}

const UNIT_ORDER: UnitId[] = ['ln', 'mmj', 'vbs', 'wxs', 'niigo', 'vs']

const UNIT_COLORS: Record<UnitId, string> = {
  ln: 'from-[#4455dd] to-[#33bbee]',
  mmj: 'from-[#88dd44] to-[#33bb77]',
  vbs: 'from-[#ee1166] to-[#ff6644]',
  wxs: 'from-[#ff9900] to-[#ffcc00]',
  niigo: 'from-[#884499] to-[#bb4488]',
  vs: 'from-[#33ccbb] to-[#88ddcc]',
}

const VIRTUAL_SINGER_COLORS: Record<number, string> = {
  21: 'from-[#33ccbb] to-[#00bbcc]', // Miku
  22: 'from-[#ffcc11] to-[#ffaa00]', // Rin
  23: 'from-[#ffee22] to-[#ffbb00]', // Len
  24: 'from-[#ffaacc] to-[#ff88aa]', // Luka
  25: 'from-[#dd4444] to-[#bb2222]', // MEIKO
  26: 'from-[#3366ff] to-[#2244cc]', // KAITO
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [profiles, setProfiles] = useState<CharacterProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<UnitId | 'all'>('all')
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [charData, profileData] = await Promise.all([
          fetchGameCharacters(),
          fetchCharacterProfiles()
        ])
        setCharacters(charData.filter((c: Character) => c.id >= 1 && c.id <= 26))
        setProfiles(profileData)
      } catch (error) {
        console.error('Error loading character data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredCharacters = selectedUnit === 'all' 
    ? characters 
    : characters.filter(c => CHARACTER_UNIT[c.id] === selectedUnit)

  const getCharacterProfile = (charId: number) => 
    profiles.find(p => p.characterId === charId)

  const selectedProfile = selectedCharacter ? getCharacterProfile(selectedCharacter) : null
  const selectedCharacterData = selectedCharacter ? characters.find(c => c.id === selectedCharacter) : null

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
          <h1 className="heading-1 text-gradient-gold mb-4">角色資料</h1>
          <p className="text-sekai-silver">
            收錄全部 26 位角色的詳細資料
          </p>
        </div>

        {/* Unit Filter */}
        <div className="card p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedUnit('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedUnit === 'all'
                  ? 'bg-gold-soft text-sekai-void'
                  : 'bg-sekai-charcoal text-sekai-silver hover:text-sekai-pearl'
              }`}
            >
              全部
            </button>
            {UNIT_ORDER.map((unit) => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedUnit === unit
                    ? `bg-gradient-to-r ${UNIT_COLORS[unit]} text-white`
                    : 'bg-sekai-charcoal text-sekai-silver hover:text-sekai-pearl'
                }`}
              >
                {UNIT_NAMES_TW[unit]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {filteredCharacters.map((char) => {
                const unit = CHARACTER_UNIT[char.id]
                const colorClass = char.id >= 21 
                  ? VIRTUAL_SINGER_COLORS[char.id] 
                  : UNIT_COLORS[unit]
                const isSelected = selectedCharacter === char.id

                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacter(char.id)}
                    className={`group relative card p-3 transition-all hover:scale-105 ${
                      isSelected ? 'ring-2 ring-gold-soft' : ''
                    }`}
                  >
                    {/* Character Icon */}
                    <div className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${colorClass}`}>
                      <img
                        src={getCharacterIconUrl(char.id)}
                        alt={CHARACTER_NAMES_TW[char.id]}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Name */}
                    <div className="mt-2 text-center">
                      <div className="text-xs text-sekai-silver truncate">
                        {CHARACTER_NAMES_TW[char.id]}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-soft rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-sekai-void" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Character Detail Panel */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {selectedCharacter && selectedProfile && selectedCharacterData ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br ${
                      selectedCharacter >= 21 
                        ? VIRTUAL_SINGER_COLORS[selectedCharacter] 
                        : UNIT_COLORS[CHARACTER_UNIT[selectedCharacter]]
                    }`}>
                      <img
                        src={getCharacterIconUrl(selectedCharacter)}
                        alt={CHARACTER_NAMES_TW[selectedCharacter]}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="heading-3 text-sekai-pearl">
                        {CHARACTER_NAMES_TW[selectedCharacter]}
                      </h2>
                      <p className="text-sm text-sekai-silver">
                        {UNIT_NAMES_TW[CHARACTER_UNIT[selectedCharacter]]}
                      </p>
                    </div>
                  </div>

                  {/* Introduction */}
                  {selectedProfile.introduction && (
                    <div className="mb-6">
                      <div className="text-sm text-sekai-mist mb-2">介紹</div>
                      <p className="text-sekai-silver text-sm leading-relaxed">
                        {selectedProfile.introduction}
                      </p>
                    </div>
                  )}

                  {/* Profile Info */}
                  <div className="space-y-3">
                    {selectedProfile.birthday && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sekai-mist">生日</span>
                        <span className="text-sekai-pearl">{selectedProfile.birthday}</span>
                      </div>
                    )}
                    {selectedProfile.height && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sekai-mist">身高</span>
                        <span className="text-sekai-pearl">{selectedProfile.height}</span>
                      </div>
                    )}
                    {selectedProfile.school && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sekai-mist">學校</span>
                        <span className="text-sekai-pearl text-right">{selectedProfile.school}</span>
                      </div>
                    )}
                    {selectedProfile.schoolYear && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sekai-mist">年級</span>
                        <span className="text-sekai-pearl">{selectedProfile.schoolYear}</span>
                      </div>
                    )}
                    {selectedProfile.characterVoice && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sekai-mist">聲優</span>
                        <span className="text-sekai-pearl">{selectedProfile.characterVoice}</span>
                      </div>
                    )}
                    {selectedProfile.hobby && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sekai-mist">興趣</span>
                        <span className="text-sekai-pearl text-right">{selectedProfile.hobby}</span>
                      </div>
                    )}
                    {selectedProfile.specialSkill && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sekai-mist">特技</span>
                        <span className="text-sekai-pearl text-right">{selectedProfile.specialSkill}</span>
                      </div>
                    )}
                    {selectedProfile.favoriteFood && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sekai-mist">喜歡的食物</span>
                        <span className="text-sekai-pearl text-right">{selectedProfile.favoriteFood}</span>
                      </div>
                    )}
                    {selectedProfile.hatedFood && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sekai-mist">討厭的食物</span>
                        <span className="text-sekai-pearl text-right">{selectedProfile.hatedFood}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Links */}
                  <div className="mt-6 pt-6 border-t border-sekai-ash/30">
                    <a
                      href={`https://sekai.best/chara/${selectedCharacter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm w-full justify-center"
                    >
                      在 Sekai.best 查看完整資料 →
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-sekai-mist">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p>選擇一個角色<br />查看詳細資料</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
