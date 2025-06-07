// #region achievement-popup.tsx
"use client"

import { useEffect, useState } from "react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

interface AchievementPopupProps {
  achievement: Achievement
}

export default function AchievementPopup({ achievement }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2800)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-yellow-600 text-black p-4 pixel-border neon-border-cyan max-w-xs">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{achievement.icon}</span>
          <div>
            <div className="font-pixel text-sm font-bold">¡LOGRO DESBLOQUEADO!</div>
            <div className="font-pixel text-xs">{achievement.title}</div>
            <div className="font-pixel text-xs opacity-80">{achievement.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// #endregion
