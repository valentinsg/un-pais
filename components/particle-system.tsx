// #region particle-system.tsx
"use client"

import { useEffect } from "react"

export interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: "explosion" | "impact" | "muzzle" | "alien_death" | "sparks" | "smoke"
  gravity?: boolean
  fade?: boolean
}

interface ParticleSystemProps {
  particles: Particle[]
  onParticleUpdate: (particles: Particle[]) => void
}

export default function ParticleSystem({ particles, onParticleUpdate }: ParticleSystemProps) {
  useEffect(() => {
    if (particles.length === 0) return

    const updateInterval = setInterval(() => {
      const updatedParticles = particles
        .map((particle) => {
          // Update position
          const newX = particle.x + particle.vx
          const newY = particle.y + particle.vy

          // Apply gravity if enabled
          let newVy = particle.vy
          if (particle.gravity) {
            newVy += 0.2
          }

          // Apply friction for some particle types
          let newVx = particle.vx
          if (particle.type === "explosion" || particle.type === "sparks") {
            newVx *= 0.98
            newVy *= 0.98
          }

          // Decrease life
          const newLife = particle.life - 1

          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            life: newLife,
          }
        })
        .filter((particle) => particle.life > 0)

      onParticleUpdate(updatedParticles)
    }, 16) // ~60fps

    return () => clearInterval(updateInterval)
  }, [particles, onParticleUpdate])

  return (
    <div className="absolute inset-0 pointer-events-none z-15">
      {particles.map((particle) => {
        const opacity = particle.fade ? particle.life / particle.maxLife : 1
        const scale = particle.type === "explosion" ? 1 + (1 - particle.life / particle.maxLife) * 0.5 : 1

        return (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              boxShadow:
                particle.type === "explosion" || particle.type === "muzzle"
                  ? `0 0 ${particle.size}px ${particle.color}`
                  : "none",
              animation:
                particle.type === "explosion"
                  ? "pulse 0.1s ease-out"
                  : particle.type === "sparks"
                    ? "sparkle 0.3s ease-out"
                    : "none",
            }}
          />
        )
      })}
    </div>
  )
}

// Particle creation utilities
export const createExplosionParticles = (x: number, y: number, intensity = 1): Particle[] => {
  const particles: Particle[] = []
  const particleCount = Math.floor(15 * intensity)

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
    const speed = 2 + Math.random() * 4 * intensity
    const size = 2 + Math.random() * 4

    particles.push({
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      size,
      color: `hsl(${Math.random() * 60 + 10}, 100%, ${50 + Math.random() * 30}%)`, // Orange to yellow
      type: "explosion",
      gravity: false,
      fade: true,
    })
  }

  // Add some smoke particles
  for (let i = 0; i < 5; i++) {
    particles.push({
      id: Math.random(),
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2 - 1,
      life: 60 + Math.random() * 40,
      maxLife: 100,
      size: 8 + Math.random() * 8,
      color: `rgba(100, 100, 100, 0.6)`,
      type: "smoke",
      gravity: false,
      fade: true,
    })
  }

  return particles
}

export const createImpactParticles = (x: number, y: number, direction: string): Particle[] => {
  const particles: Particle[] = []
  const particleCount = 8

  for (let i = 0; i < particleCount; i++) {
    let baseAngle = 0
    switch (direction) {
      case "up":
        baseAngle = Math.PI / 2
        break
      case "down":
        baseAngle = -Math.PI / 2
        break
      case "left":
        baseAngle = 0
        break
      case "right":
        baseAngle = Math.PI
        break
    }

    const angle = baseAngle + (Math.random() - 0.5) * Math.PI * 0.8
    const speed = 1 + Math.random() * 3

    particles.push({
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 20 + Math.random() * 15,
      maxLife: 35,
      size: 1 + Math.random() * 2,
      color: `hsl(${Math.random() * 40 + 40}, 80%, 70%)`, // Yellow to orange
      type: "impact",
      gravity: true,
      fade: true,
    })
  }

  return particles
}

export const createMuzzleFlashParticles = (x: number, y: number, direction: string): Particle[] => {
  const particles: Particle[] = []

  // Main muzzle flash
  particles.push({
    id: Math.random(),
    x,
    y,
    vx: 0,
    vy: 0,
    life: 5,
    maxLife: 5,
    size: 12,
    color: "#ffff00",
    type: "muzzle",
    gravity: false,
    fade: true,
  })

  // Sparks
  for (let i = 0; i < 6; i++) {
    let baseAngle = 0
    switch (direction) {
      case "up":
        baseAngle = -Math.PI / 2
        break
      case "down":
        baseAngle = Math.PI / 2
        break
      case "left":
        baseAngle = Math.PI
        break
      case "right":
        baseAngle = 0
        break
    }

    const angle = baseAngle + (Math.random() - 0.5) * Math.PI * 0.4
    const speed = 2 + Math.random() * 3

    particles.push({
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 10 + Math.random() * 10,
      maxLife: 20,
      size: 1 + Math.random(),
      color: `hsl(${Math.random() * 60 + 20}, 100%, 70%)`,
      type: "sparks",
      gravity: false,
      fade: true,
    })
  }

  return particles
}

export const createAlienDeathParticles = (x: number, y: number): Particle[] => {
  const particles: Particle[] = []

  // Green explosion for alien death
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.3
    const speed = 2 + Math.random() * 3

    particles.push({
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 25 + Math.random() * 15,
      maxLife: 40,
      size: 3 + Math.random() * 3,
      color: `hsl(${120 + Math.random() * 40}, 80%, ${50 + Math.random() * 30}%)`, // Green variations
      type: "alien_death",
      gravity: false,
      fade: true,
    })
  }

  // Add some glowing center particle
  particles.push({
    id: Math.random(),
    x,
    y,
    vx: 0,
    vy: 0,
    life: 15,
    maxLife: 15,
    size: 8,
    color: "#00ff00",
    type: "alien_death",
    gravity: false,
    fade: true,
  })

  return particles
}

export const createSparkParticles = (x: number, y: number, count = 5): Particle[] => {
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 1 + Math.random() * 2

    particles.push({
      id: Math.random(),
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 15 + Math.random() * 10,
      maxLife: 25,
      size: 1 + Math.random(),
      color: `hsl(${Math.random() * 60 + 40}, 100%, 80%)`,
      type: "sparks",
      gravity: true,
      fade: true,
    })
  }

  return particles
}

// #endregion
