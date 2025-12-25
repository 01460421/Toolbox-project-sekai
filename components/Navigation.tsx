'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: '資料庫',
    href: '/songs',
    children: [
      { label: '歌曲', href: '/songs' },
      { label: '角色', href: '/characters' },
      { label: '活動', href: '/events' },
      { label: '貼圖', href: '/stamps' },
    ],
  },
  {
    label: '轉蛋',
    href: '/gacha',
    children: [
      { label: '轉蛋模擬器', href: '/gacha' },
    ],
  },
  {
    label: '綜合力',
    href: '/calculator',
    children: [
      { label: '綜合力計算機', href: '/calculator' },
      { label: '查卡系統', href: '/calculator/cards' },
    ],
  },
  {
    label: 'MySEKAI',
    href: '/mysekai/materials',
    children: [
      { label: '素材整理', href: '/mysekai/materials' },
      { label: '門', href: '/mysekai/gates' },
      { label: '娃娃', href: '/mysekai/dolls' },
      { label: '家具', href: '/mysekai/furniture' },
      { label: '無框畫', href: '/mysekai/canvas' },
    ],
  },
  {
    label: '成長',
    href: '/growth/bonds',
    children: [
      { label: '羈絆計算', href: '/growth/bonds' },
      { label: 'CR 等級', href: '/growth/character-rank' },
      { label: '升等速度', href: '/growth/level-speed' },
    ],
  },
  {
    label: '衝榜',
    href: '/ranking/planner',
    children: [
      { label: '資源規劃', href: '/ranking/planner' },
      { label: '控分表', href: '/ranking/score-control' },
      { label: '控分計算器', href: '/ranking/score-calculator' },
      { label: '分析系統', href: '/ranking/analysis' },
      { label: '邊線預測', href: '/ranking/prediction' },
    ],
  },
  {
    label: '工具',
    href: '/tools',
    children: [
      { label: '快速計算', href: '/tools' },
    ],
  },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
      style={{
        background: 'linear-gradient(180deg, rgba(14, 14, 20, 0.95) 0%, rgba(14, 14, 20, 0.85) 100%)',
        borderColor: 'rgba(198, 169, 118, 0.15)'
      }}>
      {/* 頂部金色裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(198, 169, 118, 0.3) 30%, rgba(245, 235, 210, 0.4) 50%, rgba(198, 169, 118, 0.3) 70%, transparent 90%)' }} />
      
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-glow-gold-soft"
              style={{
                background: 'linear-gradient(135deg, rgba(198, 169, 118, 0.9) 0%, rgba(168, 139, 88, 0.85) 100%)',
                border: '1px solid rgba(245, 235, 210, 0.3)',
                boxShadow: '0 2px 10px rgba(198, 169, 118, 0.2)'
              }}>
              <span className="text-sekai-void font-display font-semibold text-sm tracking-wide">SK</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-medium text-gold-pale group-hover:text-gold-glow transition-colors tracking-wide text-sm">
                SEKAI Toolbox
              </span>
              <span className="text-[10px] text-sekai-mist tracking-widest uppercase font-serif">世界計畫工具箱</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-serif tracking-wide transition-all duration-300 ${
                    pathname.startsWith(item.href)
                      ? 'text-gold-pale'
                      : 'text-sekai-silver hover:text-gold-soft'
                  }`}
                  style={pathname.startsWith(item.href) ? {
                    background: 'rgba(198, 169, 118, 0.08)',
                    boxShadow: 'inset 0 -1px 0 rgba(198, 169, 118, 0.3)'
                  } : undefined}
                >
                  {item.label}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 py-3 w-52 rounded-xl animate-fade-in"
                    style={{
                      background: 'linear-gradient(160deg, rgba(28, 26, 38, 0.98) 0%, rgba(20, 18, 28, 0.99) 100%)',
                      border: '1px solid rgba(198, 169, 118, 0.2)',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(198, 169, 118, 0.3) inset'
                    }}>
                    {/* Dropdown 頂部裝飾 */}
                    <div className="absolute top-0 left-[15%] right-[15%] h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(198, 169, 118, 0.4), transparent)' }} />
                    
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-5 py-2.5 text-sm font-serif transition-all duration-200 ${
                          pathname === child.href
                            ? 'text-gold-pale'
                            : 'text-sekai-silver hover:text-gold-soft hover:pl-6'
                        }`}
                        style={pathname === child.href ? {
                          background: 'rgba(198, 169, 118, 0.08)',
                          borderLeft: '2px solid rgba(198, 169, 118, 0.5)'
                        } : undefined}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-lg transition-all duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="選單"
            style={{
              color: mobileMenuOpen ? '#c6a976' : '#8a8899',
              background: mobileMenuOpen ? 'rgba(198, 169, 118, 0.08)' : 'transparent',
              border: `1px solid ${mobileMenuOpen ? 'rgba(198, 169, 118, 0.2)' : 'transparent'}`
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in"
            style={{ borderTop: '1px solid rgba(198, 169, 118, 0.1)' }}>
            {navItems.map((item) => (
              <div key={item.href} className="py-2">
                <div className="px-4 py-2 text-xs font-display text-gold-muted uppercase tracking-[0.15em]">
                  {item.label}
                </div>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-6 py-2.5 text-sm font-serif transition-colors ${
                      pathname === child.href
                        ? 'text-gold-pale'
                        : 'text-sekai-silver'
                    }`}
                    style={pathname === child.href ? {
                      background: 'rgba(198, 169, 118, 0.06)',
                      borderLeft: '2px solid rgba(198, 169, 118, 0.4)'
                    } : undefined}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
