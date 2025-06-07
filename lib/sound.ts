export type SoundType =
  | "pistol_shot"
  | "machinegun_shot"
  | "weapon_switch"
  | "reload_start"
  | "reload_complete"
  | "alien_spawn"
  | "alien_hit"
  | "alien_attack"
  | "item_collect"
  | "dialog_open"
  | "dialog_choice"
  | "achievement"
  | "game_reset"
  | "click"
  | string

let audioCtx: AudioContext | null = null

const freqMap: Record<string, number> = {
  pistol_shot: 880,
  machinegun_shot: 660,
  weapon_switch: 500,
  reload_start: 300,
  reload_complete: 700,
  alien_spawn: 400,
  alien_hit: 350,
  alien_attack: 250,
  item_collect: 600,
  dialog_open: 420,
  dialog_choice: 520,
  achievement: 750,
  game_reset: 280,
  click: 550,
}

export function playSound(type: SoundType) {
  if (typeof window === "undefined") return
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const frequency = freqMap[type] ?? 440
  const oscillator = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  oscillator.type = "square"
  oscillator.frequency.value = frequency
  gain.gain.value = 0.1
  oscillator.connect(gain)
  gain.connect(audioCtx.destination)
  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.1)
}
