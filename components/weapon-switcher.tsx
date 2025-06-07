"use client"

import { Button } from "@/components/ui/button"

// ===== COMPONENTE SELECTOR DE ARMAS =====
// Panel para cambiar entre pistola y metralleta

interface WeaponSwitcherProps {
  currentWeapon: "pistol" | "machinegun" // Arma actualmente seleccionada
  weaponAmmo: { pistol: number; machinegun: number } // Munición de cada arma
  weaponCooldown: { pistol: boolean; machinegun: boolean } // Estado de cooldown
  onWeaponSwitch: (weapon: "pistol" | "machinegun") => void // Función para cambiar arma
  canSwitch: boolean // Si se puede cambiar de arma (no durante recarga)
  isReloading: boolean // Si está recargando actualmente
}

export default function WeaponSwitcher({
  currentWeapon,
  weaponAmmo,
  weaponCooldown,
  onWeaponSwitch,
  canSwitch,
  isReloading,
}: WeaponSwitcherProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
      {/* Contenedor principal */}
      <div className="bg-black bg-opacity-70 p-2 pixel-border">
        {/* Título del panel */}
        <div className="font-pixel text-xs text-white mb-2 text-center">ARMAS</div>

        <div className="flex flex-col gap-2">
          {/* ===== BOTÓN DE PISTOLA ===== */}
          <Button
            onClick={() => onWeaponSwitch("pistol")}
            className={`font-pixel text-sm pixel-border transition-all ${
              currentWeapon === "pistol"
                ? "bg-cyan-600 hover:bg-cyan-500 text-white scale-105" // Estilo cuando está seleccionada
                : "bg-gray-600 hover:bg-gray-500 text-white" // Estilo cuando no está seleccionada
            }`}
            disabled={weaponCooldown.pistol || !canSwitch || isReloading} // Deshabilitado durante cooldown/recarga
          >
            🔫 PISTOLA [1]
            <span className="ml-2 text-xs">
              {/* Muestra estado o munición */}
              {weaponCooldown.pistol || isReloading ? "⏳" : `${weaponAmmo.pistol}/8`}
            </span>
          </Button>

          {/* ===== BOTÓN DE METRALLETA ===== */}
          <Button
            onClick={() => onWeaponSwitch("machinegun")}
            className={`font-pixel text-sm pixel-border transition-all ${
              currentWeapon === "machinegun"
                ? "bg-red-600 hover:bg-red-500 text-white scale-105" // Estilo cuando está seleccionada
                : "bg-gray-600 hover:bg-gray-500 text-white" // Estilo cuando no está seleccionada
            }`}
            disabled={weaponCooldown.machinegun || !canSwitch} // Deshabilitado durante cooldown
          >
            🔫 METRALLETA [2]
            <span className="ml-2 text-xs">
              {/* Muestra estado o munición */}
              {weaponCooldown.machinegun ? "⏳" : `${weaponAmmo.machinegun}/100`}
            </span>
          </Button>
        </div>

        {/* Indicador de bloqueo */}
        {!canSwitch && <div className="mt-2 text-center font-pixel text-xs text-red-400">BLOQUEADO</div>}
      </div>
    </div>
  )
}
