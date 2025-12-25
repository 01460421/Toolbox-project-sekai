'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { fetchMysekaiMaterials, fetchMysekaiFixtureBlueprintMaterialCosts, fetchMysekaiGateLevelMaterialCosts, getMysekaiMaterialImageUrl } from '@/lib/api'

interface Material {
  id: number
  seq: number
  mysekaiMaterialType: string
  name: string
  assetbundleName: string
}

interface MaterialCost {
  materialId: number
  quantity: number
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [fixtureCosts, setFixtureCosts] = useState<MaterialCost[]>([])
  const [gateCosts, setGateCosts] = useState<MaterialCost[]>([])
  const [loading, setLoading] = useState(true)
  const [owned, setOwned] = useState<Record<number, number>>({})
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function loadData() {
      try {
        const [materialsData, blueprintCostsData, gateCostsData] = await Promise.all([
          fetchMysekaiMaterials(),
          fetchMysekaiFixtureBlueprintMaterialCosts().catch(() => []),
          fetchMysekaiGateLevelMaterialCosts().catch(() => [])
        ])
        setMaterials(materialsData.sort((a: Material, b: Material) => a.seq - b.seq))
        setFixtureCosts(blueprintCostsData)
        setGateCosts(gateCostsData)
      } catch (error) {
        console.error('Failed to load materials:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('mysekai-materials-owned')
    if (saved) {
      setOwned(JSON.parse(saved))
    }
  }, [])

  const updateOwned = (id: number, amount: number) => {
    const newOwned = { ...owned, [id]: Math.max(0, amount) }
    setOwned(newOwned)
    localStorage.setItem('mysekai-materials-owned', JSON.stringify(newOwned))
  }

  const materialTotals = useMemo(() => {
    const totals: Record<number, { fixture: number; gate: number; total: number }> = {}
    materials.forEach(m => {
      totals[m.id] = { fixture: 0, gate: 0, total: 0 }
    })
    fixtureCosts.forEach(cost => {
      if (totals[cost.materialId]) {
        totals[cost.materialId].fixture += cost.quantity
        totals[cost.materialId].total += cost.quantity
      }
    })
    gateCosts.forEach(cost => {
      if (totals[cost.materialId]) {
        totals[cost.materialId].gate += cost.quantity
        totals[cost.materialId].total += cost.quantity
      }
    })
    return totals
  }, [materials, fixtureCosts, gateCosts])

  const categories = useMemo(() => {
    const cats = new Set(materials.map(m => m.mysekaiMaterialType))
    return ['all', ...Array.from(cats)]
  }, [materials])

  const filteredMaterials = filter === 'all'
    ? materials
    : materials.filter(m => m.mysekaiMaterialType === filter)

  const getCategoryName = (type: string) => {
    const names: Record<string, string> = {
      'material': '基礎素材',
      'processed_material': '加工素材',
      'rare_material': '稀有素材',
      'special_material': '特殊素材',
      'memoria': '回憶碎片',
      'all': '全部'
    }
    return names[type] || type
  }

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      'material': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      'processed_material': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'rare_material': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      'special_material': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      'memoria': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    }
    return colors[type] || 'bg-sekai-charcoal text-sekai-silver border-sekai-ash/30'
  }

  const totalOwned = materials.reduce((sum, m) => sum + (owned[m.id] || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-sekai-silver">載入素材資料中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main">
        <div className="text-center mb-12">
          <h1 className="heading-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
              MySEKAI 素材整理
            </span>
          </h1>
          <p className="mt-2 text-sekai-silver">追蹤您的素材收集進度</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: '門', href: '/mysekai/gates', icon: '🚪', color: 'from-unit-vbs to-unit-vbs/50', desc: '升級與加成' },
            { label: '娃娃', href: '/mysekai/dolls', icon: '🧸', color: 'from-unit-niigo to-unit-niigo/50', desc: '角色加成' },
            { label: '家具', href: '/mysekai/furniture', icon: '🪑', color: 'from-unit-wxs to-unit-wxs/50', desc: '藍圖收集' },
            { label: '無框畫', href: '/mysekai/canvas', icon: '🖼️', color: 'from-unit-mmj to-unit-mmj/50', desc: '卡片加成' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card p-4 text-center hover:glow-gold group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform shadow-lg`}>
                {item.icon}
              </div>
              <span className="text-sm font-medium text-sekai-pearl">{item.label}</span>
              <p className="text-xs text-sekai-mist mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>

        <div className="card p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />
          <h2 className="heading-section mb-4 relative">總覽</h2>
          <div className="grid sm:grid-cols-4 gap-6 relative">
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">素材種類</p>
              <p className="number-xl mt-1">{materials.length}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">已記錄</p>
              <p className="number-xl mt-1">{totalOwned.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">家具所需</p>
              <p className="number-xl mt-1 text-unit-wxs">{Object.values(materialTotals).reduce((s, t) => s + t.fixture, 0).toLocaleString()}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-sekai-charcoal/50">
              <p className="text-sm text-sekai-silver">門所需</p>
              <p className="number-xl mt-1 text-unit-vbs">{Object.values(materialTotals).reduce((s, t) => s + t.gate, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                filter === cat
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg'
                  : 'bg-sekai-charcoal text-sekai-silver hover:text-emerald-400 border border-transparent'
              }`}
            >
              {getCategoryName(cat)}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaterials.map((material) => {
            const totals = materialTotals[material.id] || { fixture: 0, gate: 0, total: 0 }
            const ownedAmount = owned[material.id] || 0
            const progress = totals.total > 0 ? Math.min(100, (ownedAmount / totals.total) * 100) : 0

            return (
              <div key={material.id} className="card p-4 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sekai-charcoal to-sekai-ink flex items-center justify-center overflow-hidden border border-sekai-ash/20">
                    <img
                      src={getMysekaiMaterialImageUrl(material.assetbundleName)}
                      alt={material.name}
                      className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sekai-pearl truncate">{material.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full border ${getCategoryColor(material.mysekaiMaterialType)}`}>
                      {getCategoryName(material.mysekaiMaterialType)}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-sekai-silver">進度</span>
                    <span className={progress >= 100 ? 'text-emerald-400' : 'text-sekai-mist'}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="flex justify-between p-2 rounded bg-sekai-charcoal/50">
                    <span className="text-sekai-silver">家具需求</span>
                    <span className="text-unit-wxs">{totals.fixture.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-sekai-charcoal/50">
                    <span className="text-sekai-silver">門需求</span>
                    <span className="text-unit-vbs">{totals.gate.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => updateOwned(material.id, ownedAmount - 10)} className="btn-icon w-8 h-8 text-sm">-10</button>
                  <input
                    type="number"
                    value={ownedAmount}
                    onChange={(e) => updateOwned(material.id, Number(e.target.value))}
                    className="input flex-1 text-center"
                    min="0"
                  />
                  <button onClick={() => updateOwned(material.id, ownedAmount + 10)} className="btn-icon w-8 h-8 text-sm">+10</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setOwned({})
              localStorage.removeItem('mysekai-materials-owned')
            }}
            className="btn btn-sm text-sekai-mist hover:text-unit-vbs"
          >
            重置所有數量
          </button>
        </div>
      </div>
    </div>
  )
}
