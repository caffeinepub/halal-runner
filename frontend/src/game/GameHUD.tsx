import React from 'react';
import type { PowerUpType } from '../hooks/useGameState';

interface GameHUDProps {
  score: number;
  coins: number;
  activePowerUp: PowerUpType;
  powerUpTimeLeft: number;
  powerUpDuration: number;
  shieldActive: boolean;
  speed: number;
}

const POWER_UP_ICONS: Record<NonNullable<PowerUpType>, string> = {
  shield: '🛡️',
  buraq: '⚡',
  magnet: '🧲',
};

const POWER_UP_NAMES: Record<NonNullable<PowerUpType>, string> = {
  shield: 'Barakah Shield',
  buraq: 'Buraq Boost',
  magnet: 'Coin Magnet',
};

const POWER_UP_COLORS: Record<NonNullable<PowerUpType>, string> = {
  shield: '#FFD700',
  buraq: '#00FFFF',
  magnet: '#FF4444',
};

export default function GameHUD({
  score,
  coins,
  activePowerUp,
  powerUpTimeLeft,
  powerUpDuration,
  shieldActive,
  speed,
}: GameHUDProps) {
  const powerUpProgress = powerUpDuration > 0 ? (powerUpTimeLeft / powerUpDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Top HUD */}
      <div className="flex items-start justify-between p-4 gap-4">
        {/* Score */}
        <div className="panel-islamic rounded-sm px-4 py-2 min-w-[120px]">
          <p className="font-body text-xs text-foreground/50 uppercase tracking-wider">Score</p>
          <p className="font-heading text-xl gold-text leading-tight">
            {Math.floor(score).toLocaleString()}
          </p>
        </div>

        {/* Power-up indicator */}
        {activePowerUp && (
          <div
            className="panel-islamic rounded-sm px-4 py-2 flex flex-col items-center min-w-[140px]"
            style={{ borderColor: `${POWER_UP_COLORS[activePowerUp]}60` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{POWER_UP_ICONS[activePowerUp]}</span>
              <span
                className="font-subheading text-xs"
                style={{ color: POWER_UP_COLORS[activePowerUp] }}
              >
                {POWER_UP_NAMES[activePowerUp]}
              </span>
            </div>
            {/* Timer bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${powerUpProgress}%`,
                  backgroundColor: POWER_UP_COLORS[activePowerUp],
                  boxShadow: `0 0 6px ${POWER_UP_COLORS[activePowerUp]}`,
                }}
              />
            </div>
          </div>
        )}

        {/* Coins */}
        <div className="panel-islamic rounded-sm px-4 py-2 min-w-[100px] text-right">
          <p className="font-body text-xs text-foreground/50 uppercase tracking-wider">Coins</p>
          <p className="font-heading text-xl gold-text leading-tight flex items-center justify-end gap-1">
            <span className="text-base">🪙</span>
            {coins}
          </p>
        </div>
      </div>

      {/* Shield indicator */}
      {shieldActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <div className="panel-islamic rounded-sm px-3 py-1 flex items-center gap-2 border-yellow-400/50">
            <span className="text-sm">🛡️</span>
            <span className="font-subheading text-xs text-yellow-400">Shield Active</span>
          </div>
        </div>
      )}

      {/* Speed indicator (bottom) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 opacity-60">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-3 rounded-full"
                style={{
                  backgroundColor: i < Math.ceil(((speed - 8) / 17) * 5)
                    ? '#FFD700'
                    : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
          <span className="font-body text-xs text-foreground/40">Speed</span>
        </div>
      </div>

      {/* Controls reminder (bottom corners) */}
      <div className="absolute bottom-4 left-4 opacity-40">
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-body">←→</kbd>
            <span className="text-xs font-body text-foreground/60">lanes</span>
          </div>
          <div className="flex gap-1">
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-body">↑↓</kbd>
            <span className="text-xs font-body text-foreground/60">jump/slide</span>
          </div>
        </div>
      </div>
    </div>
  );
}
