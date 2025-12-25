// ========================================
// Sekai Master DB API
// ========================================

const BASE_URL = 'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-tc-diff/main'
const JP_BASE_URL = 'https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/main'

// Cache for API responses
const cache: Map<string, { data: unknown; timestamp: number }> = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }

  const data = await response.json()
  cache.set(url, { data, timestamp: Date.now() })
  return data as T
}

// ========================================
// Cards API
// ========================================

export async function fetchCards() {
  return fetchWithCache<any[]>(`${BASE_URL}/cards.json`)
}

export async function fetchCardRarities() {
  return fetchWithCache<any[]>(`${BASE_URL}/cardRarities.json`)
}

export async function fetchCardSkills() {
  return fetchWithCache<any[]>(`${BASE_URL}/skills.json`)
}

export async function fetchCardParameters() {
  return fetchWithCache<any[]>(`${BASE_URL}/cardParameters.json`)
}

// ========================================
// Area Items API
// ========================================

export async function fetchAreaItems() {
  return fetchWithCache<any[]>(`${BASE_URL}/areaItems.json`)
}

export async function fetchAreaItemLevels() {
  return fetchWithCache<any[]>(`${BASE_URL}/areaItemLevels.json`)
}

// ========================================
// MySEKAI API
// ========================================

export async function fetchMysekaiGates() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiGates.json`)
}

export async function fetchMysekaiGateLevels() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiGateLevels.json`)
}

export async function fetchMysekaiGateLevelMaterialCosts() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiGateLevelMaterialCosts.json`)
}

export async function fetchMysekaiFixtures() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiFixtures.json`)
}

export async function fetchMysekaiFixtureMainGenres() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiFixtureMainGenres.json`)
}

export async function fetchMysekaiFixtureSubGenres() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiFixtureSubGenres.json`)
}

export async function fetchMysekaiFixtureTags() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiFixtureTags.json`)
}

export async function fetchMysekaiGateBlueprints() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiGateBlueprints.json`)
}

export async function fetchMysekaiFixtureBlueprints() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiFixtureBlueprints.json`)
}

export async function fetchMysekaiFixtureBlueprintMaterialCosts() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiFixtureBlueprintMaterialCosts.json`)
}

export async function fetchMysekaiMaterials() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiMaterials.json`)
}

export async function fetchMysekaiMaterialGatheringLocations() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiMaterialGatheringLocations.json`)
}

export async function fetchMysekaiDecorationSets() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiDecorationSets.json`)
}

export async function fetchMysekaiCharacterTalks() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiCharacterTalks.json`)
}

export async function fetchMysekaiRanks() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiRanks.json`)
}

export async function fetchMysekaiMissions() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiMissions.json`)
}

export async function fetchMysekaiTools() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiTools.json`)
}

export async function fetchMysekaiWeathers() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiWeathers.json`)
}

export async function fetchMysekaiCollectionAreas() {
  return fetchWithCache<any[]>(`${BASE_URL}/mysekaiCollectionAreas.json`)
}

// ========================================
// Character & Bonds API
// ========================================

export async function fetchCharacterRanks() {
  return fetchWithCache<any[]>(`${BASE_URL}/characterRanks.json`)
}

export async function fetchBonds() {
  return fetchWithCache<any[]>(`${BASE_URL}/bonds.json`)
}

export async function fetchBondsRewards() {
  return fetchWithCache<any[]>(`${BASE_URL}/bondsRewards.json`)
}

export async function fetchBondsHonors() {
  return fetchWithCache<any[]>(`${BASE_URL}/bondsHonors.json`)
}

// ========================================
// Music API
// ========================================

export async function fetchMusics() {
  return fetchWithCache<any[]>(`${BASE_URL}/musics.json`)
}

export async function fetchMusicDifficulties() {
  return fetchWithCache<any[]>(`${BASE_URL}/musicDifficulties.json`)
}

export async function fetchMusicTags() {
  return fetchWithCache<any[]>(`${BASE_URL}/musicTags.json`)
}

// ========================================
// Events API
// ========================================

