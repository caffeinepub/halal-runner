import React from 'react';
import { Play, Trophy, Users, Star } from 'lucide-react';
import type { GameScreen } from '../hooks/useGameState';

interface MainMenuProps {
  onNavigate: (screen: GameScreen) => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/generated/bg-main-menu.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Islamic pattern overlay */}
      <div className="absolute inset-0 pattern-bg" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/assets/generated/logo-deen-runner.dim_512x256.png"
            alt="Deen Runner"
            className="w-72 md:w-96 drop-shadow-2xl animate-float"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h1 className="font-heading text-4xl md:text-5xl shimmer-text text-shadow-gold tracking-wider">
            Deen Runner
          </h1>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <p className="font-subheading text-sm tracking-widest gold-text uppercase">
              The Halal Adventure
            </p>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-500/60" />
          <span className="text-yellow-400 text-lg">☪</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-500/60" />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={() => onNavigate('playing')}
            className="btn-islamic w-full py-4 px-8 rounded-sm text-lg flex items-center justify-center gap-3 animate-glow"
          >
            <Play className="w-5 h-5" />
            Play Now
          </button>

          <button
            onClick={() => onNavigate('character-select')}
            className="btn-teal w-full py-3 px-8 rounded-sm text-base flex items-center justify-center gap-3"
          >
            <Users className="w-5 h-5" />
            Choose Character
          </button>

          <button
            onClick={() => onNavigate('leaderboard')}
            className="btn-teal w-full py-3 px-8 rounded-sm text-base flex items-center justify-center gap-3"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </div>

        {/* Controls hint */}
        <div className="panel-islamic rounded-sm p-4 w-full text-center">
          <p className="font-subheading text-xs gold-text mb-2 tracking-wider">HOW TO PLAY</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-foreground/80 font-body">
            <div className="flex items-center gap-2">
              <kbd className="bg-white/10 px-2 py-1 rounded text-xs">← →</kbd>
              <span>Switch lanes</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-white/10 px-2 py-1 rounded text-xs">↑</kbd>
              <span>Jump</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-white/10 px-2 py-1 rounded text-xs">↓</kbd>
              <span>Slide</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">👆</span>
              <span>Swipe to move</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-xs text-foreground/40 font-body">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'deen-runner')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-500/60 hover:text-yellow-400 transition-colors"
          >
            caffeine.ai
          </a>{' '}
          · © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
