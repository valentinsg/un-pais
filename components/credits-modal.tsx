// #region credits-modal.tsx
"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CreditsModalProps {
  onClose: () => void
}

export default function CreditsModal({ onClose }: CreditsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 p-6 max-w-md w-full pixel-border neon-border-cyan">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-pixel text-yellow-400">CRÉDITOS</h2>
          <Button variant="ghost" onClick={onClose} className="text-white">
            <X />
          </Button>
        </div>

        <div className="space-y-4 font-pixel text-white text-sm">
          <div>
            <h3 className="text-cyan-300 mb-1">PRESIDENCIA 20XX</h3>
            <p>Un juego satírico sobre la política argentina</p>
          </div>

          <div>
            <h3 className="text-cyan-300 mb-1">DESARROLLO</h3>
            <p>Equipo Pixel</p>
          </div>

          <div>
            <h3 className="text-cyan-300 mb-1">ARTE</h3>
            <p>Pixel Artists Unidos</p>
          </div>

          <div>
            <h3 className="text-cyan-300 mb-1">AGRADECIMIENTOS</h3>
            <p>A todos los políticos que inspiraron este juego con sus acciones cuestionables</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={onClose} className="font-pixel bg-cyan-600 hover:bg-cyan-500 text-white">
            CERRAR
          </Button>
        </div>
      </div>
    </div>
  )
}

// #endregion
