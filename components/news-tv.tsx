// #region news-tv.tsx
"use client"

import { useState, useEffect } from "react"

// ===== COMPONENTE TELEVISOR DE NOTICIAS =====
// Muestra noticias satíricas que rotan automáticamente

interface NewsTVProps {
  x: number // Posición X en el mapa
  y: number // Posición Y en el mapa
}

// Array de titulares satíricos sobre política argentina y aliens
const headlines = [
  "🔥 Rosario en caos: piqueteros pelean por sándwiches",
  "📈 La inflación trepa a niveles alienígenas",
  "👽 Avistamientos OVNI aumentan 300% en el país",
  "💰 El dólar blue alcanza precios intergalácticos",
  "🏛️ Congreso debate ley de ciudadanía alien",
  "🚁 Helicópteros presidenciales reportan encuentros extraterrestres",
]

export default function NewsTV({ x, y }: NewsTVProps) {
  const [currentHeadline, setCurrentHeadline] = useState(0)

  // ===== ROTACIÓN AUTOMÁTICA DE NOTICIAS =====
  // Cambia el titular cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* ===== MARCO DEL TELEVISOR ===== */}
      <div className="w-32 h-24 bg-gray-800 pixel-border border-4 border-gray-600">
        {/* Pantalla del TV */}
        <div className="w-full h-16 bg-blue-900 relative overflow-hidden">
          {/* Barra de noticias en la parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white font-pixel text-xs p-1">
            <div className="animate-pulse">📺 NOTICIAS</div>
          </div>

          {/* Titular actual */}
          <div className="p-1 text-center">
            <div className="font-pixel text-xs text-white leading-tight animate-pulse">
              {headlines[currentHeadline]}
            </div>
          </div>
        </div>

        {/* Base del televisor */}
        <div className="w-full h-2 bg-gray-700"></div>
      </div>

      {/* Etiqueta del TV */}
      <div className="text-center font-pixel text-xs text-white mt-1">NOTICIAS TV</div>
    </div>
  )
}

// #endregion
