// #region start-screen.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [language, setLanguage] = useState("es")
  const [showCredits, setShowCredits] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen px-4 bg-black">
      <div className="pixel-border p-8 bg-purple-900 max-w-md w-full flex flex-col items-center gap-6">
        <h1 className="text-4xl font-pixel text-yellow-400 text-center mb-2 pixel-text">PRESIDENCIA 20XX</h1>

        <Button
          onClick={onStart}
          className="bg-lime-500 hover:bg-lime-400 text-black font-pixel pixel-button text-xl w-48 h-14 pixel-border"
        >
          INICIAR
        </Button>

        <p className="text-center font-pixel text-sm text-white">Elegí tu camino hacia el caos</p>

        <div className="flex justify-between w-full mt-8">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 font-pixel bg-black text-white pixel-border">
              <SelectValue placeholder="Idioma" />
            </SelectTrigger>
            <SelectContent className="font-pixel bg-black text-white">
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowCredits(!showCredits)}
            className="font-pixel pixel-button bg-black text-white pixel-border"
          >
            CRÉDITOS
          </Button>
        </div>

        {showCredits && (
          <div className="mt-4 text-xs font-pixel text-center">
            <p>Desarrollado por: Equipo Pixel</p>
            <p>© 20XX Todos los derechos reservados</p>
          </div>
        )}
      </div>
    </div>
  )
}

// #endregion