export async function fetchEvents() {
  return fetchWithCache<any[]>(`${BASE_URL}/events.json`)
}

export async function fetchEventCards() {
  return fetchWithCache<any[]>(`${BASE_URL}/eventCards.json`)
}

export async function fetchEventRankingRewards() {
  return fetchWithCache<any[]>(`${BASE_URL}/eventRankingRewardRanges.json`)
}

// ========================================
// Gacha API
// ========================================

export async function fetchGachas() {
  return fetchWithCache<any[]>(`${BASE_URL}/gachas.json`)
}

export async function fetchGachaCardWeights() {
  return fetchWithCache<any[]>(`${BASE_URL}/gachaCardRarityRates.json`)
}

// ========================================
// Canvas Bonus (無框畫) API
// ========================================

export async function fetchCardMysekaiCanvasBonuses() {
  return fetchWithCache<any[]>(`${BASE_URL}/cardMysekaiCanvasBonuses.json`)
}

// ========================================
// HiSekai Event Tracker API
// ========================================

const HISEKAI_API = 'https://api.hisekai.org'

export async function fetchLiveEventRanking() {
  const response = await fetch(`${HISEKAI_API}/event/live/top100`)
  if (!response.ok) throw new Error('Failed to fetch live ranking')
  return response.json()
}

export async function fetchEventHistory(eventId: number) {
  const response = await fetch(`${HISEKAI_API}/event/${eventId}/top100`)
  if (!response.ok) throw new Error('Failed to fetch event history')
  return response.json()
}

export async function fetchEventList() {
  const response = await fetch(`${HISEKAI_API}/event/list`)
  if (!response.ok) throw new Error('Failed to fetch event list')
  return response.json()
}

// ========================================
// Helper Functions
// ========================================

export function getCardImageUrl(assetbundleName: string, type: 'normal' | 'after_training' = 'normal') {
  const suffix = type === 'after_training' ? 'after_training' : 'normal'
  // 正確格式: /character/member/{assetbundleName}/card_{suffix}.webp
  return `https://storage.sekai.best/sekai-jp-assets/character/member/${assetbundleName}/card_${suffix}.webp`
}

export function getCardThumbnailUrl(assetbundleName: string, type: 'normal' | 'after_training' = 'normal') {
  const suffix = type === 'after_training' ? 'after_training' : 'normal'
  return `https://storage.sekai.best/sekai-jp-assets/thumbnail/chara/${assetbundleName}_${suffix}.webp`
}

// 備用：使用 sekai.best asset_viewer 頁面連結
export function getCardAssetViewerUrl(assetbundleName: string) {
  return `https://sekai.best/asset_viewer/character/member/${assetbundleName}`
}

export function getCharacterIconUrl(characterId: number) {
  return `https://storage.sekai.best/sekai-jp-assets/character/character2d/chara_${characterId.toString().padStart(2, '0')}/icon.webp`
}

export function getUnitLogoUrl(unit: string) {
  return `https://storage.sekai.best/sekai-jp-assets/unit_logo/${unit}_logo/${unit}_logo.webp`
}

