import React from 'react';
import { ArrowLeft, Trophy, Coins, RefreshCw } from 'lucide-react';
import type { GameScreen } from '../hooks/useGameState';
import { useLeaderboard } from '../hooks/useQueries';

interface LeaderboardProps {
  onNavigate: (screen: GameScreen) => void;
}

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ onNavigate }: LeaderboardProps) {
  const { data: scores, isLoading, error, refetch } = useLeaderboard();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/generated/bg-main-menu.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 pattern-bg" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-lg animate-slide-in">
        {/* Header */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => onNavigate('menu')}
            className="btn-teal p-2 rounded-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-heading text-2xl md:text-3xl gold-text text-shadow-gold flex-1 text-center">
            Leaderboard
          </h2>
          <button
            onClick={() => refetch()}
            className="btn-teal p-2 rounded-sm"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-500/60" />
          <Trophy className="w-5 h-5 text-yellow-400" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-500/60" />
        </div>

        {/* Scores */}
        <div className="panel-islamic rounded-sm p-4 w-full max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="text-center py-8">
              <div className="text-3xl mb-3 animate-spin-slow">☪</div>
              <p className="font-body text-sm text-foreground/60">Loading scores...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="font-body text-sm text-red-400">Failed to load leaderboard.</p>
              <button onClick={() => refetch()} className="btn-teal mt-3 px-4 py-2 rounded-sm text-sm">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && (!scores || scores.length === 0) && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🌙</div>
              <p className="font-subheading text-sm gold-text">No scores yet!</p>
              <p className="font-body text-xs text-foreground/50 mt-1">Be the first to run!</p>
            </div>
          )}

          {scores && scores.length > 0 && (
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 px-3 pb-2 border-b border-yellow-600/20">
                <div className="col-span-1 font-subheading text-xs text-foreground/40">#</div>
                <div className="col-span-5 font-subheading text-xs text-foreground/40">Name</div>
                <div className="col-span-4 font-subheading text-xs text-foreground/40 text-right">Score</div>
                <div className="col-span-2 font-subheading text-xs text-foreground/40 text-right">Coins</div>
              </div>

              {scores.map((entry, index) => (
                <div
                  key={`${entry.nickname}-${index}`}
                  className={`
                    grid grid-cols-12 gap-2 px-3 py-2 rounded-sm transition-colors
                    ${index === 0 ? 'bg-yellow-400/10 border border-yellow-400/30' : ''}
                    ${index === 1 ? 'bg-gray-400/10 border border-gray-400/20' : ''}
                    ${index === 2 ? 'bg-orange-400/10 border border-orange-400/20' : ''}
                    ${index > 2 ? 'bg-white/5 border border-white/5' : ''}
                  `}
                >
                  <div className="col-span-1 flex items-center">
                    {index < 3 ? (
                      <span className="text-base">{RANK_EMOJIS[index]}</span>
                    ) : (
                      <span className="font-subheading text-sm text-foreground/40">{index + 1}</span>
                    )}
                  </div>
                  <div className="col-span-5 flex items-center">
                    <span
                      className="font-subheading text-sm truncate"
                      style={{ color: index < 3 ? RANK_COLORS[index] : undefined }}
                    >
                      {entry.nickname}
                    </span>
                  </div>
                  <div className="col-span-4 flex items-center justify-end">
                    <span className="font-heading text-sm gold-text">
                      {Number(entry.score).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <Coins className="w-3 h-3 text-yellow-500" />
                    <span className="font-body text-xs text-foreground/70">
                      {Number(entry.coins)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Play button */}
        <button
          onClick={() => onNavigate('playing')}
          className="btn-islamic w-full py-4 rounded-sm text-lg animate-glow"
        >
          Start Running! ✨
        </button>
      </div>
    </div>
  );
}
