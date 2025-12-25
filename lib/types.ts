// ========================================
// 基礎類型
// ========================================

export type UnitId = 'ln' | 'mmj' | 'vbs' | 'wxs' | 'niigo' | 'vs'
export type CharacterId = number // 1-26

export type Rarity = 1 | 2 | 3 | 4 // ★1 ~ ★4
export type Attribute = 'cute' | 'cool' | 'pure' | 'happy' | 'mysterious'

// ========================================
// 角色與團體資料
// ========================================

export const CHARACTER_NAMES: Record<number, string> = {
  1: '星乃一歌', 2: '天馬咲希', 3: '望月穗波', 4: '日野森志步',
  5: '花里みのり', 6: '桐谷遥', 7: '桃井愛莉', 8: '日野森雫',
  9: '小豆沢こはね', 10: '白石杏', 11: '東雲彰人', 12: '青柳冬弥',
  13: '天馬司', 14: '鳳えむ', 15: '草薙寧々', 16: '神代類',
  17: '宵崎奏', 18: '朝比奈まふゆ', 19: '東雲絵名', 20: '暁山瑞希',
  21: '初音ミク', 22: '鏡音リン', 23: '鏡音レン', 24: '巡音ルカ',
  25: 'MEIKO', 26: 'KAITO'
}

export const CHARACTER_NAMES_TW: Record<number, string> = {
  1: '星乃一歌', 2: '天馬咲希', 3: '望月穗波', 4: '日野森志歩',
  5: '花里實乃里', 6: '桐谷遙', 7: '桃井愛莉', 8: '日野森雫',
  9: '小豆澤心羽', 10: '白石杏', 11: '東雲彰人', 12: '青柳冬彌',
  13: '天馬司', 14: '鳳笑夢', 15: '草薙寧寧', 16: '神代類',
  17: '宵崎奏', 18: '朝比奈真冬', 19: '東雲繪名', 20: '曉山瑞希',
  21: '初音未來', 22: '鏡音鈴', 23: '鏡音連', 24: '巡音流歌',
  25: 'MEIKO', 26: 'KAITO'
}

export const UNIT_NAMES: Record<UnitId, string> = {
  ln: 'Leo/need',
  mmj: 'MORE MORE JUMP!',
  vbs: 'Vivid BAD SQUAD',
  wxs: 'ワンダーランズ×ショウタイム',
  niigo: '25時、ナイトコードで。',
  vs: 'VIRTUAL SINGER'
}

export const UNIT_NAMES_TW: Record<UnitId, string> = {
  ln: 'Leo/need',
  mmj: 'MORE MORE JUMP!',
  vbs: 'Vivid BAD SQUAD',
  wxs: 'Wonderlands×Showtime',
  niigo: '25時，在Night Code。',
  vs: '虛擬歌手'
}

export const UNIT_SHORT_NAMES: Record<UnitId, string> = {
  ln: 'L/n',
  mmj: 'MMJ',
  vbs: 'VBS',
  wxs: 'WxS',
  niigo: '25',
  vs: 'VS'
}

export const UNIT_MEMBERS: Record<UnitId, CharacterId[]> = {
  ln: [1, 2, 3, 4],
  mmj: [5, 6, 7, 8],
  vbs: [9, 10, 11, 12],
  wxs: [13, 14, 15, 16],
  niigo: [17, 18, 19, 20],
  vs: [21, 22, 23, 24, 25, 26]
}

export const CHARACTER_UNIT: Record<CharacterId, UnitId> = {
  1: 'ln', 2: 'ln', 3: 'ln', 4: 'ln',
  5: 'mmj', 6: 'mmj', 7: 'mmj', 8: 'mmj',
  9: 'vbs', 10: 'vbs', 11: 'vbs', 12: 'vbs',
  13: 'wxs', 14: 'wxs', 15: 'wxs', 16: 'wxs',
  17: 'niigo', 18: 'niigo', 19: 'niigo', 20: 'niigo',
  21: 'vs', 22: 'vs', 23: 'vs', 24: 'vs', 25: 'vs', 26: 'vs'
}

export const ATTRIBUTE_NAMES: Record<Attribute, string> = {
  cute: 'Cute',
  cool: 'Cool',
  pure: 'Pure',
  happy: 'Happy',
  mysterious: 'Mysterious'
}

export const ATTRIBUTE_NAMES_TW: Record<Attribute, string> = {
  cute: '可愛',
  cool: '帥氣',
  pure: '純潔',
  happy: '快樂',
  mysterious: '神秘'
}

