import React, { useState } from 'react';
import { RotateCcw, Home, Trophy, Coins } from 'lucide-react';
import type { GameScreen } from '../hooks/useGameState';
import { useSubmitScore } from '../hooks/useQueries';

interface GameOverProps {
  score: number;
  coins: number;
  personalBest: number;
  onRetry: () => void;
  onNavigate: (screen: GameScreen) => void;
}

export default function GameOver({ score, coins, personalBest, onRetry, onNavigate }: GameOverProps) {
  const [nickname, setNickname] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitScore = useSubmitScore();
  const isNewBest = score >= personalBest && score > 0;

  const handleSubmit = async () => {
    if (!nickname.trim()) return;
    try {
      await submitScore.mutateAsync({ nickname: nickname.trim(), score, coins });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit score:', err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="absolute inset-0 pattern-bg opacity-5" />

      <div className="relative z-10 panel-islamic rounded-sm p-8 w-full max-w-md mx-4 animate-slide-in">
        {/* Header */}
        <div className="text-center mb-6">
          {isNewBest ? (
            <>
              <div className="text-5xl mb-2">🏆</div>
              <h2 className="font-heading text-2xl gold-text text-shadow-gold">New Best!</h2>
              <p className="font-body text-sm text-foreground/60 mt-1">Masha'Allah! Amazing run!</p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-2">☪️</div>
              <h2 className="font-heading text-2xl gold-text text-shadow-gold">Run Complete</h2>
              <p className="font-body text-sm text-foreground/60 mt-1">Keep striving, keep running!</p>
            </>
          )}
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-500/60" />
          <span className="text-yellow-400">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-500/60" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-sm p-4 text-center border border-yellow-600/20">
            <p className="font-body text-xs text-foreground/50 uppercase tracking-wider mb-1">Score</p>
            <p className="font-heading text-2xl gold-text">{Math.floor(score).toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-sm p-4 text-center border border-yellow-600/20">
            <p className="font-body text-xs text-foreground/50 uppercase tracking-wider mb-1">Coins</p>
            <p className="font-heading text-2xl gold-text flex items-center justify-center gap-1">
              <Coins className="w-5 h-5" />
              {coins}
            </p>
          </div>
          <div className="col-span-2 bg-white/5 rounded-sm p-4 text-center border border-yellow-600/20">
            <p className="font-body text-xs text-foreground/50 uppercase tracking-wider mb-1">
              <Trophy className="w-3 h-3 inline mr-1" />
              Personal Best
            </p>
            <p className="font-heading text-xl gold-text">{Math.floor(personalBest).toLocaleString()}</p>
          </div>
        </div>

        {/* Submit score */}
        {!submitted ? (
          <div className="mb-6">
            <p className="font-subheading text-xs gold-text mb-2 tracking-wider">SUBMIT YOUR SCORE</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                placeholder="Enter your name..."
                maxLength={20}
                className="flex-1 bg-white/10 border border-yellow-600/30 rounded-sm px-3 py-2 text-sm font-body text-foreground placeholder-foreground/30 focus:outline-none focus:border-yellow-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                disabled={!nickname.trim() || submitScore.isPending}
                className="btn-islamic px-4 py-2 rounded-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitScore.isPending ? '...' : 'Submit'}
              </button>
            </div>
            {submitScore.isError && (
              <p className="text-red-400 text-xs mt-1 font-body">Failed to submit. Try again.</p>
            )}
          </div>
        ) : (
          <div className="mb-6 text-center py-3 bg-green-900/30 border border-green-600/30 rounded-sm">
            <p className="font-subheading text-sm text-green-400">✓ Score submitted! Jazakallah Khair!</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="btn-islamic flex-1 py-3 rounded-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className="btn-teal flex-1 py-3 rounded-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Menu
          </button>
        </div>

        <button
          onClick={() => onNavigate('leaderboard')}
          className="w-full mt-3 py-2 text-sm font-subheading teal-text hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          View Leaderboard
        </button>
      </div>
    </div>
  );
}
