import React, { useCallback, useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import MainMenu from './screens/MainMenu';
import CharacterSelect from './screens/CharacterSelect';
import Leaderboard from './screens/Leaderboard';
import GameOver from './screens/GameOver';
import GameHUD from './game/GameHUD';
import GameScene from './game/GameScene';

export default function App() {
  const {
    screen,
    score,
    coins,
    speed,
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
  } = useGameState();

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const handleCoinCollect = useCallback(() => {
    addCoin(1);
  }, [addCoin]);

  const handleScoreUpdate = useCallback((delta: number) => {
    incrementScore(delta);
    incrementSpeed();
  }, [incrementScore, incrementSpeed]);

  const handleGameOver = useCallback((finalScore: number) => {
    triggerGameOver(finalScore);
  }, [triggerGameOver]);

  const handlePowerUpCollect = useCallback((type: 'shield' | 'buraq' | 'magnet') => {
    activatePowerUp(type);
  }, [activatePowerUp]);

  const magnetActive = activePowerUp === 'magnet';
  const buraqSpeed = activePowerUp === 'buraq' ? speed * 1.5 : speed;

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Game scene always rendered when playing */}
      {screen === 'playing' && (
        <>
          <GameScene
            speed={buraqSpeed}
            selectedCharacter={selectedCharacter}
            activePowerUp={activePowerUp}
            shieldActive={shieldActive}
            onCoinCollect={handleCoinCollect}
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            onPowerUpCollect={handlePowerUpCollect}
            score={score}
            magnetActive={magnetActive}
          />
          <GameHUD
            score={score}
            coins={coins}
            activePowerUp={activePowerUp}
            powerUpTimeLeft={powerUpTimeLeft}
            powerUpDuration={powerUpDuration}
            shieldActive={shieldActive}
            speed={speed}
          />
        </>
      )}

      {/* Screens */}
      {screen === 'menu' && (
        <MainMenu onNavigate={(s) => {
          if (s === 'playing') startGame();
          else navigateTo(s);
        }} />
      )}

      {screen === 'character-select' && (
        <CharacterSelect
          selectedCharacter={selectedCharacter}
          onSelectCharacter={setSelectedCharacter}
          onNavigate={navigateTo}
          onStartGame={startGame}
        />
      )}

      {screen === 'leaderboard' && (
        <Leaderboard onNavigate={navigateTo} />
      )}

      {screen === 'game-over' && (
        <GameOver
          score={score}
          coins={coins}
          personalBest={personalBest}
          onRetry={startGame}
          onNavigate={navigateTo}
        />
      )}
    </div>
  );
}
