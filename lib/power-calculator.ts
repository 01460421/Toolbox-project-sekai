// 綜合力計算器 - 基於 Rich 提供的公式
// 
// 公式說明：
// 1. 加畫綜合力 = 基礎綜合力 + (豆森畫 × 1500)
// 2. 區域值 = floor(加畫綜合力 × 0.01 × (團體道具×0.5×(1+同團) + 個人道具×2 + 植物×0.5×(1+同色)))
// 3. CR值 = floor(加畫綜合力 × 0.001 × min(角色等級, 50))
// 4. 玩偶值 = floor(加畫綜合力 × 0.001 × 豆森娃娃等級)
// 5. 門值 = floor(加畫綜合力 × 0.001 × 豆森門等級)
// 6. 卡片總值 = 加畫綜合力 + 區域值 + CR值 + 玩偶值 + 門值
// 7. 隊伍總和 = Σ(5張卡總值) + 10 × 加成稱號數

export interface CardInput {
  basePower: number       // 基礎綜合力
  rarity: number          // 星數 (1-4)
  hasCanvas: boolean      // 豆森畫 (0 or 1)
  groupItemLevel: number  // 團體道具等級
  personalItemLevel: number // 個人道具等級
  plantLevel: number      // 植物等級
  characterRank: number   // 角色等級
  dollLevel: number       // 豆森娃娃等級 (1, 3, 6, 10, 15, 20)
  gateLevel: number       // 豆森門等級
  isSameUnit: boolean     // 同團
  isSameAttribute: boolean // 同色
}

export interface CardResult {
  enhancedPower: number   // 加畫綜合力
  areaBonus: number       // 區域值
  crBonus: number         // CR值
  dollBonus: number       // 玩偶值
  gateBonus: number       // 門值
  totalPower: number      // 總值
}

export interface DeckResult {
  cards: CardResult[]
  subtotal: number        // 5張卡總值
  titleBonus: number      // 稱號加成
  totalPower: number      // 隊伍總綜合力
}

// 豆森畫加成 (無框加成)
export const CANVAS_BONUS = 1500

// 豆森娃娃等級對應的數值
export const DOLL_LEVELS = [0, 1, 3, 6, 10, 15, 20] as const

// 計算單張卡片的綜合力
export function calculateCardPower(card: CardInput): CardResult {
  // 1. 加畫綜合力
  const enhancedPower = card.basePower + (card.hasCanvas ? CANVAS_BONUS : 0)
  
  // 2. 區域值
  // = floor(加畫綜合力 × 0.01 × (團體×0.5×(1+同團) + 個人×2 + 植物×0.5×(1+同色)))
  const groupBonus = card.groupItemLevel * 0.5 * (1 + (card.isSameUnit ? 1 : 0))
  const personalBonus = card.personalItemLevel * 2
  const plantBonus = card.plantLevel * 0.5 * (1 + (card.isSameAttribute ? 1 : 0))
  const areaMultiplier = groupBonus + personalBonus + plantBonus
  const areaBonus = Math.floor(enhancedPower * 0.01 * areaMultiplier)
  
  // 3. CR值 = floor(加畫綜合力 × 0.001 × min(角色等級, 50))
  const effectiveCR = Math.min(card.characterRank, 50)
  const crBonus = Math.floor(enhancedPower * 0.001 * effectiveCR)
  
  // 4. 玩偶值 = floor(加畫綜合力 × 0.001 × 娃娃等級)
  const dollBonus = Math.floor(enhancedPower * 0.001 * card.dollLevel)
  
  // 5. 門值 = floor(加畫綜合力 × 0.001 × 門等級)
  const gateBonus = Math.floor(enhancedPower * 0.001 * card.gateLevel)
  
  // 6. 總值
  const totalPower = enhancedPower + areaBonus + crBonus + dollBonus + gateBonus
  
  return {
    enhancedPower,
    areaBonus,
    crBonus,
    dollBonus,
    gateBonus,
    totalPower
  }
}

// 計算整個隊伍的綜合力
export function calculateDeckPower(cards: CardInput[], titleCount: number): DeckResult {
  const cardResults = cards.map(card => calculateCardPower(card))
  const subtotal = cardResults.reduce((sum, r) => sum + r.totalPower, 0)
  const titleBonus = titleCount * 10
  const totalPower = subtotal + titleBonus
  
  return {
    cards: cardResults,
    subtotal,
    titleBonus,
    totalPower
  }
}

// 體力道具類型
export interface StaminaItem {
  name: string
  value: number  // 恢復的體力值
  icon: string
}

// 遊戲中的體力道具（只有10能量飲料和1能量飲料）
export const STAMINA_ITEMS: StaminaItem[] = [
  { name: '大體力回復飲料', value: 10, icon: '🔥' },
  { name: '小體力回復飲料', value: 1, icon: '💧' },
]

// 計算衝榜所需的體力道具
export interface StaminaPlan {
  totalStamina: number      // 所需總體力
  largeItems: number        // 10能量飲料數量
  smallItems: number        // 1能量飲料數量
  naturalRecovery: number   // 自然恢復體力 (假設每5分鐘1點)
  remainingHours: number    // 剩餘時間(小時)
}

export function calculateStaminaPlan(
  gamesNeeded: number,
  staminaPerGame: number,
  remainingHours: number,
  currentStamina: number = 0,
  prioritizeLarge: boolean = true
): StaminaPlan {
  const totalStamina = gamesNeeded * staminaPerGame - currentStamina
  const naturalRecovery = Math.floor(remainingHours * 60 / 5) // 每5分鐘恢復1點
  const staminaNeeded = Math.max(0, totalStamina - naturalRecovery)
  
  let largeItems = 0
  let smallItems = 0
  
  if (prioritizeLarge) {
    largeItems = Math.floor(staminaNeeded / 10)
    smallItems = staminaNeeded % 10
  } else {
    smallItems = staminaNeeded
  }
  
  return {
    totalStamina,
    largeItems,
    smallItems,
    naturalRecovery,
    remainingHours
  }
}

// 區域道具等級上限
export const AREA_ITEM_MAX_LEVEL = 15

// CR 計算用的斷點
export const CR_BREAKPOINTS = [
  { level: 50, multiplier: 50 },  // 50級以上都算50
] as const

// 格式化數字
export function formatPower(num: number): string {
  return num.toLocaleString('zh-TW')
}
