"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ControlsModalProps {
  onClose: () => void
}

export default function ControlsModal({ onClose }: ControlsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 p-6 max-w-md w-full pixel-border neon-border-cyan">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-pixel text-yellow-400">CONTROLES</h2>
          <Button variant="ghost" onClick={onClose} className="text-white">
            <X />
          </Button>
        </div>

        <div className="space-y-4 font-pixel text-white text-sm">
          <div className="flex justify-between">
            <span>Moverse:</span>
            <span className="text-cyan-300">WASD / Flechas</span>
          </div>

          <div className="flex justify-between">
            <span>Interactuar:</span>
            <span className="text-cyan-300">Click</span>
          </div>

          <div className="flex justify-between">
            <span>Disparar:</span>
            <span className="text-cyan-300">Botón DISPARAR</span>
          </div>

          <div className="flex justify-between">
            <span>Volver:</span>
            <span className="text-cyan-300">Botón VOLVER</span>
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
