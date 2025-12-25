import {
  type Card,
  type DeckCard,
  type Deck,
  type PowerCalculation,
  type UnitId,
  type Attribute,
  MASTER_RANK_BONUS,
  CHARACTER_RANK_POWER_BONUS,
  CHARACTER_UNIT,
} from './types'

// ========================================
// 基礎綜合力計算
// ========================================

/**
 * 計算單張卡片的基礎綜合力
 */
export function calculateCardBasePower(
  card: Card,
  level: number,
  specialTraining: boolean,
  masterRank: number = 0
): number {
  // 從 cardParameters 獲取各參數值
  const params = card.cardParameters.filter((p) => p.cardLevel === level)
  const param1 = params.find((p) => p.cardParameterType === 'param1')?.power || 0
  const param2 = params.find((p) => p.cardParameterType === 'param2')?.power || 0
  const param3 = params.find((p) => p.cardParameterType === 'param3')?.power || 0

  let basePower = param1 + param2 + param3

  // 特訓加成
  if (specialTraining) {
    basePower +=
      card.specialTrainingPower1BonusFixed +
      card.specialTrainingPower2BonusFixed +
      card.specialTrainingPower3BonusFixed
  }

  // 專精等級加成
  basePower += MASTER_RANK_BONUS[masterRank] || 0

  return basePower
}

/**
 * 計算無框畫加成 (MySEKAI Canvas Bonus)
 */
export function calculateCanvasBonus(
  card: Card,
  hasCanvas: boolean,
  canvasBonuses: any[]
): number {
  if (!hasCanvas) return 0

  const bonus = canvasBonuses.find(
    (b) => b.cardId === card.id
  )

  if (!bonus) return 0

  return (
    (bonus.power1BonusFixed || 0) +
    (bonus.power2BonusFixed || 0) +
    (bonus.power3BonusFixed || 0)
  )
}

// ========================================
// 區域道具加成計算
// ========================================

interface AreaItemBonusParams {
  card: Card
  areaItemLevels: any[]
  teamUnit: UnitId
  isAllMatch: boolean // 全員同屬性同團
}

/**
 * 計算區域道具對單張卡片的加成百分比
 */
export function calculateAreaItemBonusRate(params: AreaItemBonusParams): number {
  const { card, areaItemLevels, teamUnit, isAllMatch } = params
  const cardUnit = CHARACTER_UNIT[card.characterId]
  const cardAttr = card.attr

  let totalBonusRate = 0

  for (const level of areaItemLevels) {
    // 檢查是否適用於此卡片
    const unitMatch =
      level.targetUnit === 'all' ||
      level.targetUnit === cardUnit ||
      level.targetUnit === teamUnit

    const attrMatch =
      level.targetCardAttr === 'all' || level.targetCardAttr === cardAttr

    if (!unitMatch || !attrMatch) continue

    // 計算加成
    if (isAllMatch) {
      totalBonusRate +=
        (level.power1AllMatchBonusRate || 0) +
        (level.power2AllMatchBonusRate || 0) +
        (level.power3AllMatchBonusRate || 0)
    } else {
      totalBonusRate +=
        (level.power1BonusRate || 0) +
        (level.power2BonusRate || 0) +
        (level.power3BonusRate || 0)
    }
  }

  return totalBonusRate
}

// ========================================
// CR (Character Rank) 加成計算
// ========================================

/**
 * 計算角色等級對單張卡片的加成
 */
export function calculateCharacterRankBonus(
  characterId: number,
  characterRanks: Record<number, number>
): number {
  const rank = characterRanks[characterId] || 1
  return CHARACTER_RANK_POWER_BONUS[rank] || 0
}

// ========================================
// MySEKAI 加成計算
// ========================================

interface MySekaiBonus {
  gateBonus: number
  dollBonus: number
}

/**
 * 計算 MySEKAI 門與娃的加成
 * 門：全隊加成
 * 娃：特定角色加成
 */
export function calculateMysekaiBonus(
  card: Card,
  gateLevel: number,
  dollLevel: number,
  gateBonusData: any[],
  dollBonusData: any[]
): MySekaiBonus {
  // 門加成 (全隊適用)
  const gateBonus =
    gateBonusData.find((g) => g.level === gateLevel)?.bonusPower || 0

  // 娃加成 (特定角色)
  const dollBonus =
    dollBonusData.find(
      (d) => d.characterId === card.characterId && d.level === dollLevel
    )?.bonusPower || 0

  return { gateBonus, dollBonus }
}

