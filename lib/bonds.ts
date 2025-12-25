import { CHARACTER_NAMES_TW, UNIT_MEMBERS, type UnitId, type CharacterId } from './types'

// ========================================
// 羈絆經驗值表
// ========================================

// 每級所需經驗值
export const BOND_EXP_TABLE: Record<number, number> = (() => {
  const table: Record<number, number> = {}
  for (let i = 1; i <= 200; i++) {
    if (i <= 10) table[i] = 100
    else if (i <= 20) table[i] = 200
    else if (i <= 30) table[i] = 300
    else if (i <= 50) table[i] = 400
    else if (i <= 70) table[i] = 500
    else if (i <= 100) table[i] = 600
    else if (i <= 130) table[i] = 700
    else if (i <= 160) table[i] = 800
    else if (i <= 200) table[i] = 900
    else table[i] = 1000
  }
  return table
})()

// 累積經驗值表
export const BOND_TOTAL_EXP_TABLE: Record<number, number> = (() => {
  const table: Record<number, number> = { 1: 0 }
  let total = 0
  for (let i = 1; i <= 200; i++) {
    total += BOND_EXP_TABLE[i]
    table[i + 1] = total
  }
  return table
})()

// ========================================
// 羈絆計算函數
// ========================================

export interface BondCalculation {
  currentLevel: number
  currentExp: number
  targetLevel: number
  requiredExp: number
  estimatedGames: number
  estimatedHours: number
  rewards: BondReward[]
}

export interface BondReward {
  level: number
  rewardType: string
  amount: number
  description: string
}

/**
 * 計算羈絆升級所需經驗
 */
export function calculateBondExpRequired(
  currentLevel: number,
  currentExp: number,
  targetLevel: number
): number {
  if (targetLevel <= currentLevel) return 0

  const currentTotalExp = BOND_TOTAL_EXP_TABLE[currentLevel] + currentExp
  const targetTotalExp = BOND_TOTAL_EXP_TABLE[targetLevel]

  return targetTotalExp - currentTotalExp
}

/**
 * 計算達成目標羈絆等級所需場次
 */
export function calculateBondGamesRequired(
  requiredExp: number,
  expPerGame: number = 10 // 假設每場平均 10 exp
): number {
  return Math.ceil(requiredExp / expPerGame)
}

/**
 * 計算達成目標羈絆等級所需時間
 */
export function calculateBondTimeRequired(
  games: number,
  minutesPerGame: number = 3
): number {
  return (games * minutesPerGame) / 60 // 返回小時
}

/**
 * 獲取羈絆獎勵
 */
export function getBondRewards(
  currentLevel: number,
  targetLevel: number
): BondReward[] {
  const rewards: BondReward[] = []

  for (let level = currentLevel + 1; level <= targetLevel; level++) {
    // 每 5 級給結晶
    if (level % 5 === 0) {
      rewards.push({
        level,
        rewardType: 'crystal',
        amount: level <= 50 ? 10 : level <= 100 ? 20 : 30,
        description: '結晶',
      })
    }

    // 每 10 級給稱號
    if (level % 10 === 0) {
      rewards.push({
        level,
        rewardType: 'honor',
        amount: 1,
        description: '稱號',
      })
    }

    // 特定等級給 Live Bonus
    if ([20, 40, 60, 80, 100].includes(level)) {
      rewards.push({
        level,
        rewardType: 'liveBonus',
        amount: 1,
        description: 'Live Bonus +1',
      })
    }
  }

  return rewards
}

/**
 * 完整羈絆計算
 */
export function calculateBondProgress(
  currentLevel: number,
  currentExp: number,
  targetLevel: number,
  expPerGame: number = 10
): BondCalculation {
  const requiredExp = calculateBondExpRequired(currentLevel, currentExp, targetLevel)
  const estimatedGames = calculateBondGamesRequired(requiredExp, expPerGame)
  const estimatedHours = calculateBondTimeRequired(estimatedGames)
  const rewards = getBondRewards(currentLevel, targetLevel)

  return {
    currentLevel,
    currentExp,
    targetLevel,
    requiredExp,
    estimatedGames,
    estimatedHours,
    rewards,
  }
}

// ========================================
// 角色等級 (CR) 計算
// ========================================

// CR 經驗值表
export const CR_EXP_TABLE: Record<number, number> = (() => {
  const table: Record<number, number> = {}
  for (let i = 1; i <= 200; i++) {
    if (i <= 10) table[i] = 100
    else if (i <= 20) table[i] = 150
    else if (i <= 30) table[i] = 200
    else if (i <= 50) table[i] = 300
    else if (i <= 70) table[i] = 400
    else if (i <= 100) table[i] = 500
    else table[i] = 600
  }
  return table
})()

