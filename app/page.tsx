// #region page.tsx
"use client"

import { useState, useEffect } from "react"
import MainMenu from "@/components/main-menu"
import CharacterSelection from "@/components/character-selection"
import PresidentialOffice from "@/components/presidential-office"
import ControlsModal from "@/components/controls-modal"
import CreditsModal from "@/components/credits-modal"

export type GameScreen = "main-menu" | "character-selection" | "office"
export type Character = {
  id: string
  name: string
  quote: string
  ability: string
  abilityIcon: string
  passive: string
  passiveIcon: string
  sprite: string
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("main-menu")
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [showCredits, setShowCredits] = useState(false)

  // Preload images
  useEffect(() => {
    const images = [
      "/characters/gaspar.png",
      "/characters/benito.png",
      "/characters/la-chola.png",
      "/characters/la-senora-k.png",
      "/characters/chiquito-tapon.png",
      "/backgrounds/casa-rosada.png",
      "/backgrounds/office-floor.png",
    ]

    images.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  return (
    <main className="w-full h-screen overflow-hidden bg-black">
      {currentScreen === "main-menu" && (
        <MainMenu
          onStart={() => setCurrentScreen("character-selection")}
          onShowControls={() => setShowControls(true)}
          onShowCredits={() => setShowCredits(true)}
        />
      )}

      {currentScreen === "character-selection" && (
        <CharacterSelection
          onBack={() => setCurrentScreen("main-menu")}
          onSelect={(character) => {
            setSelectedCharacter(character)
            setCurrentScreen("office")
          }}
        />
      )}

      {currentScreen === "office" && selectedCharacter && (
        <PresidentialOffice character={selectedCharacter} onBack={() => setCurrentScreen("character-selection")} />
      )}

      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
    </main>
  )
}

// #endregion