// ========================================
// 卡片相關類型
// ========================================

export interface Card {
  id: number
  seq: number
  characterId: number
  cardRarityType: string
  specialTrainingPower1BonusFixed: number
  specialTrainingPower2BonusFixed: number
  specialTrainingPower3BonusFixed: number
  attr: Attribute
  supportUnit: UnitId
  skillId: number
  cardSkillName: string
  prefix: string
  assetbundleName: string
  gachaPhrase: string
  flavorText: string
  releaseAt: number
  archivePublishedAt: number
  cardParameters: CardParameter[]
}

export interface CardParameter {
  id: number
  cardId: number
  cardLevel: number
  cardParameterType: 'param1' | 'param2' | 'param3'
  power: number
}

export interface CardRarity {
  cardRarityType: string
  seq: number
  maxLevel: number
  maxSkillLevel: number
  trainingMaxLevel?: number
}

// ========================================
// 區域道具類型
// ========================================

export interface AreaItem {
  id: number
  areaItemType: string
  name: string
  flavorText: string
  targetUnit: UnitId
  assetbundleName: string
}

export interface AreaItemLevel {
  areaItemId: number
  level: number
  targetUnit: UnitId
  targetCardAttr: Attribute | 'all'
  power1BonusRate: number
  power1AllMatchBonusRate: number
  power2BonusRate: number
  power2AllMatchBonusRate: number
  power3BonusRate: number
  power3AllMatchBonusRate: number
}

// ========================================
// MySEKAI 類型
// ========================================

export interface MySekaiGate {
  id: number
  mysekaiGateAssetbundleName: string
  name: string
  description: string
}

export interface MySekaiFixture {
  id: number
  mysekaiFixtureType: string
  name: string
  description: string
  assetbundleName: string
}

export interface MySekaiMaterial {
  id: number
  materialType: string
  name: string
  description: string
  assetbundleName: string
}

// ========================================
// 綜合力計算類型
// ========================================

export interface PowerCalculation {
  basePower: number
  areaItemBonus: number
  characterRankBonus: number
  mysekaiGateBonus: number
  mysekaiDollBonus: number
  totalPower: number
}

export interface DeckCard {
  card: Card
  level: number
  skillLevel: number
  masterRank: number
  specialTraining: boolean
  frameless: boolean // 無框畫
}

export interface Deck {
  cards: DeckCard[]
  leader: number // index
}

// ========================================
// 羈絆相關類型
// ========================================

export interface Bond {
  characterId1: number
  characterId2: number
  level: number
  exp: number
}

export interface BondLevelExp {
  level: number
  requiredExp: number
  totalExp: number
}

// ========================================
// 衝榜相關類型
// ========================================

export interface RankingPlan {
  targetScore: number
  currentScore: number
  remainingTime: number // hours
  efficiency: number // score per hour
  requiredStamina: number
  requiredDrinks: number
  requiredCrystals: number
}

export interface BestSong {
  musicId: number
  title: string
  difficulty: string
  level: number
  noteCount: number
  duration: number // seconds
  baseScore: number
  scorePerSecond: number
  efficiency: number
}

export interface EventHistory {
  eventId: number
  eventName: string
  eventType: string
  startAt: number
  endAt: number
  borderScores: Record<number, number> // rank -> score
  scoreCurve: Array<{ timestamp: number; scores: Record<number, number> }>
}

// ========================================
// API 響應類型
// ========================================

export interface ApiResponse<T> {
  data: T
  error?: string
  timestamp: number
}

// ========================================
// 常量
// ========================================

export const MAX_DECK_SIZE = 5
export const MAX_CARD_LEVEL: Record<string, number> = {
  rarity_1: 20,
  rarity_2: 30,
  rarity_3: 50,
  rarity_4: 60,
  rarity_birthday: 60
}

export const MASTER_RANK_BONUS: Record<number, number> = {
  0: 0,
  1: 50,
  2: 150,
  3: 300,
  4: 500,
  5: 750
}

export const CHARACTER_RANK_POWER_BONUS: Record<number, number> = (() => {
  const bonus: Record<number, number> = {}
  for (let i = 1; i <= 100; i++) {
    if (i <= 10) bonus[i] = (i - 1) * 10
    else if (i <= 20) bonus[i] = 90 + (i - 10) * 20
    else if (i <= 30) bonus[i] = 290 + (i - 20) * 30
    else if (i <= 50) bonus[i] = 590 + (i - 30) * 40
    else bonus[i] = 1390 + (i - 50) * 50
  }
  return bonus
})()
