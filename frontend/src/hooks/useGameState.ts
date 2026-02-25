import { useState, useRef, useCallback } from 'react';

export type GameScreen = 'menu' | 'character-select' | 'playing' | 'game-over' | 'leaderboard';
export type PowerUpType = 'shield' | 'buraq' | 'magnet' | null;

export interface GameState {
  screen: GameScreen;
  score: number;
  coins: number;
  speed: number;
  isGameOver: boolean;
  activePowerUp: PowerUpType;
  powerUpTimeLeft: number;
  powerUpDuration: number;
  shieldActive: boolean;
  personalBest: number;
  selectedCharacter: number;
}

const INITIAL_SPEED = 8;
const MAX_SPEED = 25;
const SPEED_INCREMENT = 0.002;
const PERSONAL_BEST_KEY = 'deen-runner-best';

export function useGameState() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isGameOver, setIsGameOver] = useState(false);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType>(null);
  const [powerUpTimeLeft, setPowerUpTimeLeft] = useState(0);
  const [powerUpDuration] = useState(8000);
  const [shieldActive, setShieldActive] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [personalBest, setPersonalBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem(PERSONAL_BEST_KEY) || '0', 10);
    } catch {
      return 0;
    }
  });

  const powerUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const powerUpIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const navigateTo = useCallback((s: GameScreen) => {
    setScreen(s);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setCoins(0);
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setActivePowerUp(null);
    setPowerUpTimeLeft(0);
    setShieldActive(false);
    setScreen('playing');
  }, []);

  const incrementScore = useCallback((delta: number) => {
    setScore(prev => prev + delta);
  }, []);

  const addCoin = useCallback((amount = 1) => {
    setCoins(prev => prev + amount);
    setScore(prev => prev + amount * 10);
  }, []);

  const incrementSpeed = useCallback(() => {
    setSpeed(prev => Math.min(prev + SPEED_INCREMENT, MAX_SPEED));
  }, []);

  const triggerGameOver = useCallback((finalScore: number) => {
    setIsGameOver(true);
    setScreen('game-over');
    if (finalScore > personalBest) {
      setPersonalBest(finalScore);
      try {
        localStorage.setItem(PERSONAL_BEST_KEY, String(finalScore));
      } catch {
        // ignore
      }
    }
    if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    if (powerUpIntervalRef.current) clearInterval(powerUpIntervalRef.current);
  }, [personalBest]);

  const activatePowerUp = useCallback((type: PowerUpType) => {
    if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    if (powerUpIntervalRef.current) clearInterval(powerUpIntervalRef.current);

    setActivePowerUp(type);
    const duration = 8000;
    setPowerUpTimeLeft(duration);

    if (type === 'shield') setShieldActive(true);

    const startTime = Date.now();
    powerUpIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setPowerUpTimeLeft(remaining);
      if (remaining <= 0) {
        if (powerUpIntervalRef.current) clearInterval(powerUpIntervalRef.current);
      }
    }, 50);

    powerUpTimerRef.current = setTimeout(() => {
      setActivePowerUp(null);
      setShieldActive(false);
      setPowerUpTimeLeft(0);
      if (powerUpIntervalRef.current) clearInterval(powerUpIntervalRef.current);
    }, duration);
  }, []);

  const consumeShield = useCallback(() => {
    setShieldActive(false);
    setActivePowerUp(null);
    setPowerUpTimeLeft(0);
    if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    if (powerUpIntervalRef.current) clearInterval(powerUpIntervalRef.current);
  }, []);

  return {
    screen,
    score,
    coins,
    speed,
    isGameOver,
    activePowerUp,
    powerUpTimeLeft,
    powerUpDuration,
    shieldActive,
    personalBest,
    selectedCharacter,
    setSelectedCharacter,
    navigateTo,
    startGame,
    incrementScore,
    addCoin,
    incrementSpeed,
    triggerGameOver,
    activatePowerUp,
    consumeShield,
  };
}