export const CR_TOTAL_EXP_TABLE: Record<number, number> = (() => {
  const table: Record<number, number> = { 1: 0 }
  let total = 0
  for (let i = 1; i <= 200; i++) {
    total += CR_EXP_TABLE[i]
    table[i + 1] = total
  }
  return table
})()

export interface CRCalculation {
  currentLevel: number
  currentExp: number
  targetLevel: number
  requiredExp: number
  powerIncrease: number
  estimatedGames: number
  estimatedHours: number
}

/**
 * 計算 CR 升級所需經驗
 */
export function calculateCRExpRequired(
  currentLevel: number,
  currentExp: number,
  targetLevel: number
): number {
  if (targetLevel <= currentLevel) return 0

  const currentTotalExp = CR_TOTAL_EXP_TABLE[currentLevel] + currentExp
  const targetTotalExp = CR_TOTAL_EXP_TABLE[targetLevel]

  return targetTotalExp - currentTotalExp
}

/**
 * 計算 CR 提升帶來的綜合力增加
 */
export function calculateCRPowerIncrease(
  currentLevel: number,
  targetLevel: number
): number {
  const getCRPower = (level: number): number => {
    if (level <= 10) return (level - 1) * 10
    if (level <= 20) return 90 + (level - 10) * 20
    if (level <= 30) return 290 + (level - 20) * 30
    if (level <= 50) return 590 + (level - 30) * 40
    return 1390 + (level - 50) * 50
  }

  return getCRPower(targetLevel) - getCRPower(currentLevel)
}

/**
 * 完整 CR 計算
 */
export function calculateCRProgress(
  currentLevel: number,
  currentExp: number,
  targetLevel: number,
  expPerGame: number = 15
): CRCalculation {
  const requiredExp = calculateCRExpRequired(currentLevel, currentExp, targetLevel)
  const powerIncrease = calculateCRPowerIncrease(currentLevel, targetLevel)
  const estimatedGames = Math.ceil(requiredExp / expPerGame)
  const estimatedHours = (estimatedGames * 3) / 60

  return {
    currentLevel,
    currentExp,
    targetLevel,
    requiredExp,
    powerIncrease,
    estimatedGames,
    estimatedHours,
  }
}

// ========================================
// 等級升級速度計算
// ========================================

export interface LevelSpeedEstimate {
  targetLevel: number
  daysRequired: number
  weeksRequired: number
  gamesRequired: number
  staminaRequired: number
}

/**
 * 估算達成目標等級所需時間
 */
export function estimateLevelUpSpeed(
  currentLevel: number,
  targetLevel: number,
  dailyPlayHours: number = 2,
  averageGameMinutes: number = 3
): LevelSpeedEstimate {
  const requiredExp = calculateCRExpRequired(currentLevel, 0, targetLevel)
  const expPerGame = 15 // 平均每場 CR 經驗
  const gamesRequired = Math.ceil(requiredExp / expPerGame)

  const gamesPerDay = Math.floor((dailyPlayHours * 60) / averageGameMinutes)
  const daysRequired = Math.ceil(gamesRequired / gamesPerDay)
  const weeksRequired = Math.ceil(daysRequired / 7)
  const staminaRequired = gamesRequired * 10 // 假設每場 10 體力

  return {
    targetLevel,
    daysRequired,
    weeksRequired,
    gamesRequired,
    staminaRequired,
  }
}

// ========================================
// 羈絆組合
// ========================================

export interface BondPair {
  character1: CharacterId
  character2: CharacterId
  name1: string
  name2: string
  unit: UnitId | 'cross'
}

/**
 * 獲取所有羈絆組合
 */
export function getAllBondPairs(): BondPair[] {
  const pairs: BondPair[] = []
  const characters = Object.keys(CHARACTER_NAMES_TW).map(Number) as CharacterId[]

  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      const char1 = characters[i]
      const char2 = characters[j]

      // 找出兩角色所屬團體
      let unit: UnitId | 'cross' = 'cross'
      for (const [unitId, members] of Object.entries(UNIT_MEMBERS)) {
        if (members.includes(char1) && members.includes(char2)) {
          unit = unitId as UnitId
          break
        }
      }

      // 只保留有實際羈絆關係的組合 (這裡簡化處理)
      // 實際上應該從遊戲數據中獲取
      pairs.push({
        character1: char1,
        character2: char2,
        name1: CHARACTER_NAMES_TW[char1],
        name2: CHARACTER_NAMES_TW[char2],
        unit,
      })
    }
  }

  return pairs
}

/**
 * 獲取特定角色的所有羈絆
 */
export function getCharacterBondPairs(characterId: CharacterId): BondPair[] {
  return getAllBondPairs().filter(
    (pair) => pair.character1 === characterId || pair.character2 === characterId
  )
}
