"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Pause, Play } from "lucide-react"
import type { Character } from "@/app/page"
import EventPopup from "@/components/event-popup"
import AchievementPopup from "@/components/achievement-popup"
import WeaponSwitcher from "@/components/weapon-switcher"
import ParticleSystem, {
  type Particle,
  createExplosionParticles,
  createImpactParticles,
  createMuzzleFlashParticles,
  createAlienDeathParticles,
  createSparkParticles,
} from "@/components/particle-system"
import NewsTV from "@/components/news-tv"
import AmmoCounter from "@/components/ammo-counter"

// ===== INTERFACES Y TIPOS =====
// Definimos todas las estructuras de datos que usa el juego

interface PresidentialOfficeProps {
  character: Character // El personaje seleccionado por el jugador
  onBack: () => void // Función para volver al menú anterior
}

// Posición del jugador en el mapa
interface Position {
  x: number
  y: number
  direction: "up" | "down" | "left" | "right" // Dirección hacia donde mira el jugador
}

// Proyectiles (balas) que dispara el jugador
interface Projectile {
  id: number // ID único para cada bala
  x: number // Posición X en el mapa
  y: number // Posición Y en el mapa
  direction: "up" | "down" | "left" | "right" // Dirección de movimiento
  active: boolean // Si la bala sigue activa (no ha impactado)
  speed: number // Velocidad de movimiento
  startTime: number // Momento en que se disparó (para limpiar balas viejas)
}

// Aliens enemigos que aparecen en el juego
interface Alien {
  id: number // ID único
  x: number // Posición X
  y: number // Posición Y
  health: number // Vida del alien (actualmente siempre 1)
  isFlashing: boolean // Si está parpadeando (cuando recibe daño)
  active: boolean // Si sigue vivo
  type: "basic" | "fast" // Tipo de alien (básico o rápido)
  speed: number // Velocidad de movimiento
  size: number // Tamaño visual
  lastAttackTime: number // Último momento que atacó al jugador
}

// Items que dejan caer los aliens al morir
interface DroppedItem {
  id: number
  x: number
  y: number
  type: "data_chip" // Por ahora solo hay chips de datos
  collected: boolean // Si ya fue recogido por el jugador
}

// NPCs (ministros) con los que puede hablar el jugador
interface NPC {
  id: string // ID único del ministro
  name: string // Nombre corto
  title: string // Título completo
  avatar: string // Emoji que lo representa
  x: number // Posición X en el mapa
  y: number // Posición Y en el mapa
  messages: string[] // Array de mensajes que puede decir
  showDialog: boolean // Si está mostrando el diálogo actualmente
  currentMessage: number // Índice del mensaje actual
}

// Estadísticas del país que maneja el presidente
interface Stats {
  economy: number // Economía (0-100)
  chaos: number // Nivel de caos (0-100)
  popularity: number // Popularidad presidencial (0-100)
  hunger: number // Hambre en el país (0-100)
  health: number // Sistema de salud (0-100)
  education: number // Sistema educativo (0-100)
  justice: number // Sistema judicial (0-100)
  technology: number // Nivel tecnológico (0-100)
}

// Logros que puede desbloquear el jugador
interface Achievement {
  id: string // ID único del logro
  title: string // Título del logro
  description: string // Descripción de cómo desbloquearlo
  icon: string // Emoji que representa el logro
  unlocked: boolean // Si ya fue desbloqueado
}

// Eventos temporales que aparecen durante el juego
interface ActiveEvent {
  event: any // Datos del evento
  timeRemaining: number // Tiempo restante para decidir
  isActive: boolean // Si el evento está activo
}

// Tipos de armas disponibles
type WeaponType = "pistol" | "machinegun"

