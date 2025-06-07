// #region event-popup.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Clock, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

interface GameEvent {
  id: string
  title: string
  description: string
  icon: string
  urgency: "low" | "medium" | "high"
  choices: {
    id: string
    text: string
    consequences: {
      economy?: number
      chaos?: number
      popularity?: number
    }
    description: string
  }[]
}

interface EventPopupProps {
  event: GameEvent
  timeRemaining: number
  onChoice: (choiceId: string) => void
}

export default function EventPopup({ event, timeRemaining, onChoice }: EventPopupProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}s`
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "border-red-500 bg-red-900"
      case "medium":
        return "border-yellow-500 bg-yellow-900"
      case "low":
        return "border-green-500 bg-green-900"
      default:
        return "border-gray-500 bg-gray-900"
    }
  }

  const getConsequenceIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-400" />
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-400" />
    return null
  }

  const getConsequenceColor = (value: number) => {
    if (value > 0) return "text-green-400"
    if (value < 0) return "text-red-400"
    return "text-gray-400"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full pixel-border neon-border-cyan ${getUrgencyColor(event.urgency)} p-6`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{event.icon}</span>
            <div>
              <h2 className="text-xl font-pixel text-white">{event.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <AlertTriangle
                  className={`h-4 w-4 ${event.urgency === "high" ? "text-red-400" : event.urgency === "medium" ? "text-yellow-400" : "text-green-400"}`}
                />
                <span className="font-pixel text-xs text-gray-300">URGENCIA: {event.urgency.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black bg-opacity-50 px-3 py-1 rounded pixel-border">
            <Clock className="h-4 w-4 text-white animate-pulse" />
            <span className="font-pixel text-sm text-white">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-black bg-opacity-50 p-4 mb-6 pixel-border">
          <p className="font-pixel text-sm text-white leading-relaxed">{event.description}</p>
        </div>

        {/* Choices */}
        <div className="space-y-3">
          <h3 className="font-pixel text-sm text-yellow-400 mb-3">¿QUÉ DECIDES?</h3>

          {event.choices.map((choice, index) => (
            <Button
              key={choice.id}
              onClick={() => onChoice(choice.id)}
              className="w-full p-4 h-auto bg-purple-800 hover:bg-purple-700 text-white pixel-border text-left"
            >
              <div className="flex justify-between items-start w-full">
                <div className="flex-1">
                  <div className="font-pixel text-sm mb-2">{choice.text}</div>
                  <div className="font-pixel text-xs text-gray-300">{choice.description}</div>
                </div>

                <div className="flex flex-col gap-1 ml-4">
                  {choice.consequences.economy && (
                    <div className="flex items-center gap-1">
                      {getConsequenceIcon(choice.consequences.economy)}
                      <span className={`font-pixel text-xs ${getConsequenceColor(choice.consequences.economy)}`}>
                        💰 {choice.consequences.economy > 0 ? "+" : ""}
                        {choice.consequences.economy}
                      </span>
                    </div>
                  )}
                  {choice.consequences.chaos && (
                    <div className="flex items-center gap-1">
                      {getConsequenceIcon(choice.consequences.chaos)}
                      <span className={`font-pixel text-xs ${getConsequenceColor(choice.consequences.chaos)}`}>
                        🔥 {choice.consequences.chaos > 0 ? "+" : ""}
                        {choice.consequences.chaos}
                      </span>
                    </div>
                  )}
                  {choice.consequences.popularity && (
                    <div className="flex items-center gap-1">
                      {getConsequenceIcon(choice.consequences.popularity)}
                      <span className={`font-pixel text-xs ${getConsequenceColor(choice.consequences.popularity)}`}>
                        📊 {choice.consequences.popularity > 0 ? "+" : ""}
                        {choice.consequences.popularity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Warning */}
        <div className="mt-4 bg-red-900 bg-opacity-50 p-2 pixel-border">
          <p className="font-pixel text-xs text-red-300 text-center">
            ⚠️ Si no decides a tiempo, se elegirá automáticamente la primera opción
          </p>
        </div>
      </div>
    </div>
  )
}

// #endregion
