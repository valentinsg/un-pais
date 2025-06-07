"use client"

// ===== COMPONENTE CONTADOR DE MUNICIÓN =====
// Muestra la munición actual del arma seleccionada en la esquina superior derecha

interface AmmoCounterProps {
  currentWeapon: "pistol" | "machinegun" // Arma actualmente seleccionada
  weaponAmmo: { pistol: number; machinegun: number } // Munición disponible para cada arma
  isReloading: boolean // Si está en proceso de recarga
  weaponCooldown: { pistol: boolean; machinegun: boolean } // Si el arma está en cooldown
}

export default function AmmoCounter({ currentWeapon, weaponAmmo, isReloading, weaponCooldown }: AmmoCounterProps) {
  return (
    <div className="absolute top-24 right-4 z-30">
      {/* Contenedor principal con borde pixel */}
      <div className="bg-black bg-opacity-80 p-3 pixel-border neon-border-cyan">
        {/* Nombre del arma actual */}
        <div className="font-pixel text-white text-center mb-2">
          <div className="text-lg">{currentWeapon === "pistol" ? "🔫 PISTOLA" : "🔫 METRALLETA"}</div>
        </div>

        {/* Estado del arma y munición */}
        <div className="font-pixel text-center">
          {isReloading ? (
            // Muestra "RECARGANDO..." con animación de pulso
            <div className="text-yellow-400 animate-pulse">RECARGANDO...</div>
          ) : weaponCooldown[currentWeapon] ? (
            // Muestra "ENFRIANDO..." cuando el arma está en cooldown
            <div className="text-red-400 animate-pulse">ENFRIANDO...</div>
          ) : (
            // Muestra la munición actual
            <div className="text-white">
              {currentWeapon === "pistol" ? (
                <span>
                  {weaponAmmo.pistol}/8 <span className="text-yellow-400">BALAS</span>
                </span>
              ) : (
                <span>
                  {weaponAmmo.machinegun}/100 <span className="text-yellow-400">BALAS</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ===== BARRAS VISUALES DE MUNICIÓN ===== */}
        <div className="mt-2">
          {currentWeapon === "pistol" ? (
            // Pistola: 8 barras individuales (una por bala)
            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-4 ${i < weaponAmmo.pistol ? "bg-yellow-400" : "bg-gray-600"} pixel-border`}
                />
              ))}
            </div>
          ) : (
            // Metralleta: barra de progreso continua
            <div className="w-full bg-gray-600 h-3 pixel-border">
              <div
                className="h-full bg-yellow-400 transition-all duration-200"
                style={{ width: `${weaponAmmo.machinegun}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
