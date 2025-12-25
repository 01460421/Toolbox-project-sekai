// ========================================
// 衝榜相關計算
// ========================================

// 能量飲料恢復量（只有兩種）
export const DRINK_RECOVERY: Record<string, number> = {
  small: 1,     // 小型能量飲料
  large: 10,    // 大型能量飲料
}

// 體力消耗
export const STAMINA_COST: Record<string, number> = {
  normal: 10,
  boost_2x: 20,
  boost_3x: 30,
}

// ========================================
// 衝榜資源規劃
// ========================================

export interface RankingPlan {
  targetScore: number
  currentScore: number
  scoreGap: number
  remainingHours: number
  requiredGames: number
  requiredStamina: number
  requiredDrinks: {
    small: number
    large: number
  }
  requiredCrystals: number
  hoursPerDay: number
  efficiency: {
    scorePerGame: number
    scorePerHour: number
    gamesPerHour: number
  }
}

export interface RankingPlanInput {
  targetScore: number
  currentScore: number
  remainingHours: number
  scorePerGame: number
  gameMinutes: number
  boostMultiplier: 1 | 2 | 3
  currentStamina: number
  maxStamina: number
}

/**
 * 計算衝榜資源需求
 */
export function calculateRankingPlan(input: RankingPlanInput): RankingPlan {
  const {
    targetScore,
    currentScore,
    remainingHours,
    scorePerGame,
    gameMinutes,
    boostMultiplier,
    currentStamina,
    maxStamina,
  } = input

  const scoreGap = targetScore - currentScore
  const staminaCost = STAMINA_COST[`boost_${boostMultiplier}x`] || 10
  const boostedScorePerGame = scorePerGame * boostMultiplier

  // 計算所需場次
  const requiredGames = Math.ceil(scoreGap / boostedScorePerGame)

  // 計算所需體力
  const requiredStamina = requiredGames * staminaCost - currentStamina

  // 自然恢復體力 (每 5 分鐘 1 體)
  const naturalRecovery = Math.floor(remainingHours * 12)

  // 需要額外補充的體力
  const extraStaminaNeeded = Math.max(0, requiredStamina - naturalRecovery)

  // 計算所需能量飲料 (優先使用大型)
  const largeDrinks = Math.floor(extraStaminaNeeded / DRINK_RECOVERY.large)
  const remainingAfterLarge = extraStaminaNeeded % DRINK_RECOVERY.large
  const smallDrinks = Math.ceil(remainingAfterLarge / DRINK_RECOVERY.small)

  // 計算所需結晶 (1 結晶 = 10 體力)
  const requiredCrystals = Math.ceil(extraStaminaNeeded / 10)

  // 效率計算
  const gamesPerHour = 60 / gameMinutes
  const scorePerHour = gamesPerHour * boostedScorePerGame
  const hoursPerDay = requiredGames / gamesPerHour / Math.ceil(remainingHours / 24)

  return {
    targetScore,
    currentScore,
    scoreGap,
    remainingHours,
    requiredGames,
    requiredStamina: Math.max(0, requiredStamina),
    requiredDrinks: {
      small: smallDrinks,
      large: largeDrinks,
    },
    requiredCrystals,
    hoursPerDay,
    efficiency: {
      scorePerGame: boostedScorePerGame,
      scorePerHour,
      gamesPerHour,
    },
  }
}

// ========================================
// 最佳曲目評估
// ========================================

export interface SongEfficiency {
  musicId: number
  title: string
  difficulty: string
  level: number
  noteCount: number
  duration: number // seconds
  baseScore: number
  scorePerSecond: number
  scorePerNote: number
  efficiency: number // 綜合效率分數
  rank: number
}

export interface SongData {
  id: number
  title: string
  difficulties: {
    difficulty: string
    level: number
    noteCount: number
    playSeconds: number
  }[]
}

/**
 * 計算歌曲效率
 */
export function calculateSongEfficiency(
  song: SongData,
  difficulty: string,
  teamPower: number,
  skillBonus: number = 1.0,
  eventBonus: number = 1.0
): SongEfficiency | null {
  const diff = song.difficulties.find((d) => d.difficulty === difficulty)
  if (!diff) return null

  // 基礎分數計算 (簡化公式)
  const basePowerScore = Math.floor(teamPower * 0.01)
  const noteScore = diff.noteCount * 100
  const baseScore = Math.floor(
    (basePowerScore + noteScore) * skillBonus * eventBonus
  )

  const scorePerSecond = baseScore / diff.playSeconds
  const scorePerNote = baseScore / diff.noteCount

  // 綜合效率 = 分數/時間 (越高越好)
  const efficiency = scorePerSecond * 100

  return {
    musicId: song.id,
    title: song.title,
    difficulty,
    level: diff.level,
    noteCount: diff.noteCount,
    duration: diff.playSeconds,
    baseScore,
    scorePerSecond,
    scorePerNote,
    efficiency,
    rank: 0, // 稍後排序時設置
  }
}

/**
 * 獲取最佳曲目排行
 */