// ===== COMPONENTE PRINCIPAL =====
export default function PresidentialOffice({ character, onBack }: PresidentialOfficeProps) {
  // ===== ESTADOS DEL JUEGO =====
  // Todos los estados que controlan el comportamiento del juego

  // Posición y movimiento del jugador
  const [position, setPosition] = useState<Position>({ x: 400, y: 300, direction: "down" })
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 }) // Offset de la cámara para seguir al jugador

  // Sistema de armas
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>("pistol") // Arma actual
  const [weaponAmmo, setWeaponAmmo] = useState({ pistol: 8, machinegun: 100 }) // Munición de cada arma
  const [weaponCooldown, setWeaponCooldown] = useState({ pistol: false, machinegun: false }) // Cooldowns de armas
  const [isReloading, setIsReloading] = useState(false) // Si está recargando
  const [isFiring, setIsFiring] = useState(false) // Si está disparando (para metralleta)
  const [canSwitchWeapon, setCanSwitchWeapon] = useState(true) // Si puede cambiar de arma

  // Entidades del juego
  const [projectiles, setProjectiles] = useState<Projectile[]>([]) // Array de balas activas
  const [aliens, setAliens] = useState<Alien[]>([]) // Array de aliens vivos
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]) // Items en el suelo
  const [particles, setParticles] = useState<Particle[]>([]) // Sistema de partículas para efectos

  // Contadores para IDs únicos
  const [nextProjectileId, setNextProjectileId] = useState(0)
  const [nextAlienId, setNextAlienId] = useState(0)
  const [nextItemId, setNextItemId] = useState(0)

  // Estados de la interfaz
  const [isPaused, setIsPaused] = useState(false) // Si el juego está pausado
  const [gameTime, setGameTime] = useState(0) // Tiempo total de juego
  const [nextEventTime, setNextEventTime] = useState(15000) // Cuándo aparece el próximo evento
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null) // Evento actual activo

  // Sistema de logros
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_shot",
      title: "Primer Disparo",
      description: "Disparaste por primera vez",
      icon: "🔫",
      unlocked: false,
    },
    {
      id: "alien_killer",
      title: "Exterminador",
      description: "Mataste 5 aliens",
      icon: "👽",
      unlocked: false,
    },
    {
      id: "social_president",
      title: "Presidente Social",
      description: "Hablaste con 3 ministros",
      icon: "🗣️",
      unlocked: false,
    },
    {
      id: "weapon_master",
      title: "Maestro de Armas",
      description: "Cambiaste de arma 5 veces",
      icon: "⚔️",
      unlocked: false,
    },
    {
      id: "survivor",
      title: "Superviviente",
      description: "Sobreviviste 5 minutos",
      icon: "⏰",
      unlocked: false,
    },
    {
      id: "explosive_expert",
      title: "Experto en Explosivos",
      description: "Creaste 50 explosiones",
      icon: "💥",
      unlocked: false,
    },
    {
      id: "data_collector",
      title: "Recolector de Datos",
      description: "Recogiste 3 chips de datos alien",
      icon: "💾",
      unlocked: false,
    },
  ])

  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null) // Logro recién desbloqueado

  // Estadísticas del jugador para logros
  const [gameStats, setGameStats] = useState({
    shotsFired: 0, // Disparos realizados
    aliensKilled: 0, // Aliens eliminados
    ministersSpokenTo: 0, // Ministros con los que habló
    weaponSwitches: 0, // Veces que cambió de arma
    survivalTime: 0, // Tiempo sobrevivido en milisegundos
    explosionsCreated: 0, // Explosiones creadas
    dataChipsCollected: 0, // Chips de datos recogidos
  })

  // Estadísticas del país
  const [stats, setStats] = useState<Stats>({
    economy: 100,
    chaos: 0,
    popularity: 50,
    hunger: 30,
    health: 70,
    education: 60,
    justice: 40,
    technology: 50,
  })

  const [statsChanged, setStatsChanged] = useState<{ [key: string]: boolean }>({}) // Para animar cambios en stats

  // NPCs (ministros) en el juego
  const [npcs, setNpcs] = useState<NPC[]>([
    {
      id: "security",
      name: "Min. Seguridad",
      title: "📢 Ministro de Seguridad",
      avatar: "🛡️",
      x: 600,
      y: 200,
      messages: [
        "Presi, hay disturbios en el centro.",
        "Los aliens están invadiendo!",
        "Necesitamos más presupuesto para seguridad.",
        "La situación está bajo control... por ahora.",
      ],
      showDialog: false,
      currentMessage: 0,
    },
    {
      id: "economy",
      name: "Min. Economía",
      title: "📢 Ministro de Economía",
      avatar: "💰",
      x: 200,
      y: 500,
      messages: [
        "La inflación se disparó otra vez.",
        "Tenemos que imprimir más billetes.",
        "Los mercados están nerviosos.",
        "El dólar está por las nubes.",
      ],
      showDialog: false,
      currentMessage: 0,
    },
    {
      id: "health",
      name: "Min. Salud",
      title: "📢 Ministro de Salud",
      avatar: "🏥",
      x: 150,
      y: 150,
      messages: [
        "Los hospitales están colapsados.",
        "Necesitamos más vacunas urgente.",
        "La pandemia alien es preocupante.",
        "Los médicos están en huelga.",
      ],
      showDialog: false,
      currentMessage: 0,
    },
    {
      id: "education",
      name: "Min. Educación",
      title: "📢 Ministro de Educación",
      avatar: "📚",
      x: 650,
      y: 550,
      messages: [
        "Las escuelas necesitan más recursos.",
        "Los maestros piden aumento.",
        "La educación digital es el futuro.",
        "Los estudiantes protestan por becas.",
      ],
      showDialog: false,
      currentMessage: 0,
    },
  ])

  // ===== REFERENCIAS Y EFECTOS VISUALES =====
  const gameLoopRef = useRef<number | null>(null) // Referencia al loop principal del juego
  const keysPressed = useRef<Set<string>>(new Set()) // Teclas presionadas actualmente
  const containerRef = useRef<HTMLDivElement>(null) // Referencia al contenedor del juego
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 800 }) // Tamaño de la ventana
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 }) // Efecto de temblor de pantalla
  const [fadeIn, setFadeIn] = useState(true) // Efecto de fade-in al entrar

  // ===== EFECTO DE FADE-IN =====
  // Crea una transición suave al entrar a la oficina presidencial
  useEffect(() => {
    setTimeout(() => setFadeIn(false), 500)
  }, [])

  // ===== MANEJO DEL TAMAÑO DE VENTANA =====
  // Actualiza el tamaño del viewport cuando la ventana cambia de tamaño
  useEffect(() => {
    const updateViewport = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight - 80, // Restamos 80px para el HUD superior
      })
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  // ===== SISTEMA DE SONIDO =====
  // Simula efectos de sonido (en una implementación real usaríamos archivos de audio)
  const playSound = useCallback((soundType: string) => {
    console.log(`🔊 Playing sound: ${soundType}`)
    // En una implementación real, aquí cargaríamos y reproduciríamos archivos de audio
  }, [])

  // ===== EFECTO DE TEMBLOR DE PANTALLA =====
  // Crea un efecto visual de impacto cuando ocurren explosiones o disparos
  const triggerScreenShake = useCallback((intensity = 5) => {
    setScreenShake({
      x: (Math.random() - 0.5) * intensity, // Movimiento aleatorio en X
      y: (Math.random() - 0.5) * intensity, // Movimiento aleatorio en Y
    })
    // Vuelve a la posición normal después de 100ms
    setTimeout(() => setScreenShake({ x: 0, y: 0 }), 100)
  }, [])

  // ===== SISTEMA DE PARTÍCULAS =====
  // Maneja los efectos visuales como explosiones, chispas, etc.

  // Añade nuevas partículas al sistema
  const addParticles = useCallback((newParticles: Particle[]) => {
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  // Actualiza las partículas existentes (llamado por el sistema de partículas)
  const updateParticles = useCallback((updatedParticles: Particle[]) => {
    setParticles(updatedParticles)
  }, [])

  // ===== SISTEMA DE LOGROS =====
  // Maneja el desbloqueo y visualización de logros
  const unlockAchievement = useCallback(
    (achievementId: string) => {
      setAchievements((prev) => {
        const updated = prev.map((achievement) => {
          // Si el logro no está desbloqueado, lo desbloqueamos
          if (achievement.id === achievementId && !achievement.unlocked) {
            setNewAchievement(achievement) // Muestra el popup del logro
            playSound("achievement") // Reproduce sonido de logro
            // Oculta el popup después de 3 segundos
            setTimeout(() => setNewAchievement(null), 3000)
            return { ...achievement, unlocked: true }
          }
          return achievement
        })
        return updated
      })
    },
    [playSound],
  )

  // ===== VERIFICACIÓN DE LOGROS =====
  // Revisa constantemente si se cumplen las condiciones para desbloquear logros
  useEffect(() => {
    // Primer disparo
    if (gameStats.shotsFired >= 1 && !achievements.find((a) => a.id === "first_shot")?.unlocked) {
      unlockAchievement("first_shot")
    }
    // Exterminador (5 aliens)
    if (gameStats.aliensKilled >= 5 && !achievements.find((a) => a.id === "alien_killer")?.unlocked) {
      unlockAchievement("alien_killer")
    }
    // Presidente social (3 ministros)
    if (gameStats.ministersSpokenTo >= 3 && !achievements.find((a) => a.id === "social_president")?.unlocked) {
      unlockAchievement("social_president")
    }
    // Maestro de armas (5 cambios)
    if (gameStats.weaponSwitches >= 5 && !achievements.find((a) => a.id === "weapon_master")?.unlocked) {
      unlockAchievement("weapon_master")
    }
    // Superviviente (5 minutos = 300000ms)
    if (gameStats.survivalTime >= 300000 && !achievements.find((a) => a.id === "survivor")?.unlocked) {
      unlockAchievement("survivor")
    }
    // Experto en explosivos (50 explosiones)
    if (gameStats.explosionsCreated >= 50 && !achievements.find((a) => a.id === "explosive_expert")?.unlocked) {
      unlockAchievement("explosive_expert")
    }
    // Recolector de datos (3 chips)
    if (gameStats.dataChipsCollected >= 3 && !achievements.find((a) => a.id === "data_collector")?.unlocked) {
      unlockAchievement("data_collector")
    }
  }, [gameStats, achievements, unlockAchievement])

  // ===== CONTROLES DE TECLADO =====
  // Maneja la entrada del jugador (movimiento, disparo, pausa, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo procesa teclas si el juego no está pausado y no hay eventos activos
      if (!isPaused && !activeEvent) {
        keysPressed.current.add(e.key.toLowerCase())
      }

      // ESC siempre funciona para pausar (excepto durante eventos)
      if (e.key === "Escape") {
        if (!activeEvent) {
          setIsPaused(!isPaused)
        }
      }

      // Cambio de armas con teclas numéricas (solo si se puede cambiar)
      if (e.key === "1" && canSwitchWeapon) {
        handleWeaponSwitch("pistol")
      }
      if (e.key === "2" && canSwitchWeapon) {
        handleWeaponSwitch("machinegun")
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase())
      // Deja de disparar cuando se suelta la barra espaciadora
      if (e.key === " ") {
        setIsFiring(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isPaused, activeEvent, canSwitchWeapon])

  // ===== SISTEMA DE ESTADÍSTICAS =====
  // Actualiza las estadísticas del país con animaciones visuales
  const updateStats = useCallback((newStats: Partial<Stats>) => {
    setStats((prev) => {
      const updated = { ...prev }

      // Aplica los cambios a cada estadística
      Object.entries(newStats).forEach(([key, value]) => {
        const currentValue = updated[key as keyof Stats]
        // Mantiene los valores entre 0 y 100
        const newValue = Math.max(0, Math.min(100, currentValue + value))
        updated[key as keyof Stats] = newValue
      })

      // Marca las estadísticas que cambiaron para animarlas
      const changed: { [key: string]: boolean } = {}
      Object.keys(newStats).forEach((key) => {
        if (prev[key as keyof Stats] !== updated[key as keyof Stats]) {
          changed[key] = true
        }
      })
      setStatsChanged(changed)

      // Quita la animación después de 1 segundo
      setTimeout(() => setStatsChanged({}), 1000)
      return updated
    })
  }, [])

  // ===== SISTEMA DE ARMAS =====
  // Maneja el cambio entre pistola y metralleta
  const handleWeaponSwitch = useCallback(
    (weapon: WeaponType) => {
      // Solo cambia si es diferente y se puede cambiar
      if (weapon !== currentWeapon && canSwitchWeapon && !isReloading) {
        setCurrentWeapon(weapon)
        setGameStats((prev) => ({ ...prev, weaponSwitches: prev.weaponSwitches + 1 }))
        playSound("weapon_switch")

        // Añade partículas de chispas al cambiar arma
        addParticles(createSparkParticles(position.x, position.y, 3))
      }
    },
    [currentWeapon, canSwitchWeapon, isReloading, playSound, addParticles, position],
  )

  // ===== SISTEMA DE DISPARO =====
  // Maneja el disparo de ambas armas con sus diferentes comportamientos
  const handleShoot = useCallback(() => {
    // No dispara si hay eventos, está pausado o recargando
    if (activeEvent || isPaused || isReloading) return

    const currentTime = Date.now()

    if (currentWeapon === "pistol") {
      // PISTOLA: Disparo único, 8 balas, recarga de 2 segundos
      if (weaponAmmo.pistol > 0 && !weaponCooldown.pistol) {
        // Calcula la posición inicial de la bala según la dirección del jugador
        let bulletX = position.x
        let bulletY = position.y

        switch (position.direction) {
          case "up":
            bulletY -= 20 // Bala aparece arriba del jugador
            break
          case "down":
            bulletY += 20 // Bala aparece abajo del jugador
            break
          case "left":
            bulletX -= 20 // Bala aparece a la izquierda del jugador
            break
          case "right":
            bulletX += 20 // Bala aparece a la derecha del jugador
            break
        }

        // Crea el proyectil
        const newProjectile: Projectile = {
          id: nextProjectileId,
          x: bulletX,
          y: bulletY,
          direction: position.direction,
          active: true,
          speed: 15, // Velocidad de la pistola
          startTime: currentTime,
        }

        // Añade la bala al juego y actualiza estadísticas
        setProjectiles((prev) => [...prev, newProjectile])
        setNextProjectileId((prev) => prev + 1)
        setWeaponAmmo((prev) => ({ ...prev, pistol: prev.pistol - 1 }))
        setGameStats((prev) => ({ ...prev, shotsFired: prev.shotsFired + 1 }))
        playSound("pistol_shot")
        triggerScreenShake(3)

        // Añade partículas de destello del cañón
        addParticles(createMuzzleFlashParticles(bulletX, bulletY, position.direction))

        // Si se acabaron las balas, inicia la recarga
        if (weaponAmmo.pistol === 1) {
          setIsReloading(true)
          setWeaponCooldown((prev) => ({ ...prev, pistol: true }))
          setCanSwitchWeapon(false) // No puede cambiar de arma mientras recarga
          playSound("reload_start")

          // Recarga después de 2 segundos
          setTimeout(() => {
            setWeaponAmmo((prev) => ({ ...prev, pistol: 8 })) // Recarga completa
            setWeaponCooldown((prev) => ({ ...prev, pistol: false }))
            setIsReloading(false)
            setCanSwitchWeapon(true)
            playSound("reload_complete")
          }, 2000)
        }
      }
    } else if (currentWeapon === "machinegun") {
      // METRALLETA: Disparo automático, 100 balas, cooldown de 3 segundos
      if (weaponAmmo.machinegun > 0 && !weaponCooldown.machinegun) {
        // Calcula posición con pequeña dispersión para simular retroceso
        let bulletX = position.x
        let bulletY = position.y

        switch (position.direction) {
          case "up":
            bulletY -= 20
            break
          case "down":
            bulletY += 20
            break
          case "left":
            bulletX -= 20
            break
          case "right":
            bulletX += 20
            break
        }

        const newProjectile: Projectile = {
          id: nextProjectileId + Math.random(), // ID único con componente aleatorio
          x: bulletX + (Math.random() - 0.5) * 5, // Pequeña dispersión en X
          y: bulletY + (Math.random() - 0.5) * 5, // Pequeña dispersión en Y
          direction: position.direction,
          active: true,
          speed: 18, // Velocidad de la metralleta (más rápida)
          startTime: currentTime,
        }

        setProjectiles((prev) => [...prev, newProjectile])
        setNextProjectileId((prev) => prev + 1)
        setWeaponAmmo((prev) => ({ ...prev, machinegun: prev.machinegun - 1 }))
        setGameStats((prev) => ({ ...prev, shotsFired: prev.shotsFired + 1 }))
        playSound("machinegun_shot")
        triggerScreenShake(2) // Temblor más suave para la metralleta

        // Partículas de destello
        addParticles(createMuzzleFlashParticles(bulletX, bulletY, position.direction))
      }
    }
  }, [
    currentWeapon,
    weaponAmmo,
    weaponCooldown,
    nextProjectileId,
    position,
    activeEvent,
    isPaused,
    isReloading,
    playSound,
    triggerScreenShake,
    addParticles,
  ])

  // ===== DISPARO CONTINUO DE METRALLETA =====
  // Maneja el disparo automático cuando se mantiene presionada la barra espaciadora
  useEffect(() => {
    if (currentWeapon === "machinegun" && isFiring && !weaponCooldown.machinegun && !isPaused && !activeEvent) {
      // Dispara cada 100ms (10 disparos por segundo)
      const fireInterval = setInterval(() => {
        if (weaponAmmo.machinegun > 0) {
          handleShoot()
        } else {
          // Se acabó la munición, inicia cooldown
          setWeaponCooldown((prev) => ({ ...prev, machinegun: true }))
          setCanSwitchWeapon(false)
          setIsFiring(false)

          // Cooldown de 3 segundos
          setTimeout(() => {
            setWeaponAmmo((prev) => ({ ...prev, machinegun: 100 })) // Recarga completa
            setWeaponCooldown((prev) => ({ ...prev, machinegun: false }))
            setCanSwitchWeapon(true)
            playSound("reload_complete")
          }, 3000)
        }
      }, 100)

      return () => clearInterval(fireInterval)
    }
  }, [currentWeapon, isFiring, weaponCooldown.machinegun, isPaused, activeEvent, weaponAmmo.machinegun, handleShoot])

  // ===== SISTEMA DE ALIENS =====
  // Genera oleadas de aliens enemigos
  const spawnAliens = useCallback(() => {
    const alienCount = 3 + Math.floor(Math.random() * 3) // Entre 3 y 5 aliens
    const newAliens: Alien[] = []

    for (let i = 0; i < alienCount; i++) {
      // Elige un borde aleatorio del mapa para que aparezca el alien
      const edge = Math.floor(Math.random() * 4) // 0: arriba, 1: derecha, 2: abajo, 3: izquierda
      let x, y

      switch (edge) {
        case 0: // Borde superior
          x = Math.random() * 800
          y = 0
          break
        case 1: // Borde derecho
          x = 800
          y = Math.random() * 800
          break
        case 2: // Borde inferior
          x = Math.random() * 800
          y = 800
          break
        case 3: // Borde izquierdo
          x = 0
          y = Math.random() * 800
          break
        default:
          x = 0
          y = 0
      }

      // 30% de probabilidad de alien rápido, 70% alien básico
      const alienType = Math.random() > 0.7 ? "fast" : "basic"

      newAliens.push({
        id: nextAlienId + i,
        x,
        y,
        health: 1, // Todos los aliens mueren de un disparo
        isFlashing: false,
        active: true,
        type: alienType,
        speed: alienType === "fast" ? 2 : 1, // Aliens rápidos se mueven el doble
        size: alienType === "fast" ? 6 : 8, // Aliens rápidos son más pequeños
        lastAttackTime: 0,
      })

      // Partículas de aparición para cada alien
      addParticles(createExplosionParticles(x, y, 0.5))
    }

    setAliens((prev) => [...prev, ...newAliens])
    setNextAlienId((prev) => prev + alienCount)
    setGameStats((prev) => ({ ...prev, explosionsCreated: prev.explosionsCreated + alienCount }))
    playSound("alien_spawn")
    triggerScreenShake(8)
  }, [nextAlienId, playSound, addParticles, triggerScreenShake])

  // ===== SISTEMA DE RECOLECCIÓN DE ITEMS =====
  // Verifica si el jugador está cerca de algún item para recogerlo
  const checkItemCollection = useCallback(() => {
    droppedItems.forEach((item) => {
      // Si el jugador está a menos de 25 píxeles del item
      if (!item.collected && Math.abs(position.x - item.x) < 25 && Math.abs(position.y - item.y) < 25) {
        // Marca el item como recogido
        setDroppedItems((prev) =>
          prev.map((i) => {
            if (i.id === item.id) {
              return { ...i, collected: true }
            }
            return i
          }),
        )

        // Procesa el efecto del item
        if (item.type === "data_chip") {
          setGameStats((prev) => ({ ...prev, dataChipsCollected: prev.dataChipsCollected + 1 }))
          updateStats({ technology: +10 }) // Aumenta tecnología en 10 puntos
          playSound("item_collect")
          addParticles(createSparkParticles(item.x, item.y, 8))

          // Elimina el item del juego después de la animación
          setTimeout(() => {
            setDroppedItems((prev) => prev.filter((i) => i.id !== item.id))
          }, 500)
        }
      }
    })
  }, [position, droppedItems, updateStats, playSound, addParticles])

  // ===== LOOP PRINCIPAL DEL JUEGO =====
  // El corazón del juego que se ejecuta 60 veces por segundo
  useEffect(() => {
    if (isPaused || activeEvent) return // No ejecuta si está pausado o hay eventos

    const gameLoop = () => {
      const currentTime = Date.now()

      // ===== MOVIMIENTO DEL JUGADOR =====
      const step = 17 // Velocidad de movimiento (reducida 30% para mejor control)
      let newX = position.x
      let newY = position.y
      let newDirection = position.direction

      // Verifica teclas de movimiento
      if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) {
        newY = Math.max(position.y - step, 50) // No sale del borde superior
        newDirection = "up"
      }
      if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) {
        newY = Math.min(position.y + step, 750) // No sale del borde inferior
        newDirection = "down"
      }
      if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) {
        newX = Math.max(position.x - step, 50) // No sale del borde izquierdo
        newDirection = "left"
      }
      if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) {
        newX = Math.min(position.x + step, 750) // No sale del borde derecho
        newDirection = "right"
      }

      // ===== DISPARO =====
      if (keysPressed.current.has(" ")) {
        if (currentWeapon === "pistol") {
          handleShoot() // Disparo único para pistola
        } else if (currentWeapon === "machinegun") {
          setIsFiring(true) // Disparo continuo para metralleta
        }
      }

      // Actualiza posición si cambió
      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY, direction: newDirection })

        // Actualiza la cámara para seguir al jugador
        setCameraOffset({
          x: viewportSize.width / 2 - newX, // Centra horizontalmente
          y: (viewportSize.height - 80) / 2 - newY, // Centra verticalmente (menos HUD)
        })
      }

      // ===== ACTUALIZACIÓN DE PROYECTILES =====
      setProjectiles(
        (prev) =>
          prev
            .map((projectile) => {
              if (!projectile.active) return projectile

              let newX = projectile.x
              let newY = projectile.y

              // Mueve el proyectil según su dirección
              switch (projectile.direction) {
                case "up":
                  newY -= projectile.speed
                  break
                case "down":
                  newY += projectile.speed
                  break
                case "left":
                  newX -= projectile.speed
                  break
                case "right":
                  newX += projectile.speed
                  break
              }

              // ===== DETECCIÓN DE COLISIONES CON ALIENS =====
              aliens.forEach((alien) => {
                // Si la bala está cerca de un alien activo
                if (
                  alien.active &&
                  Math.abs(newX - alien.x) < 20 &&
                  Math.abs(newY - alien.y) < 20 &&
                  projectile.active
                ) {
                  // Crea efectos visuales de muerte del alien
                  addParticles(createAlienDeathParticles(alien.x, alien.y))
                  addParticles(createExplosionParticles(alien.x, alien.y, 0.8))

                  // 30% de probabilidad de que el alien deje un chip de datos
                  if (Math.random() > 0.7) {
                    setDroppedItems((prev) => [
                      ...prev,
                      {
                        id: nextItemId,
                        x: alien.x,
                        y: alien.y,
                        type: "data_chip",
                        collected: false,
                      },
                    ])
                    setNextItemId((prev) => prev + 1)
                  }

                  // Marca el alien como muerto
                  setAliens((prevAliens) =>
                    prevAliens.map((a) => {
                      if (a.id === alien.id) {
                        return { ...a, isFlashing: true, active: false }
                      }
                      return a
                    }),
                  )

                  // Actualiza estadísticas
                  setGameStats((prev) => ({
                    ...prev,
                    aliensKilled: prev.aliensKilled + 1,
                    explosionsCreated: prev.explosionsCreated + 1,
                  }))
                  playSound("alien_hit")
                  triggerScreenShake(6)
                  projectile.active = false // Desactiva la bala

                  // Elimina el alien después de la animación de parpadeo
                  setTimeout(() => {
                    setAliens((prevAliens) => prevAliens.filter((a) => a.id !== alien.id))
                  }, 200)
                }
              })

              // ===== LIMPIEZA DE PROYECTILES =====
              // Elimina balas que salen del mapa o son muy viejas (3 segundos)
              if (newX < -50 || newX > 850 || newY < -50 || newY > 850 || currentTime - projectile.startTime > 3000) {
                if (projectile.active) {
                  // Crea partículas de impacto al chocar con los bordes
                  addParticles(createImpactParticles(projectile.x, projectile.y, projectile.direction))
                }
                return { ...projectile, active: false }
              }

              return { ...projectile, x: newX, y: newY }
            })
            .filter((p) => p.active), // Solo mantiene proyectiles activos
      )

      // ===== ACTUALIZACIÓN DE ALIENS =====
      setAliens((prev) =>
        prev.map((alien) => {
          if (!alien.active) return alien

          // Calcula la distancia al jugador
          const dx = position.x - alien.x
          const dy = position.y - alien.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // ===== ATAQUE DEL ALIEN =====
          // Si está cerca del jugador y han pasado 2 segundos desde el último ataque
          if (distance < 30 && currentTime - alien.lastAttackTime > 2000) {
            // Elige una estadística aleatoria para reducir
            const statToReduce = ["popularity", "health", "economy"][Math.floor(Math.random() * 3)]
            updateStats({ [statToReduce]: -5 }) // Reduce la estadística en 5 puntos
            playSound("alien_attack")
            triggerScreenShake(8)
            addParticles(createExplosionParticles(position.x, position.y, 0.5))

            return { ...alien, lastAttackTime: currentTime }
          }

          // ===== MOVIMIENTO DEL ALIEN =====
          // Se mueve hacia el jugador si no está muy cerca
          if (distance > 5) {
            const moveX = (dx / distance) * alien.speed
            const moveY = (dy / distance) * alien.speed

            return {
              ...alien,
              x: alien.x + moveX,
              y: alien.y + moveY,
            }
          }

          return alien
        }),
      )

      // Verifica recolección de items
      checkItemCollection()

      // Actualiza tiempo de supervivencia
      setGameStats((prev) => ({ ...prev, survivalTime: prev.survivalTime + 16 }))

      // Programa la siguiente iteración del loop
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    // Limpia el loop cuando el componente se desmonta
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [
    position,
    isPaused,
    activeEvent,
    viewportSize,
    aliens,
    currentWeapon,
    handleShoot,
    playSound,
    addParticles,
    triggerScreenShake,
    updateStats,
    checkItemCollection,
    nextItemId,
  ])

  // ===== INTERACCIÓN CON NPCs =====
  // Maneja cuando el jugador hace clic en un ministro
  const handleNPCClick = useCallback(
    (npcId: string) => {
      if (isPaused || activeEvent) return

      setNpcs((prev) =>
        prev.map((npc) => {
          if (npc.id === npcId) {
            // Cambia al siguiente mensaje del ministro
            const newMessage = (npc.currentMessage + 1) % npc.messages.length
            // Añade partículas de chispas al hacer clic
            addParticles(createSparkParticles(npc.x, npc.y, 5))
            return { ...npc, showDialog: true, currentMessage: newMessage }
          }
          return { ...npc, showDialog: false } // Cierra otros diálogos
        }),
      )

      setGameStats((prev) => ({ ...prev, ministersSpokenTo: prev.ministersSpokenTo + 1 }))
      playSound("dialog_open")
    },
    [isPaused, activeEvent, playSound, addParticles],
  )

  // ===== ACCIONES DE DIÁLOGO =====
  // Maneja las decisiones que toma el jugador en los diálogos con ministros
  const handleDialogAction = useCallback(
    (action: "report" | "operation" | "ignore", npcId: string) => {
      // Diferentes consecuencias según la acción elegida
      const consequences = {
        report: { economy: -2, popularity: +3 }, // Pedir informe: cuesta dinero pero da popularidad
        operation: { economy: -5, chaos: +5, popularity: +2 }, // Operativo: caro, aumenta caos y popularidad
        ignore: { chaos: +2, popularity: -1 }, // Ignorar: aumenta caos, reduce popularidad
      }

      updateStats(consequences[action])
      playSound("dialog_choice")

      // Efectos visuales según la acción
      const npc = npcs.find((n) => n.id === npcId)
      if (npc) {
        if (action === "operation") {
          // Operativo militar genera explosión
          addParticles(createExplosionParticles(npc.x, npc.y, 0.3))
          setGameStats((prev) => ({ ...prev, explosionsCreated: prev.explosionsCreated + 1 }))
        } else {
          // Otras acciones generan chispas
          addParticles(createSparkParticles(npc.x, npc.y, 3))
        }
      }

      // Cierra el diálogo
      setNpcs((prev) =>
        prev.map((npc) => {
          if (npc.id === npcId) {
            return { ...npc, showDialog: false }
          }
          return npc
        }),
      )
    },
    [updateStats, playSound, addParticles, npcs],
  )

  // ===== REINICIO DEL JUEGO =====
  // Resetea todos los valores a su estado inicial
  const handleRestart = useCallback(() => {
    setPosition({ x: 400, y: 300, direction: "down" })
    setCurrentWeapon("pistol")
    setWeaponAmmo({ pistol: 8, machinegun: 100 })
    setWeaponCooldown({ pistol: false, machinegun: false })
    setIsReloading(false)
    setCanSwitchWeapon(true)
    setProjectiles([])
    setAliens([])
    setDroppedItems([])
    setParticles([])
    setStats({
      economy: 100,
      chaos: 0,
      popularity: 50,
      hunger: 30,
      health: 70,
      education: 60,
      justice: 40,
      technology: 50,
    })
    setGameTime(0)
    setNextEventTime(15000)
    setActiveEvent(null)
    setGameStats({
      shotsFired: 0,
      aliensKilled: 0,
      ministersSpokenTo: 0,
      weaponSwitches: 0,
      survivalTime: 0,
      explosionsCreated: 0,
      dataChipsCollected: 0,
    })
    setIsPaused(false)
  }, [])

  // ===== REINICIO SOLO DE INVASIÓN ALIEN =====
  // Resetea solo los elementos relacionados con aliens
  const resetAlienInvasion = useCallback(() => {
    setAliens([])
    setDroppedItems([])
    setProjectiles([])
    setParticles([])
    setGameStats((prev) => ({ ...prev, aliensKilled: 0, explosionsCreated: 0, dataChipsCollected: 0 }))
    setIsPaused(false)
    playSound("game_reset")
  }, [playSound])

  // ===== UTILIDAD DE FORMATO DE TIEMPO =====
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  // ===== RENDERIZADO DEL COMPONENTE =====
  return (
    <div
      className={`relative w-full h-screen overflow-hidden bg-black transition-opacity duration-500 ${fadeIn ? "opacity-0" : "opacity-100"}`}
    >
      {/* ===== HUD SUPERIOR ===== */}
      {/* Barra superior con estadísticas del país y controles */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-purple-900 to-purple-800 border-b-4 border-yellow-400 z-30 pixel-border">
        <div className="flex justify-between items-center h-full px-4">
          {/* Botón para volver al menú */}
          <Button
            onClick={onBack}
            variant="outline"
            className="font-pixel bg-black text-white border-cyan-500 hover:bg-cyan-950 pixel-border h-12"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            VOLVER
          </Button>

          {/* Grid de estadísticas del país */}
          <div className="grid grid-cols-4 gap-3 flex-1 mx-6">
            {[
              { key: "economy", icon: "💰", label: "Economía", value: stats.economy },
              { key: "chaos", icon: "🔥", label: "Caos", value: stats.chaos },
              { key: "popularity", icon: "📊", label: "Popularidad", value: stats.popularity },
              { key: "hunger", icon: "🍽️", label: "Hambre", value: stats.hunger },
              { key: "health", icon: "💊", label: "Salud", value: stats.health },
              { key: "education", icon: "🏫", label: "Educación", value: stats.education },
              { key: "justice", icon: "⚖️", label: "Justicia", value: stats.justice },
              { key: "technology", icon: "⚙️", label: "Tecnología", value: stats.technology },
            ].map((stat) => (
              <div
                key={stat.key}
                className={`font-pixel text-xs flex items-center gap-1 ${statsChanged[stat.key] ? "animate-pulse text-yellow-300" : ""}`}
              >
                <span className="text-lg">{stat.icon}</span>
                <div className="flex flex-col">
                  <span className="text-white text-xs">{stat.label}</span>
                  <span className="text-white font-bold">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Botón de pausa */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsPaused(!isPaused)}
              disabled={!!activeEvent}
              className="font-pixel bg-purple-700 hover:bg-purple-600 text-white pixel-border h-12 w-12 p-0"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* ===== CONTADOR DE MUNICIÓN ===== */}
      {/* Muestra la munición actual en la esquina superior derecha */}
      <AmmoCounter
        currentWeapon={currentWeapon}
        weaponAmmo={weaponAmmo}
        isReloading={isReloading}
        weaponCooldown={weaponCooldown}
      />

      {/* ===== ÁREA DE JUEGO ===== */}
      {/* Contenedor principal del juego con borde pixel */}
      <div className="absolute inset-0 top-20 bottom-0 p-4">
        <div className="w-full h-full pixel-border neon-border-cyan bg-black">
          <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden"
            style={{
              // Fondo de madera con patrón repetitivo
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood' patternUnits='userSpaceOnUse' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23A0522D'/%3E%3Crect width='32' height='2' fill='%236B3100'/%3E%3Crect width='2' height='32' fill='%236B3100'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23wood)'/%3E%3C/svg%3E")`,
              backgroundSize: "32px 32px",
              // Aplica el efecto de temblor de pantalla
              transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
            }}
          >
            {/* ===== MUNDO DEL JUEGO ===== */}
            {/* Contenedor que se mueve con la cámara */}
            <div
              className="relative w-[800px] h-[800px]"
              style={{
                transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* ===== MOBILIARIO DE LA OFICINA ===== */}

              {/* Escritorio */}
              <div className="absolute top-[200px] left-[350px] w-[100px] h-[60px] bg-[#8B4513] border-4 border-[#6B3100] pixel-border">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">🗄️</div>
              </div>

              {/* Ventana */}
              <div className="absolute top-[50px] right-[50px] w-16 h-24 bg-cyan-200 border-4 border-[#6B3100] pixel-border">
                <div className="grid grid-cols-2 grid-rows-2 h-full">
                  <div className="border border-[#6B3100]"></div>
                  <div className="border border-[#6B3100]"></div>
                  <div className="border border-[#6B3100]"></div>
                  <div className="border border-[#6B3100]"></div>
                </div>
              </div>

              {/* Bandera argentina */}
              <div className="absolute top-[50px] left-[50px] text-4xl">🇦🇷</div>

              {/* Planta decorativa */}
              <div className="absolute bottom-[50px] right-[50px] text-4xl">🌵</div>

              {/* ===== TELEVISOR DE NOTICIAS ===== */}
              {/* Muestra noticias satíricas en loop */}
              <NewsTV x={100} y={100} />

              {/* ===== NPCs (MINISTROS) ===== */}
              {/* Renderiza cada ministro con su diálogo */}
              {npcs.map((npc) => (
                <div key={npc.id}>
                  {/* Sprite del ministro */}
                  <div
                    className="absolute w-12 h-16 cursor-pointer z-10 hover:scale-110 transition-transform"
                    style={{
                      left: `${npc.x}px`,
                      top: `${npc.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => handleNPCClick(npc.id)}
                  >
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center pixel-border">
                      <span className="text-2xl">{npc.avatar}</span>
                    </div>
                    <div className="text-center font-pixel text-xs text-white mt-1">{npc.name}</div>
                  </div>

                  {/* Caja de diálogo del ministro */}
                  {npc.showDialog && !activeEvent && (
                    <div className="absolute z-40" style={{ left: `${npc.x - 140}px`, top: `${npc.y - 120}px` }}>
                      <div className="w-72 bg-white text-black pixel-border neon-border-cyan">
                        {/* Título del diálogo */}
                        <div className="bg-purple-700 text-white p-2 font-pixel text-xs">{npc.title}</div>
                        {/* Mensaje actual */}
                        <div className="p-3 font-pixel text-xs">{npc.messages[npc.currentMessage]}</div>
                        {/* Botones de acción */}
                        <div className="flex gap-1 p-2">
                          <Button
                            onClick={() => handleDialogAction("report", npc.id)}
                            className="font-pixel text-xs bg-blue-600 hover:bg-blue-500 text-white pixel-border flex-1"
                          >
                            PEDIR INFORME
                          </Button>
                          <Button
                            onClick={() => handleDialogAction("operation", npc.id)}
                            className="font-pixel text-xs bg-red-600 hover:bg-red-500 text-white pixel-border flex-1"
                          >
                            ORDENAR OPERATIVO
                          </Button>
                          <Button
                            onClick={() => handleDialogAction("ignore", npc.id)}
                            className="font-pixel text-xs bg-gray-600 hover:bg-gray-500 text-white pixel-border flex-1"
                          >
                            IGNORAR
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* ===== PERSONAJE DEL JUGADOR ===== */}
              <div
                className="absolute w-12 h-16 z-10"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="w-full h-full flex items-center justify-center pixel-border pixelated">
                  <img
                    src={character.sprite || "/placeholder.svg"}
                    alt={character.name}
                    className="w-full h-full object-contain pixelated"
                    style={{
                      // Filtro visual cuando usa metralleta
                      filter: currentWeapon === "machinegun" ? "hue-rotate(20deg) saturate(1.2)" : "none",
                    }}
                  />
                </div>

                {/* Indicador de arma actual */}
                <div className="absolute -right-3 top-2 text-lg">{currentWeapon === "pistol" ? "🔫" : "🔫"}</div>
              </div>

              {/* ===== ALIENS ENEMIGOS ===== */}
              {/* Renderiza cada alien con diferentes tipos */}
              {aliens.map((alien) => (
                <div
                  key={alien.id}
                  className={`absolute z-10 ${alien.isFlashing ? "animate-pulse bg-red-500" : ""}`}
                  style={{
                    left: `${alien.x}px`,
                    top: `${alien.y}px`,
                    transform: "translate(-50%, -50%)",
                    width: `${alien.size * 4}px`,
                    height: `${alien.size * 4}px`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {/* Diferentes emojis para diferentes tipos de aliens */}
                    {alien.type === "fast" ? "👾" : "👽"}
                  </div>
                </div>
              ))}

              {/* ===== ITEMS EN EL SUELO ===== */}
              {/* Chips de datos que dejan los aliens */}
              {droppedItems.map((item) => (
                <div
                  key={item.id}
                  className={`absolute w-6 h-6 z-10 cursor-pointer animate-pulse ${item.collected ? "opacity-0" : "opacity-100"}`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-lg">💾</div>
                </div>
              ))}

              {/* ===== PROYECTILES (BALAS) ===== */}
              {/* Renderiza cada bala activa */}
              {projectiles.map((projectile) => (
                <div
                  key={projectile.id}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full z-5"
                  style={{
                    left: `${projectile.x}px`,
                    top: `${projectile.y}px`,
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 6px rgba(255, 255, 0, 0.8)", // Efecto de brillo
                  }}
                >
                  {/* Efecto de pulso para las balas */}
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                </div>
              ))}

              {/* ===== SISTEMA DE PARTÍCULAS ===== */}
              {/* Maneja todos los efectos visuales (explosiones, chispas, etc.) */}
              <ParticleSystem particles={particles} onParticleUpdate={updateParticles} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== SELECTOR DE ARMAS ===== */}
      {/* Panel en la esquina inferior derecha para cambiar armas */}
      <WeaponSwitcher
        currentWeapon={currentWeapon}
        weaponAmmo={weaponAmmo}
        weaponCooldown={weaponCooldown}
        onWeaponSwitch={handleWeaponSwitch}
        canSwitch={canSwitchWeapon}
        isReloading={isReloading}
      />

      {/* ===== BOTÓN DE INVASIÓN ALIEN ===== */}
      {/* Botón para generar manualmente una oleada de aliens */}
      <div className="absolute bottom-4 left-4 z-20">
        <Button
          onClick={spawnAliens}
          className="font-pixel bg-red-600 hover:bg-red-500 text-white pixel-border text-sm"
          disabled={!!activeEvent}
        >
          🔴 INVOCAR ALIENS
        </Button>
      </div>

      {/* ===== AYUDA DE CONTROLES ===== */}
      {/* Muestra los controles en la parte inferior */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 p-2 font-pixel text-xs text-white z-20">
        WASD: Mover | ESPACIO: Disparar | 1/2: Cambiar Arma | ESC: Pausa
      </div>

      {/* ===== POPUP DE LOGROS ===== */}
      {/* Muestra el logro recién desbloqueado */}
      {newAchievement && <AchievementPopup achievement={newAchievement} />}

      {/* ===== POPUP DE EVENTOS ===== */}
      {/* Muestra eventos especiales que requieren decisiones del jugador */}
      {activeEvent && (
        <EventPopup
          event={activeEvent.event}
          timeRemaining={activeEvent.timeRemaining}
          onChoice={(choiceId) => {
            // Maneja la elección del jugador en el evento
            setActiveEvent(null)
          }}
        />
      )}

      {/* ===== MENÚ DE PAUSA ===== */}
      {/* Menú que aparece cuando el juego está pausado */}
      {isPaused && !activeEvent && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-purple-900 p-8 pixel-border neon-border-cyan">
            <h2 className="text-2xl font-pixel text-yellow-400 text-center mb-6">PAUSA</h2>

            <div className="flex flex-col gap-4">
              {/* Reanudar juego */}
              <Button
                onClick={() => setIsPaused(false)}
                className="font-pixel bg-cyan-600 hover:bg-cyan-500 text-white pixel-border"
              >
                REANUDAR
              </Button>

              {/* Reiniciar todo el juego */}
              <Button
                onClick={handleRestart}
                className="font-pixel bg-yellow-600 hover:bg-yellow-500 text-white pixel-border"
              >
                REINICIAR DÍA
              </Button>

              {/* Reiniciar solo la invasión alien */}
              <Button
                onClick={resetAlienInvasion}
                className="font-pixel bg-orange-600 hover:bg-orange-500 text-white pixel-border"
              >
                REINICIAR INVASIÓN ALIENÍGENA
              </Button>

              {/* Volver al menú principal */}
              <Button onClick={onBack} className="font-pixel bg-red-600 hover:bg-red-500 text-white pixel-border">
                VOLVER AL MENÚ PRINCIPAL
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
