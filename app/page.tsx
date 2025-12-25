'use client'

import Link from 'next/link'

const features = [
  {
    title: '歌曲資料庫',
    description: '歌曲搜尋、難度資訊、BPM 查詢',
    href: '/songs',
    icon: '♪',
    accent: 'ln',
  },
  {
    title: '角色資料',
    description: '全部 26 位角色的詳細檔案',
    href: '/characters',
    icon: '✦',
    accent: 'mmj',
  },
  {
    title: '活動追蹤',
    description: '活動列表、進行中活動、歷史記錄',
    href: '/events',
    icon: '❖',
    accent: 'vbs',
  },
  {
    title: '轉蛋模擬器',
    description: '免費模擬抽卡，測試你的運氣',
    href: '/gacha',
    icon: '✧',
    accent: 'gold',
  },
  {
    title: '貼圖圖鑑',
    description: '瀏覽所有角色貼圖',
    href: '/stamps',
    icon: '❋',
    accent: 'wxs',
  },
  {
    title: '綜合力計算機',
    description: '區域道具 + CR + 豆森門 + 豆森娃',
    href: '/calculator',
    icon: '◈',
    accent: 'gold',
  },
  {
    title: '查卡系統',
    description: '搜尋卡片、專精突破、無框畫',
    href: '/calculator/cards',
    icon: '❂',
    accent: 'vs',
  },
  {
    title: '羈絆計算',
    description: '羈絆等級、經驗需求、獎勵預覽',
    href: '/growth/bonds',
    icon: '❤',
    accent: 'niigo',
  },
  {
    title: '衝榜資源規劃',
    description: '能量飲料、結晶、時間估算',
    href: '/ranking/planner',
    icon: '◆',
    accent: 'vbs',
  },
  {
    title: '衝榜分析系統',
    description: '歷史活動分數曲線與邊線預測',
    href: '/ranking/analysis',
    icon: '✦',
    accent: 'gold',
  },
  {
    title: '控分計算器',
    description: '計算達成特定分數的方法',
    href: '/ranking/score-calculator',
    icon: '◇',
    accent: 'mmj',
  },
  {
    title: '快速工具',
    description: '各種實用小工具與計算器',
    href: '/tools',
    icon: '⚙',
    accent: 'silver',
  },
]

const accentColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  ln: { bg: 'rgba(68, 85, 221, 0.1)', border: 'rgba(68, 85, 221, 0.3)', text: '#6677EE', glow: 'rgba(68, 85, 221, 0.15)' },
  mmj: { bg: 'rgba(136, 221, 68, 0.1)', border: 'rgba(136, 221, 68, 0.3)', text: '#99EE55', glow: 'rgba(136, 221, 68, 0.15)' },
  vbs: { bg: 'rgba(238, 102, 119, 0.1)', border: 'rgba(238, 102, 119, 0.3)', text: '#FF8899', glow: 'rgba(238, 102, 119, 0.15)' },
  wxs: { bg: 'rgba(255, 170, 0, 0.1)', border: 'rgba(255, 170, 0, 0.3)', text: '#FFBB33', glow: 'rgba(255, 170, 0, 0.15)' },
  niigo: { bg: 'rgba(153, 68, 187, 0.1)', border: 'rgba(153, 68, 187, 0.3)', text: '#AA66CC', glow: 'rgba(153, 68, 187, 0.15)' },
  vs: { bg: 'rgba(0, 187, 187, 0.1)', border: 'rgba(0, 187, 187, 0.3)', text: '#22DDDD', glow: 'rgba(0, 187, 187, 0.15)' },
  gold: { bg: 'rgba(198, 169, 118, 0.1)', border: 'rgba(198, 169, 118, 0.3)', text: '#E8D4A8', glow: 'rgba(198, 169, 118, 0.15)' },
  silver: { bg: 'rgba(138, 138, 153, 0.1)', border: 'rgba(138, 138, 153, 0.3)', text: '#C4C4D0', glow: 'rgba(138, 138, 153, 0.1)' },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-soft/3 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-unit-niigo/3 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-dim/2 rounded-full blur-[150px]" />
        </div>

        <div className="container-main relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold-dim/50" />
              <span className="text-gold-soft text-sm tracking-[0.3em] uppercase font-display">Project SEKAI</span>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold-dim/50" />
            </div>

            <h1 className="heading-1 animate-fade-in-up">
              <span className="block text-gold-glow text-lg tracking-[0.2em] uppercase mb-4 font-display">世界計畫</span>
              <span className="text-gradient-gold">工具箱</span>
            </h1>
            
            <p className="mt-8 text-lg text-sekai-silver font-serif italic animate-fade-in-up">
              — 為 Project SEKAI 玩家精心打造的工具集 —
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-3 animate-fade-in-up">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-dim/40 to-transparent" />
              <span className="text-gold-dim text-xs">◆</span>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-dim/40 to-transparent" />
            </div>

            <div className="mt-10 flex justify-center gap-5 animate-fade-in-up">
              <Link href="/calculator" className="btn-primary">開始計算</Link>
              <Link href="/ranking/analysis" className="btn-secondary">查看分析</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container-main">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold-dim/30" />
              <span className="text-gold-muted text-xs tracking-[0.25em] uppercase font-display">Feature Overview</span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold-dim/30" />
            </div>
            <h2 className="heading-2">功能總覽</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const colors = accentColors[feature.accent]
              return (
                <Link key={feature.href} href={feature.href}
                  className="group relative card p-6 hover:glow-gold transition-all duration-500">
                  <div className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)` }} />

                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, boxShadow: `0 4px 20px ${colors.glow}` }}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-lg font-display font-medium tracking-wide text-sekai-pearl group-hover:text-gold-pale transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="mt-3 text-sekai-silver text-sm font-serif leading-relaxed">{feature.description}</p>
                  
                  <div className="mt-5 flex items-center text-gold-dim text-sm font-serif group-hover:text-gold-soft transition-colors duration-300">
                    <span className="tracking-wide">前往</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container-main">
          <div className="divider-gold mb-16" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: '收錄歌曲', value: '500+', icon: '♪' },
              { label: '角色', value: '26', icon: '✦' },
              { label: '卡片', value: '800+', icon: '❖' },
              { label: '貼圖', value: '1000+', icon: '❋' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-gold-dim text-lg mb-2 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="number-xl group-hover:scale-105 transition-transform duration-300">{stat.value}</div>
                <div className="mt-3 text-sekai-silver text-sm font-serif tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="divider-gold mt-16" />
        </div>
      </section>

      {/* Footer */}
      <section className="py-12">
        <div className="container-main">
          <p className="text-center text-sekai-mist text-xs font-serif italic">
            本站為粉絲製作的非官方工具，與 SEGA 及 Colorful Palette 無關
          </p>
        </div>
      </section>

      <div className="py-8">
        <div className="container-main">
          <div className="flex items-center justify-center gap-4">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-dim/20 to-transparent" />
            <span className="text-gold-dim/50 text-xs">◇</span>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-dim/20 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}
