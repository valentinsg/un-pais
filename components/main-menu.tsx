// #region main-menu.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { playSound } from "@/lib/sound"

interface MainMenuProps {
  onStart: () => void
  onShowControls: () => void
  onShowCredits: () => void
}

export default function MainMenu({ onStart, onShowControls, onShowCredits }: MainMenuProps) {
  const [glowIntensity, setGlowIntensity] = useState(0)

  // Pulsating glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity((prev) => {
        const newValue = prev + 0.05
        return newValue > 1 ? 0 : newValue
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Blurred background with chaos elements */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[url('/backgrounds/casa-rosada.png')] bg-cover bg-center opacity-30 blur-sm">
          {/* Chaos elements */}
          <div className="absolute top-1/4 left-1/4 text-4xl animate-float">👽</div>
          <div className="absolute top-1/3 right-1/3 text-4xl animate-float-delay">🔥</div>
          <div className="absolute bottom-1/4 right-1/4 text-4xl animate-float-alt">💸</div>
          <div className="absolute bottom-1/3 left-1/3 text-4xl animate-float-delay-alt">📰</div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-4">
        <h1 className="text-5xl font-pixel text-center text-yellow-400 mb-8 pixel-text glow-text">PRESIDENCIA 20XX</h1>

        <Button
          onClick={() => {
            playSound("click")
            onStart()
          }}
          className={`bg-purple-700 hover:bg-purple-600 text-white font-pixel text-xl w-64 h-16 mb-6 pixel-border neon-border`}
          style={{
            boxShadow: `0 0 ${10 + glowIntensity * 20}px ${5 + glowIntensity * 10}px rgba(168, 85, 247, ${0.4 + glowIntensity * 0.6})`,
          }}
        >
          START
        </Button>

        <p className="text-center font-pixel text-cyan-300 mb-12">Elegí tu destino. O crealo.</p>

        <div className="flex gap-4">
          <Button
            onClick={() => {
              playSound("click")
              onShowCredits()
            }}
            variant="outline"
            className="font-pixel bg-black text-white border-cyan-500 hover:bg-cyan-950 pixel-border"
          >
            Créditos
          </Button>

          <Button
            onClick={() => {
              playSound("click")
              onShowControls()
            }}
            variant="outline"
            className="font-pixel bg-black text-white border-cyan-500 hover:bg-cyan-950 pixel-border"
          >
            Controles
          </Button>
        </div>
      </div>
    </div>
  )
}

// #endregion
