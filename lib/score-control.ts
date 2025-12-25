// 控分表計算公式
// PT = floor(basePT * (1 + bonus))
// basePT = 100 + floor(score / 20000)
// bonus = 編成ボーナス (例: 2.50 = 250%)

export interface ScoreControlResult {
  basePT: number
  finalPT: number
  scoreRange: { min: number; max: number }
  bonus: number
}

export interface ScoreControlData {
  songName: string
  songNameTW: string
  mode: string
  bonuses: number[]
  scoreRanges: { min: number; max: number }[]
  ptTable: number[][]
}

export function calculatePT(score: number, bonus: number): ScoreControlResult {
  const scoreRangeIndex = Math.min(Math.floor(score / 20000), 124)
  const basePT = 100 + scoreRangeIndex
  const finalPT = Math.floor(basePT * (1 + bonus))
  
  return {
    basePT,
    finalPT,
    scoreRange: {
      min: scoreRangeIndex * 20000,
      max: scoreRangeIndex * 20000 + 19999
    },
    bonus
  }
}

// 從控分表資料中查詢PT
export function lookupPT(data: ScoreControlData, score: number, bonus: number): number | null {
  const scoreIndex = data.scoreRanges.findIndex(r => score >= r.min && score <= r.max)
  const bonusIndex = data.bonuses.findIndex(b => Math.abs(b - bonus) < 0.001)
  
  if (scoreIndex === -1 || bonusIndex === -1) return null
  return data.ptTable[scoreIndex]?.[bonusIndex] ?? null
}

// 反向計算：給定目標PT和bonus，計算需要的分數範圍
export function calculateRequiredScore(targetPT: number, bonus: number): {
  minScore: number
  maxScore: number | null
  basePT: number
} | null {
  const requiredBasePT = Math.ceil(targetPT / (1 + bonus))
  
  if (requiredBasePT < 100 || requiredBasePT > 224) {
    return null
  }
  
  const scoreRangeIndex = requiredBasePT - 100
  return {
    minScore: scoreRangeIndex * 20000,
    maxScore: scoreRangeIndex < 124 ? scoreRangeIndex * 20000 + 19999 : null,
    basePT: requiredBasePT
  }
}

// 從控分表反向查找：給定目標PT和bonus，找出所有可能的分數區間
export function lookupRequiredScore(data: ScoreControlData, targetPT: number, bonus: number): {
  scoreRange: { min: number; max: number }
  actualPT: number
}[] {
  const bonusIndex = data.bonuses.findIndex(b => Math.abs(b - bonus) < 0.001)
  if (bonusIndex === -1) return []
  
  const results: { scoreRange: { min: number; max: number }; actualPT: number }[] = []
  
  for (let i = 0; i < data.ptTable.length; i++) {
    const pt = data.ptTable[i][bonusIndex]
    if (pt === targetPT) {
      results.push({
        scoreRange: data.scoreRanges[i],
        actualPT: pt
      })
    }
  }
  
  return results
}

// 計算達到目標總PT需要的場次
export interface GamePlanResult {
  gamesNeeded: number
  totalPTFromGames: number
  ptPerGame: number
  targetPT: number
  currentPT: number
  remaining: number
}

export function calculateGamePlan(
  targetPT: number,
  currentPT: number,
  score: number,
  bonus: number,
  boostMultiplier: 1 | 2 | 3 = 1
): GamePlanResult {
  const { finalPT } = calculatePT(score, bonus)
  const ptPerGame = finalPT * boostMultiplier
  const remaining = targetPT - currentPT
  const gamesNeeded = Math.ceil(remaining / ptPerGame)
  
  return {
    gamesNeeded: Math.max(0, gamesNeeded),
    totalPTFromGames: gamesNeeded * ptPerGame,
    ptPerGame,
    targetPT,
    currentPT,
    remaining: Math.max(0, remaining)
  }
}

// 控分協助計算器：找出達到目標PT的最佳分數
export interface ScoreControlSuggestion {
  targetPT: number
  scoreRange: { min: number; max: number }
  bonus: number
  basePT: number
  gamesNeeded: number
  totalPT: number
}

export function findOptimalScore(
  data: ScoreControlData,
  targetTotalPT: number,
  currentPT: number,
  bonus: number,
  boostMultiplier: 1 | 2 | 3 = 1,
  maxGames: number = 1000
): ScoreControlSuggestion[] {
  const remaining = targetTotalPT - currentPT
  if (remaining <= 0) return []
  
  const bonusIndex = data.bonuses.findIndex(b => Math.abs(b - bonus) < 0.001)
  if (bonusIndex === -1) return []
  
  const suggestions: ScoreControlSuggestion[] = []
  
  for (let i = 0; i < data.ptTable.length; i++) {
    const pt = data.ptTable[i][bonusIndex] * boostMultiplier
    const games = Math.ceil(remaining / pt)
    
    if (games <= maxGames) {
      suggestions.push({
        targetPT: data.ptTable[i][bonusIndex],
        scoreRange: data.scoreRanges[i],
        bonus,
        basePT: 100 + i,
        gamesNeeded: games,
        totalPT: games * pt
      })
    }
  }
  
  // 按場次排序
  return suggestions.sort((a, b) => a.gamesNeeded - b.gamesNeeded)
}

// 生成控分表數據（公式計算版本）
export function generateScoreControlTable(bonusStart: number, bonusEnd: number, bonusStep: number = 0.01) {
  const bonuses: number[] = []
  for (let b = bonusStart; b <= bonusEnd + 0.001; b += bonusStep) {
    bonuses.push(Math.round(b * 100) / 100)
  }
  
  const rows: { scoreRange: { min: number; max: number }; pts: number[] }[] = []
  for (let i = 0; i <= 124; i++) {
    const scoreRange = { min: i * 20000, max: i * 20000 + 19999 }
    const basePT = 100 + i
    const pts = bonuses.map(bonus => Math.floor(basePT * (1 + bonus)))
    rows.push({ scoreRange, pts })
  }
  
  return { bonuses, rows }
}

// 格式化數字
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-TW')
}

// 常用的bonus預設值
export const COMMON_BONUSES = [
  { label: '0%', value: 0 },
  { label: '50%', value: 0.50 },
  { label: '100%', value: 1.00 },
  { label: '150%', value: 1.50 },
  { label: '200%', value: 2.00 },
  { label: '250%', value: 2.50 },
  { label: '300%', value: 3.00 },
  { label: '350%', value: 3.50 },
  { label: '400%', value: 4.00 },
  { label: '450%', value: 4.50 },
  { label: '500%', value: 5.00 },
  { label: '550%', value: 5.50 },
  { label: '600%', value: 6.00 },
  { label: '650%', value: 6.50 },
  { label: '700%', value: 7.00 },
]

// 控分表常用設定
export const SCORE_CONTROL_PRESETS = {
  common: [
    { label: '200pt', value: 200 },
    { label: '250pt', value: 250 },
    { label: '300pt', value: 300 },
    { label: '350pt', value: 350 },
    { label: '400pt', value: 400 },
    { label: '450pt', value: 450 },
    { label: '500pt', value: 500 },
  ],
  rankingTargets: [
    { label: '10萬pt', value: 100000 },
    { label: '50萬pt', value: 500000 },
    { label: '100萬pt', value: 1000000 },
    { label: '500萬pt', value: 5000000 },
    { label: '1000萬pt', value: 10000000 },
    { label: '2000萬pt', value: 20000000 },
  ]
}
