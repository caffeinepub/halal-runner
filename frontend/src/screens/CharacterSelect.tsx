import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { CHARACTERS } from '../game/characters';
import type { GameScreen } from '../hooks/useGameState';

interface CharacterSelectProps {
  selectedCharacter: number;
  onSelectCharacter: (id: number) => void;
  onNavigate: (screen: GameScreen) => void;
  onStartGame: () => void;
}

export default function CharacterSelect({
  selectedCharacter,
  onSelectCharacter,
  onNavigate,
  onStartGame,
}: CharacterSelectProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/generated/bg-main-menu.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 pattern-bg" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => onNavigate('menu')}
            className="btn-teal p-2 rounded-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-heading text-2xl md:text-3xl gold-text text-shadow-gold flex-1 text-center">
            Choose Your Runner
          </h2>
          <div className="w-10" />
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-500/60" />
          <span className="text-yellow-400 text-lg">☪</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-500/60" />
        </div>

        {/* Character cards */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {CHARACTERS.map((char) => (
            <button
              key={char.id}
              onClick={() => onSelectCharacter(char.id)}
              className={`
                relative flex flex-col items-center gap-3 p-4 rounded-sm transition-all duration-200
                ${selectedCharacter === char.id
                  ? 'border-2 border-yellow-400 bg-yellow-400/10 shadow-gold scale-105'
                  : 'border border-yellow-600/30 bg-black/40 hover:bg-black/60 hover:border-yellow-500/50'
                }
              `}
            >
              {selectedCharacter === char.id && (
                <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-0.5">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}

              {/* Character preview */}
              <div
                className="w-20 h-24 rounded-sm flex items-center justify-center text-5xl"
                style={{ background: `${char.bodyColor}33` }}
              >
                <span>{char.emoji}</span>
              </div>

              {/* Character info */}
              <div className="text-center">
                <p className="font-subheading text-sm gold-text font-bold">{char.name}</p>
                <p className="font-body text-xs text-foreground/60 mt-1 leading-tight">{char.description}</p>
              </div>

              {/* Color swatches */}
              <div className="flex gap-1">
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: char.bodyColor }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: char.clothColor }}
                />
                <div
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: char.headwearColor }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Selected character info */}
        <div className="panel-islamic rounded-sm p-4 w-full text-center">
          <p className="font-subheading text-sm gold-text">
            Selected: <span className="font-bold">{CHARACTERS[selectedCharacter]?.name}</span>
          </p>
          <p className="font-body text-xs text-foreground/60 mt-1">
            {CHARACTERS[selectedCharacter]?.description}
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={onStartGame}
          className="btn-islamic w-full py-4 px-8 rounded-sm text-lg animate-glow"
        >
          Start Running! ✨
        </button>
      </div>
    </div>
  );
}
