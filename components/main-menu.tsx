"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface MainMenuProps {
  onStart: () => void;
  onShowControls: () => void;
  onShowCredits: () => void;
}

export default function MainMenu({
  onStart,
  onShowControls,
  onShowCredits,
}: MainMenuProps) {
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const menuItems = [
    { label: "START", action: onStart },
    { label: "Créditos", action: onShowCredits },
    { label: "Controles", action: onShowControls },
  ];

  // Focus selected button when index changes
  useEffect(() => {
    buttonRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
      } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + menuItems.length) % menuItems.length,
        );
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        menuItems[selectedIndex].action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, menuItems]);

  // Pulsating glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity((prev) => {
        const newValue = prev + 0.05;
        return newValue > 1 ? 0 : newValue;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Blurred background with chaos elements */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[url('/backgrounds/casa-rosada.png')] bg-cover bg-center opacity-30 blur-sm">
          {/* Chaos elements */}
          <div className="absolute top-1/4 left-1/4 text-4xl animate-float">
            👽
          </div>
          <div className="absolute top-1/3 right-1/3 text-4xl animate-float-delay">
            🔥
          </div>
          <div className="absolute bottom-1/4 right-1/4 text-4xl animate-float-alt">
            💸
          </div>
          <div className="absolute bottom-1/3 left-1/3 text-4xl animate-float-delay-alt">
            📰
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-4">
        <h1 className="text-5xl font-pixel text-center text-yellow-400 mb-8 pixel-text glow-text">
          PRESIDENCIA 20XX
        </h1>

        {menuItems.map((item, index) => (
          <Button
            key={item.label}
            ref={(el) => (buttonRefs.current[index] = el)}
            onClick={item.action}
            variant={index === 0 ? "default" : "outline"}
            className={`font-pixel text-xl w-64 h-16 mb-6 pixel-border ${
              index === 0
                ? "bg-purple-700 hover:bg-purple-600 text-white neon-border"
                : "bg-black text-white border-cyan-500 hover:bg-cyan-950"
            } ${selectedIndex === index ? "ring-2 ring-yellow-400" : ""}`}
            style={
              index === 0
                ? {
                    boxShadow: `0 0 ${10 + glowIntensity * 20}px ${5 + glowIntensity * 10}px rgba(168, 85, 247, ${0.4 + glowIntensity * 0.6})`,
                  }
                : undefined
            }
          >
            {item.label}
          </Button>
        ))}

        <p className="text-center font-pixel text-cyan-300 mt-4">
          Elegí tu destino. O crealo.
        </p>
      </div>
    </div>
  );
}