export function getMusicJacketUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/music/jacket/${assetbundleName}/${assetbundleName}.webp`
}

// ========================================
// Stamps API
// ========================================

export async function fetchStamps() {
  return fetchWithCache<any[]>(`${BASE_URL}/stamps.json`)
}

export async function fetchGameCharacters() {
  return fetchWithCache<any[]>(`${BASE_URL}/gameCharacters.json`)
}

export async function fetchGameCharacterUnits() {
  return fetchWithCache<any[]>(`${BASE_URL}/gameCharacterUnits.json`)
}

export async function fetchCharacterProfiles() {
  return fetchWithCache<any[]>(`${BASE_URL}/characterProfiles.json`)
}

// ========================================
// Music Vocals API
// ========================================

export async function fetchMusicVocals() {
  return fetchWithCache<any[]>(`${BASE_URL}/musicVocals.json`)
}

export async function fetchOutsideCharacters() {
  return fetchWithCache<any[]>(`${BASE_URL}/outsideCharacters.json`)
}

// ========================================
// Event Details API
// ========================================

export async function fetchEventDeckBonuses() {
  return fetchWithCache<any[]>(`${BASE_URL}/eventDeckBonuses.json`)
}

export async function fetchEventStoryUnits() {
  return fetchWithCache<any[]>(`${BASE_URL}/eventStories.json`)
}

export async function fetchCheerfulCarnivalTeams() {
  return fetchWithCache<any[]>(`${BASE_URL}/cheerfulCarnivalTeams.json`)
}

export async function fetchCheerfulCarnivalSummaries() {
  return fetchWithCache<any[]>(`${BASE_URL}/cheerfulCarnivalSummaries.json`)
}

// ========================================
// Costume API
// ========================================

export async function fetchCostume3ds() {
  return fetchWithCache<any[]>(`${BASE_URL}/costume3ds.json`)
}

export async function fetchCharacterCostumes() {
  return fetchWithCache<any[]>(`${BASE_URL}/characterCostumes.json`)
}

// ========================================
// Skills API
// ========================================

export async function fetchSkills() {
  return fetchWithCache<any[]>(`${BASE_URL}/skills.json`)
}

export async function fetchSkillEffects() {
  return fetchWithCache<any[]>(`${JP_BASE_URL}/skillEffects.json`)
}

// ========================================
// Challenge Live API
// ========================================

export async function fetchChallengeLives() {
  return fetchWithCache<any[]>(`${BASE_URL}/challengeLives.json`)
}

export async function fetchChallengeLiveStages() {
  return fetchWithCache<any[]>(`${BASE_URL}/challengeLiveStages.json`)
}

// ========================================
// World Bloom / Story API
// ========================================

export async function fetchWorldBlooms() {
  return fetchWithCache<any[]>(`${BASE_URL}/worldBlooms.json`)
}

export async function fetchUnitStories() {
  return fetchWithCache<any[]>(`${BASE_URL}/unitStories.json`)
}

export async function fetchSpecialStories() {
  return fetchWithCache<any[]>(`${BASE_URL}/specialStories.json`)
}

// ========================================
// Gacha Details API
// ========================================

export async function fetchGachaCardRarityRates() {
  return fetchWithCache<any[]>(`${BASE_URL}/gachaCardRarityRates.json`)
}

export async function fetchGachaDetails() {
  return fetchWithCache<any[]>(`${BASE_URL}/gachaDetails.json`)
}

export async function fetchGachaPickups() {
  return fetchWithCache<any[]>(`${BASE_URL}/gachaPickups.json`)
}

export async function fetchGachaCeilItems() {
  return fetchWithCache<any[]>(`${BASE_URL}/gachaCeilItems.json`)
}

// ========================================
// Additional Asset URLs
// ========================================

export function getStampImageUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/stamp/${assetbundleName}/${assetbundleName}.webp`
}

export function getEventBannerUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/event/${assetbundleName}/logo/logo.webp`
}

export function getEventBackgroundUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/event/${assetbundleName}/screen/background.webp`
}

export function getGachaBannerUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/gacha/${assetbundleName}/logo/logo.webp`
}

export function getCostumeImageUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/costume3d/${assetbundleName}/costume3d_${assetbundleName}.webp`
}

export function getCharacter2dUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/character/character2d/${assetbundleName}/normal.webp`
}

// ========================================
// MySEKAI Asset URLs
// ========================================

export function getMysekaiMaterialImageUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/mysekai/material/${assetbundleName}/${assetbundleName}.webp`
}

export function getMysekaiFixtureImageUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/mysekai/fixture/${assetbundleName}/${assetbundleName}.webp`
}

export function getMysekaiGateImageUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/mysekai/gate/${assetbundleName}/${assetbundleName}.webp`
}

export function getMysekaiToolImageUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/mysekai/tool/${assetbundleName}/${assetbundleName}.webp`
}

export function getMysekaiAreaImageUrl(assetbundleName: string) {
  return `https://storage.sekai.best/sekai-jp-assets/mysekai/area/${assetbundleName}/${assetbundleName}.webp`
}
