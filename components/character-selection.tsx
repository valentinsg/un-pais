// #region character-selection.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { playSound } from "@/lib/sound"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Character } from "@/app/page"

interface CharacterSelectionProps {
  onBack: () => void
  onSelect: (character: Character) => void
}

const characters: Character[] = [
  {
    id: "gaspar",
    name: "GASPAR",
    quote: "HICE LO QUE PUDE",
    ability: "Selfie Power",
    abilityIcon: "📱",
    passive: "Influencer",
    passiveIcon: "👑",
    sprite: "/characters/gaspar.png",
  },
  {
    id: "benito",
    name: "BENITO",
    quote: "¡Sí, se puede!",
    ability: "Diplomacia",
    abilityIcon: "🤝",
    passive: "Carisma",
    passiveIcon: "✨",
    sprite: "/characters/benito.png",
  },
  {
    id: "la-chola",
    name: "LA CHOLA",
    quote: "¡Vamos por todo!",
    ability: "Mate Power",
    abilityIcon: "🧉",
    passive: "Resistencia",
    passiveIcon: "💪",
    sprite: "/characters/la-chola.png",
  },
  {
    id: "la-senora-k",
    name: "LA SEÑORA K",
    quote: "La justicia es mía",
    ability: "Lawfare",
    abilityIcon: "⚖️",
    passive: "Inmunidad",
    passiveIcon: "🛡️",
    sprite: "/characters/la-senora-k.png",
  },
  {
    id: "chiquito-tapon",
    name: "CHIQUITO TAPÓN",
    quote: "¡Somos campeones!",
    ability: "Corrupción",
    abilityIcon: "💰",
    passive: "Evasión",
    passiveIcon: "🏃",
    sprite: "/characters/chiquito-tapon.png",
  },
]

export default function CharacterSelection({ onBack, onSelect }: CharacterSelectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setSelectedIndex((prev) => Math.min(prev + 1, characters.length - 1))
    playSound("click")
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handlePrev = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setSelectedIndex((prev) => Math.max(prev - 1, 0))
    playSound("click")
    setTimeout(() => setIsTransitioning(false), 300)
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      const cardWidth = 280 // card width + margin
      scrollContainerRef.current.scrollTo({
        left: selectedIndex * cardWidth,
        behavior: "smooth",
      })
    }
  }, [selectedIndex])

  return (
    <div className="flex flex-col items-center w-full h-screen bg-gradient-to-b from-purple-900 to-black px-4 py-8">
      <div className="w-full max-w-4xl">
        <Button
          onClick={() => {
            playSound("click")
            onBack()
          }}
          variant="outline"
          className="mb-6 font-pixel bg-black text-white border-cyan-500 hover:bg-cyan-950 pixel-border"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          VOLVER
        </Button>

        <h1 className="text-3xl font-pixel text-yellow-400 text-center mb-8 pixel-text glow-text">
          ELEGÍ TU PRESIDENTE
        </h1>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory py-4 px-2"
            style={{ scrollbarWidth: "none" }}
          >
            {characters.map((character, index) => (
              <div
                key={character.id}
                className={`flex-shrink-0 w-64 mx-4 snap-center ${
                  selectedIndex === index ? "scale-105" : "scale-95 opacity-70"
                } transition-all duration-300`}
              >
                <div className="bg-purple-900 p-4 pixel-border neon-border-cyan flex flex-col items-center">
                  <div className="bg-black w-full h-64 mb-3 flex items-center justify-center pixel-border">
                    <img
                      src={character.sprite || "/placeholder.svg"}
                      alt={character.name}
                      className="object-contain h-56 pixelated"
                    />
                  </div>
                  <h3 className="font-pixel text-lg text-yellow-400 mb-1">{character.name}</h3>
                  <p className="font-pixel text-xs text-white mb-2 text-center">"{character.quote}"</p>

                  <div className="flex justify-between w-full mb-3">
                    <div className="bg-black px-3 py-1 rounded-sm font-pixel text-xs text-cyan-400">
                      {character.abilityIcon} {character.ability}
                    </div>
                    <div className="bg-black px-3 py-1 rounded-sm font-pixel text-xs text-red-400">
                      {character.passiveIcon} {character.passive}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      playSound("click")
                      onSelect(character)
                    }}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-sm pixel-border"
                  >
                    ELEGIR
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              playSound("click")
              handlePrev()
            }}
            disabled={selectedIndex === 0 || isTransitioning}
            className={`absolute left-0 top-1/2 -translate-y-1/2 bg-black p-2 rounded-full ${
              selectedIndex === 0 ? "opacity-30 cursor-not-allowed" : "opacity-100"
            }`}
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={() => {
              playSound("click")
              handleNext()
            }}
            disabled={selectedIndex === characters.length - 1 || isTransitioning}
            className={`absolute right-0 top-1/2 -translate-y-1/2 bg-black p-2 rounded-full ${
              selectedIndex === characters.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-100"
            }`}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="flex justify-center mt-4">
          {characters.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 mx-1 rounded-full cursor-pointer ${
                selectedIndex === index ? "bg-cyan-500" : "bg-gray-700"
              }`}
              onClick={() => {
                playSound("click")
                setSelectedIndex(index)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// #endregion
