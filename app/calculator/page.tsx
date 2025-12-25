'use client'

import { useState, useMemo } from 'react'
import { 
  calculateCardPower, 
  calculateDeckPower, 
  formatPower,
  CANVAS_BONUS,
  DOLL_LEVELS,
  AREA_ITEM_MAX_LEVEL,
  type CardInput 
} from '@/lib/power-calculator'

interface CardState extends CardInput {
  id: number
}

const defaultCard = (id: number): CardState => ({
  id,
  basePower: 35000,
  rarity: 4,
  hasCanvas: true,
  groupItemLevel: 15,
  personalItemLevel: 15,
  plantLevel: 15,
  characterRank: 50,
  dollLevel: 20,
  gateLevel: 30,
  isSameUnit: true,
  isSameAttribute: true,
})

export default function CalculatorPage() {
  const [cards, setCards] = useState<CardState[]>([
    defaultCard(1),
    defaultCard(2),
    defaultCard(3),
    defaultCard(4),
    defaultCard(5),
  ])
  const [titleCount, setTitleCount] = useState(39)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 批量設定
  const [batchSettings, setBatchSettings] = useState({
    groupItemLevel: 15,
    personalItemLevel: 15,
    plantLevel: 15,
    characterRank: 50,
    dollLevel: 20,
    gateLevel: 30,
    isSameUnit: true,
    isSameAttribute: true,
  })

  const updateCard = (id: number, updates: Partial<CardState>) => {
    setCards(cards.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const applyBatchSettings = () => {
    setCards(cards.map(c => ({
      ...c,
      groupItemLevel: batchSettings.groupItemLevel,
      personalItemLevel: batchSettings.personalItemLevel,
      plantLevel: batchSettings.plantLevel,
      characterRank: batchSettings.characterRank,
      dollLevel: batchSettings.dollLevel,
      gateLevel: batchSettings.gateLevel,
      isSameUnit: batchSettings.isSameUnit,
      isSameAttribute: batchSettings.isSameAttribute,
    })))
  }

  // 計算結果
  const result = useMemo(() => {
    return calculateDeckPower(cards, titleCount)
  }, [cards, titleCount])

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-8">
          <h1 className="heading-2">綜合力計算機</h1>
          <p className="mt-2 text-sekai-silver">精確計算區域道具 + CR + MySEKAI 加成</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左側：卡片輸入 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 批量設定 */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-section">批量設定</h2>
                <button
                  onClick={applyBatchSettings}
                  className="btn-primary text-sm"
                >
                  套用到全部
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-sekai-silver mb-1">團體道具</label>
                  <input
                    type="number"
                    min="0"
                    max={AREA_ITEM_MAX_LEVEL}
                    value={batchSettings.groupItemLevel}
                    onChange={(e) => setBatchSettings({ ...batchSettings, groupItemLevel: Number(e.target.value) })}
                    className="input input-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-sekai-silver mb-1">個人道具</label>
                  <input
                    type="number"
                    min="0"
                    max={AREA_ITEM_MAX_LEVEL}
                    value={batchSettings.personalItemLevel}
                    onChange={(e) => setBatchSettings({ ...batchSettings, personalItemLevel: Number(e.target.value) })}
                    className="input input-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-sekai-silver mb-1">植物</label>
                  <input
                    type="number"
                    min="0"
                    max={AREA_ITEM_MAX_LEVEL}
                    value={batchSettings.plantLevel}
                    onChange={(e) => setBatchSettings({ ...batchSettings, plantLevel: Number(e.target.value) })}
                    className="input input-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-sekai-silver mb-1">角色等級</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={batchSettings.characterRank}
                    onChange={(e) => setBatchSettings({ ...batchSettings, characterRank: Number(e.target.value) })}
                    className="input input-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-sekai-silver mb-1">豆森娃娃</label>
                  <select
                    value={batchSettings.dollLevel}
                    onChange={(e) => setBatchSettings({ ...batchSettings, dollLevel: Number(e.target.value) })}
                    className="input input-sm"
                  >
                    {DOLL_LEVELS.map(lv => (
                      <option key={lv} value={lv}>{lv}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-sekai-silver mb-1">豆森門</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={batchSettings.gateLevel}
                    onChange={(e) => setBatchSettings({ ...batchSettings, gateLevel: Number(e.target.value) })}
                    className="input input-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={batchSettings.isSameUnit}
                    onChange={(e) => setBatchSettings({ ...batchSettings, isSameUnit: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-xs text-sekai-silver">同團</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={batchSettings.isSameAttribute}
                    onChange={(e) => setBatchSettings({ ...batchSettings, isSameAttribute: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-xs text-sekai-silver">同色</label>
                </div>
              </div>
            </div>

            {/* 卡片列表 */}
            <div className="space-y-3">
              {cards.map((card, idx) => {
                const cardResult = result.cards[idx]
                return (
                  <div key={card.id} className="card p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-gold-soft font-bold">卡{card.id}</span>
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs text-sekai-mist">基礎綜合力</label>
                          <input
                            type="number"
                            value={card.basePower}
                            onChange={(e) => updateCard(card.id, { basePower: Number(e.target.value) })}
                            className="input input-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-sekai-mist">星數</label>
                          <select
                            value={card.rarity}
                            onChange={(e) => updateCard(card.id, { rarity: Number(e.target.value) })}
                            className="input input-sm"
                          >
                            {[1, 2, 3, 4].map(r => (
                              <option key={r} value={r}>★{r}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={card.hasCanvas}
                            onChange={(e) => updateCard(card.id, { hasCanvas: e.target.checked })}
                            className="rounded"
                          />
                          <label className="text-xs text-sekai-silver">豆森畫</label>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-sekai-mist">卡片總值</span>
                          <p className="font-mono text-gold-soft">{formatPower(cardResult?.totalPower || 0)}</p>
                        </div>
                      </div>
                    </div>

                    {showAdvanced && (
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-3 border-t border-sekai-ash/20">
                        <div>
                          <label className="block text-xs text-sekai-mist">團體</label>
                          <input
                            type="number"
                            min="0"
                            max={AREA_ITEM_MAX_LEVEL}
                            value={card.groupItemLevel}
                            onChange={(e) => updateCard(card.id, { groupItemLevel: Number(e.target.value) })}
                            className="input input-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-sekai-mist">個人</label>
                          <input
                            type="number"
                            min="0"
                            max={AREA_ITEM_MAX_LEVEL}
                            value={card.personalItemLevel}
                            onChange={(e) => updateCard(card.id, { personalItemLevel: Number(e.target.value) })}
                            className="input input-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-sekai-mist">植物</label>
                          <input
                            type="number"
                            min="0"
                            max={AREA_ITEM_MAX_LEVEL}
                            value={card.plantLevel}
                            onChange={(e) => updateCard(card.id, { plantLevel: Number(e.target.value) })}
                            className="input input-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-sekai-mist">CR</label>
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={card.characterRank}
                            onChange={(e) => updateCard(card.id, { characterRank: Number(e.target.value) })}
                            className="input input-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-sekai-mist">娃娃</label>
                          <select
                            value={card.dollLevel}
                            onChange={(e) => updateCard(card.id, { dollLevel: Number(e.target.value) })}
                            className="input input-sm text-xs"
                          >
                            {DOLL_LEVELS.map(lv => (
                              <option key={lv} value={lv}>{lv}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-sekai-mist">門</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={card.gateLevel}
                            onChange={(e) => updateCard(card.id, { gateLevel: Number(e.target.value) })}
                            className="input input-sm text-xs"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={card.isSameUnit}
                            onChange={(e) => updateCard(card.id, { isSameUnit: e.target.checked })}
                            className="rounded mr-1"
                          />
                          <label className="text-xs text-sekai-mist">團</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={card.isSameAttribute}
                            onChange={(e) => updateCard(card.id, { isSameAttribute: e.target.checked })}
                            className="rounded mr-1"
                          />
                          <label className="text-xs text-sekai-mist">色</label>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 text-sm text-sekai-silver hover:text-gold-soft transition-colors"
            >
              {showAdvanced ? '▲ 隱藏個別設定' : '▼ 展開個別設定'}
            </button>

            {/* 稱號設定 */}
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-sekai-silver">加成稱號數</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={titleCount}
                    onChange={(e) => setTitleCount(Number(e.target.value))}
                    className="input input-sm w-20 text-center"
                  />
                  <span className="text-sekai-mist text-sm">× 10 = {formatPower(titleCount * 10)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：結果 */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <h2 className="heading-section mb-4">計算結果</h2>

              {/* 總綜合力 */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-sekai-charcoal/60 to-sekai-ink/80 border border-gold-dim/20 text-center mb-6">
                <p className="text-sm text-sekai-silver">隊伍總綜合力</p>
                <p className="text-4xl font-mono font-bold text-gradient-gold mt-2">
                  {formatPower(result.totalPower)}
                </p>
              </div>

              {/* 分項 */}
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-sekai-charcoal/30">
                  <p className="text-xs text-sekai-mist mb-2">卡片明細</p>
                  {result.cards.map((card, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span className="text-sekai-silver">卡{idx + 1}</span>
                      <span className="font-mono text-sekai-pearl">{formatPower(card.totalPower)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm py-1 border-t border-sekai-ash/20 mt-2 pt-2">
                    <span className="text-sekai-silver">小計</span>
                    <span className="font-mono text-gold-soft">{formatPower(result.subtotal)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-sekai-charcoal/30">
                  <span className="text-sekai-silver">稱號加成</span>
                  <span className="font-mono text-sekai-pearl">+{formatPower(result.titleBonus)}</span>
                </div>

                {/* 單卡詳細 */}
                <div className="p-3 rounded-lg bg-sekai-charcoal/30">
                  <p className="text-xs text-sekai-mist mb-2">卡1 加成分解</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-sekai-silver">加畫綜合力</span>
                      <span className="font-mono">{formatPower(result.cards[0]?.enhancedPower || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sekai-silver">區域值</span>
                      <span className="font-mono text-unit-mmj">+{formatPower(result.cards[0]?.areaBonus || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sekai-silver">CR值</span>
                      <span className="font-mono text-unit-ln">+{formatPower(result.cards[0]?.crBonus || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sekai-silver">玩偶值</span>
                      <span className="font-mono text-unit-vbs">+{formatPower(result.cards[0]?.dollBonus || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sekai-silver">門值</span>
                      <span className="font-mono text-unit-niigo">+{formatPower(result.cards[0]?.gateBonus || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 公式說明 */}
              <div className="mt-6 pt-4 border-t border-sekai-ash/30">
                <p className="text-xs text-sekai-mist mb-2">計算公式</p>
                <div className="text-xs text-sekai-silver space-y-1 font-mono">
                  <p>加畫 = 基礎 + 畫×{CANVAS_BONUS}</p>
                  <p>區域 = 加畫×0.01×(團×0.5×(1+同團) + 個×2 + 植×0.5×(1+同色))</p>
                  <p>CR = 加畫×0.001×min(CR,50)</p>
                  <p>娃/門 = 加畫×0.001×等級</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
