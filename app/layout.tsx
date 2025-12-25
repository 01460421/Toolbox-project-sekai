import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: '世界計畫工具箱 | SEKAI Toolbox',
  description: '奢華低調的世界計畫綜合工具 — 綜合力計算、卡片查詢、素材整理、衝榜分析',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen">
        <div className="texture-grain" aria-hidden="true" />
        
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-gold-dim/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-gold-muted/3 rounded-full blur-3xl" />
        </div>
        
        <Navigation />
        
        <main className="relative z-10">
          {children}
        </main>
        
        <footer className="relative z-10 mt-24 py-12 border-t border-sekai-ash/30">
          <div className="container-prose text-center">
            <p className="text-sekai-silver/60 text-sm font-body">
              資料來源：
              <a 
                href="https://github.com/Sekai-World/sekai-master-db-tc-diff"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-dim hover:text-gold-light transition-colors ml-1"
              >
                Sekai-World/sekai-master-db-tc-diff
              </a>
            </p>
            <p className="text-sekai-mist text-xs mt-2">
              本站為非官方粉絲工具，與 SEGA / Colorful Palette 無關
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