// ========================================
// 完整綜合力計算
// ========================================

interface FullPowerCalculationParams {
  deck: DeckCard[]
  areaItemLevels: any[]
  characterRanks: Record<number, number>
  mysekaiGateLevel: number
  mysekaiDollLevels: Record<number, number> // characterId -> level
  gateBonusData: any[]
  dollBonusData: any[]
  canvasBonuses: any[]
  teamUnit: UnitId
  teamAttribute?: Attribute
}

export function calculateFullDeckPower(
  params: FullPowerCalculationParams
): PowerCalculation {
  const {
    deck,
    areaItemLevels,
    characterRanks,
    mysekaiGateLevel,
    mysekaiDollLevels,
    gateBonusData,
    dollBonusData,
    canvasBonuses,
    teamUnit,
    teamAttribute,
  } = params

  // 檢查是否全員同屬性同團
  const isAllMatch =
    deck.every((dc) => CHARACTER_UNIT[dc.card.characterId] === teamUnit) &&
    (teamAttribute
      ? deck.every((dc) => dc.card.attr === teamAttribute)
      : true)

  let totalBasePower = 0
  let totalAreaItemBonus = 0
  let totalCRBonus = 0
  let totalGateBonus = 0
  let totalDollBonus = 0

  for (const deckCard of deck) {
    const { card, level, specialTraining, masterRank, frameless } = deckCard

    // 基礎綜合力
    const basePower = calculateCardBasePower(
      card,
      level,
      specialTraining,
      masterRank
    )

    // 無框畫加成
    const canvasBonus = calculateCanvasBonus(card, frameless, canvasBonuses)

    totalBasePower += basePower + canvasBonus

    // 區域道具加成
    const areaItemBonusRate = calculateAreaItemBonusRate({
      card,
      areaItemLevels,
      teamUnit,
      isAllMatch,
    })
    totalAreaItemBonus += Math.floor(basePower * (areaItemBonusRate / 100))

    // CR 加成
    const crBonus = calculateCharacterRankBonus(card.characterId, characterRanks)
    totalCRBonus += crBonus

    // MySEKAI 加成
    const mysekaiBonus = calculateMysekaiBonus(
      card,
      mysekaiGateLevel,
      mysekaiDollLevels[card.characterId] || 0,
      gateBonusData,
      dollBonusData
    )
    totalGateBonus += mysekaiBonus.gateBonus
    totalDollBonus += mysekaiBonus.dollBonus
  }

  const totalPower =
    totalBasePower +
    totalAreaItemBonus +
    totalCRBonus +
    totalGateBonus +
    totalDollBonus

  return {
    basePower: totalBasePower,
    areaItemBonus: totalAreaItemBonus,
    characterRankBonus: totalCRBonus,
    mysekaiGateBonus: totalGateBonus,
    mysekaiDollBonus: totalDollBonus,
    totalPower,
  }
}

// ========================================
// 綜合力分析
// ========================================

export interface PowerBreakdown {
  category: string
  value: number
  percentage: number
  color: string
}

export function analyzePowerBreakdown(
  calculation: PowerCalculation
): PowerBreakdown[] {
  const { totalPower } = calculation

  return [
    {
      category: '基礎綜合力',
      value: calculation.basePower,
      percentage: (calculation.basePower / totalPower) * 100,
      color: '#B4956A',
    },
    {
      category: '區域道具',
      value: calculation.areaItemBonus,
      percentage: (calculation.areaItemBonus / totalPower) * 100,
      color: '#88DD44',
    },
    {
      category: 'CR 加成',
      value: calculation.characterRankBonus,
      percentage: (calculation.characterRankBonus / totalPower) * 100,
      color: '#4455DD',
    },
    {
      category: 'MySEKAI 門',
      value: calculation.mysekaiGateBonus,
      percentage: (calculation.mysekaiGateBonus / totalPower) * 100,
      color: '#EE6677',
    },
    {
      category: 'MySEKAI 娃',
      value: calculation.mysekaiDollBonus,
      percentage: (calculation.mysekaiDollBonus / totalPower) * 100,
      color: '#9944BB',
    },
  ]
}

// ========================================
// 輔助函數
// ========================================

export function formatPower(power: number): string {
  return power.toLocaleString('zh-TW')
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}