export function getBestSongsRanking(
  songs: SongData[],
  teamPower: number,
  difficulty: string = 'master',
  limit: number = 10
): SongEfficiency[] {
  const efficiencies: SongEfficiency[] = []

  for (const song of songs) {
    const eff = calculateSongEfficiency(song, difficulty, teamPower)
    if (eff) efficiencies.push(eff)
  }

  // 按效率排序
  efficiencies.sort((a, b) => b.efficiency - a.efficiency)

  // 設置排名
  return efficiencies.slice(0, limit).map((e, i) => ({
    ...e,
    rank: i + 1,
  }))
}

// ========================================
// 活動分數曲線分析
// ========================================

export interface EventScoreCurve {
  timestamp: number
  hours: number // 距離活動開始的小時數
  scores: Record<number, number> // rank -> score
}

export interface EventAnalysis {
  eventId: number
  eventName: string
  duration: number // hours
  finalScores: Record<number, number>
  scoreCurve: EventScoreCurve[]
  averageSpeed: Record<number, number> // rank -> score/hour
  peakSpeed: Record<number, { hour: number; speed: number }>
  predictions: Record<number, number> // rank -> predicted final score
}

/**
 * 分析活動分數曲線
 */
export function analyzeEventCurve(
  eventId: number,
  eventName: string,
  startTime: number,
  endTime: number,
  scoreData: Array<{ timestamp: number; scores: Record<number, number> }>
): EventAnalysis {
  const duration = (endTime - startTime) / (1000 * 60 * 60) // hours
  const curve: EventScoreCurve[] = []

  for (const data of scoreData) {
    const hours = (data.timestamp - startTime) / (1000 * 60 * 60)
    curve.push({
      timestamp: data.timestamp,
      hours,
      scores: data.scores,
    })
  }

  // 計算平均速度
  const averageSpeed: Record<number, number> = {}
  const peakSpeed: Record<number, { hour: number; speed: number }> = {}

  const ranks = [1, 10, 100, 1000, 5000, 10000]

  for (const rank of ranks) {
    const finalScore = curve[curve.length - 1]?.scores[rank] || 0
    averageSpeed[rank] = finalScore / duration

    // 找出峰值速度
    let maxSpeed = 0
    let maxHour = 0

    for (let i = 1; i < curve.length; i++) {
      const prevScore = curve[i - 1].scores[rank] || 0
      const currScore = curve[i].scores[rank] || 0
      const hourDiff = curve[i].hours - curve[i - 1].hours
      const speed = (currScore - prevScore) / hourDiff

      if (speed > maxSpeed) {
        maxSpeed = speed
        maxHour = curve[i].hours
      }
    }

    peakSpeed[rank] = { hour: maxHour, speed: maxSpeed }
  }

  return {
    eventId,
    eventName,
    duration,
    finalScores: curve[curve.length - 1]?.scores || {},
    scoreCurve: curve,
    averageSpeed,
    peakSpeed,
    predictions: {}, // 可擴展預測功能
  }
}

// ========================================
// 邊線預測
// ========================================

export interface BorderPrediction {
  rank: number
  currentScore: number
  predictedFinal: number
  confidence: number
  trend: 'accelerating' | 'steady' | 'decelerating'
}

/**
 * 預測活動邊線
 */
export function predictBorder(
  rank: number,
  currentScore: number,
  elapsedHours: number,
  totalHours: number,
  historicalData?: EventAnalysis[]
): BorderPrediction {
  const remainingHours = totalHours - elapsedHours
  const currentSpeed = currentScore / elapsedHours

  // 簡單線性預測
  let predictedFinal = currentScore + currentSpeed * remainingHours

  // 根據歷史數據調整
  if (historicalData && historicalData.length > 0) {
    const avgFinalRatio =
      historicalData.reduce((sum, e) => {
        const midScore = e.scoreCurve.find(
          (c) => c.hours >= totalHours / 2
        )?.scores[rank]
        const finalScore = e.finalScores[rank]
        return midScore && finalScore ? sum + finalScore / midScore : sum
      }, 0) / historicalData.length

    if (avgFinalRatio > 0 && elapsedHours >= totalHours / 2) {
      predictedFinal = currentScore * avgFinalRatio
    }
  }

  // 判斷趨勢 (簡化)
  const trend: 'accelerating' | 'steady' | 'decelerating' =
    currentSpeed > predictedFinal / totalHours ? 'accelerating' : 'steady'

  return {
    rank,
    currentScore,
    predictedFinal: Math.round(predictedFinal),
    confidence: 0.7, // 簡化
    trend,
  }
}

// ========================================
// 輔助函數
// ========================================

export function formatScore(score: number): string {
  if (score >= 1_000_000_000) {
    return `${(score / 1_000_000_000).toFixed(2)}B`
  }
  if (score >= 1_000_000) {
    return `${(score / 1_000_000).toFixed(2)}M`
  }
  if (score >= 1_000) {
    return `${(score / 1_000).toFixed(1)}K`
  }
  return score.toLocaleString()
}

export function formatTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}分`
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}時`
  }
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days}天${remainingHours.toFixed(0)}時`
}
