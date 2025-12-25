'use client'

import { useState } from 'react'

interface SekaiImageProps {
  src: string
  alt: string
  fallback?: string
  className?: string
  style?: React.CSSProperties
}

// 通用的圖片組件，帶有錯誤處理和優雅的載入狀態
export default function SekaiImage({ 
  src, 
  alt, 
  fallback = '◇',
  className = '',
  style 
}: SekaiImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-sekai-charcoal/50 text-sekai-mist ${className}`}
        style={style}
      >
        <span className="text-2xl opacity-50">{fallback}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-sekai-charcoal/30">
          <div className="w-6 h-6 border-2 border-gold-dim/30 border-t-gold-soft rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
        loading="lazy"
      />
    </div>
  )
}
