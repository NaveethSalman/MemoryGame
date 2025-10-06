import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gameBackground from '../assets/mui2.png';
import senthiImg from '../assets/senthi.jpg';
import tenImg from '../assets/ten.jpg';
// import veeranImg from '../assets/veeran.jpg';
import { getHighScore, saveHighScore, formatTime, calculateScore } from '../utils/score';

interface Tile {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: 'image' | 'emoji';
  description?: string;
}

interface Toast {
  id: number;
  message: string;
  emoji: string;
  type: 'success' | 'error';
}

function MemoryGame() {
  const navigate = useNavigate();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timer, setTimer] = useState(300); // 5 minutes = 300 seconds
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const timerRef = useRef<number | null>(null);
  const highScore = getHighScore();

  // Define image tiles (2 pairs = 4 tiles)
  const imageTiles = [
    {
      value: senthiImg,
      type: 'image' as const,
      description: "Meet Senthil! He's a curious and adventurous boy who loves to explore and learn new things!"
    },
    {
      value: tenImg,
      type: 'image' as const,
      description: "This is Ten! A playful and energetic boy who brings joy wherever he goes!"
    }
  ];

  // Define emoji tiles (6 pairs = 12 tiles)
  const emojiTiles = [
    { value: '🎮', type: 'emoji' as const },
    { value: '🎲', type: 'emoji' as const },
    { value: '🎯', type: 'emoji' as const },
    { value: '🎪', type: 'emoji' as const },
    { value: '🎨', type: 'emoji' as const },
    { value: '🎭', type: 'emoji' as const }
  ];

  useEffect(() => {
    initializeGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isGameActive && timer > 0) {
      timerRef.current = window.setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsGameActive(false);
            setIsGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameActive, timer]);

  const initializeGame = () => {
    // Create pairs of all tiles (16 total)
    const allTiles = [
      ...imageTiles, ...imageTiles,  // 4 image tiles (2 pairs)
      ...emojiTiles, ...emojiTiles   // 12 emoji tiles (6 pairs)
    ];

    // Shuffle using Fisher-Yates algorithm
    const shuffledTiles = allTiles.map((tile, index) => ({
      ...tile,
      id: index,
      isFlipped: true,
      isMatched: false
    }));

    for (let i = shuffledTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTiles[i], shuffledTiles[j]] = [shuffledTiles[j], shuffledTiles[i]];
    }

    setTiles(shuffledTiles);
    setFlippedTiles([]);
    setMatchedPairs(0);
    setMoves(0);
    setToasts([]);
    setCountdown(4);
    setTimer(300); // Reset to 5 minutes
    setIsGameActive(false);
    setIsGameOver(false);
    setIsNewHighScore(false);

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(current => {
        if (current === null || current <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return current - 1;
      });
    }, 1000);

    // After 4 seconds, flip all tiles back and start the game
    setTimeout(() => {
      setTiles(currentTiles =>
        currentTiles.map(tile => ({
          ...tile,
          isFlipped: false
        }))
      );
      setCountdown(null);
      setIsGameActive(true);
    }, 4000);
  };

  const showToast = (tile: Tile, isMatch: boolean) => {
    if (!isMatch) return;

    const robotMessages = [
      { message: "ANALYZING MATCH...", emoji: "🤖" },
      { message: "PROCESSING DATA...", emoji: "⚡" },
      { message: "MATCH DETECTED!", emoji: "✨" }
    ];

    const robotResponse = robotMessages[Math.floor(Math.random() * robotMessages.length)];
    const message = tile.type === 'image' && tile.description
      ? `${robotResponse.message}\n>> ${tile.description}`
      : `${robotResponse.message}\n>> MATCH_TYPE: ${tile.value}`;

    const newToast: Toast = {
      id: Date.now(),
      message,
      emoji: tile.type === 'image' ? '🤖' : robotResponse.emoji,
      type: 'success' as const
    };

    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
    }, 3000);
  };

  const handleTileClick = (clickedTile: Tile) => {
    if (
      isChecking ||
      clickedTile.isFlipped ||
      clickedTile.isMatched ||
      flippedTiles.length === 2 ||
      !isGameActive ||
      isGameOver
    ) {
      return;
    }

    setMoves(moves => moves + 1);

    const newFlippedTiles = [...flippedTiles, clickedTile.id];
    setFlippedTiles(newFlippedTiles);

    setTiles(currentTiles =>
      currentTiles.map(tile =>
        tile.id === clickedTile.id ? { ...tile, isFlipped: true } : tile
      )
    );

    if (newFlippedTiles.length === 2) {
      setIsChecking(true);

      const [firstTileId, secondTileId] = newFlippedTiles;
      const firstTile = tiles.find(tile => tile.id === firstTileId);
      const secondTile = tiles.find(tile => tile.id === secondTileId);

      if (firstTile && secondTile && firstTile.value === secondTile.value) {
        setTimeout(() => {
          setTiles(currentTiles =>
            currentTiles.map(tile =>
              newFlippedTiles.includes(tile.id)
                ? { ...tile, isMatched: true }
                : tile
            )
          );
          const newMatchedPairs = matchedPairs + 1;
          setMatchedPairs(newMatchedPairs);
          setFlippedTiles([]);
          setIsChecking(false);
          showToast(firstTile, true);
          
          // Check if game is complete
          if (newMatchedPairs === 8) {
            setIsGameActive(false);
            const elapsedTime = 300 - timer;
            const isNewHigh = saveHighScore(elapsedTime, moves + 1);
            setIsNewHighScore(isNewHigh);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setTiles(currentTiles =>
            currentTiles.map(tile =>
              newFlippedTiles.includes(tile.id)
                ? { ...tile, isFlipped: false }
                : tile
            )
          );
          setFlippedTiles([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const getTimerColor = () => {
    if (timer <= 30) return '#ff4444'; // Red
    if (timer <= 60) return '#ffaa00'; // Orange
    return '#64ffda'; // Default green
  };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${gameBackground})` }}>
      <div className="game-content">
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              <span className="toast-emoji">{toast.emoji}</span>
              <div className="toast-message">{toast.message}</div>
            </div>
          ))}
        </div>
        <h1>Memory Match Game</h1>
        <div className="game-stats">
          <p style={{ color: getTimerColor(), fontWeight: 'bold' }}>
            Time: {formatTime(timer)}
          </p>
          <p>Moves: {moves}</p>
          <p>Matches: {matchedPairs} / 8</p>
          {countdown !== null && (
            <p className="countdown">Memorize: {countdown}s</p>
          )}
        </div>

        {highScore && (
          <div className="high-score-display">
            <p>🏆 Best Score: {formatTime(highScore.time)} | {highScore.moves} moves</p>
          </div>
        )}

        {matchedPairs === 8 && !isGameOver && (
          <div className="win-message">
            <h2>🎉 Congratulations! 🎉</h2>
            {isNewHighScore && <p className="new-high-score">🌟 NEW HIGH SCORE! 🌟</p>}
            <p>Time: {formatTime(300 - timer)}</p>
            <p>Moves: {moves}</p>
            <p>Score: {calculateScore(300 - timer, moves)}</p>
            <div className="win-buttons">
              <button onClick={initializeGame} className="win-button">
                Play Again
              </button>
              <button onClick={() => navigate('/')} className="win-button next-button">
                Next Game →
              </button>
            </div>
          </div>
        )}

        {isGameOver && matchedPairs < 8 && (
          <div className="win-message game-over-message">
            <h2>⏰ Time's Up! ⏰</h2>
            <p>You ran out of time!</p>
            <p>Matches: {matchedPairs} / 8</p>
            <p>Moves: {moves}</p>
            <div className="win-buttons">
              <button onClick={initializeGame} className="win-button">
                Retry
              </button>
              <button onClick={() => navigate('/')} className="win-button">
                Back to Home
              </button>
            </div>
          </div>
        )}

        <div className="game-board">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`tile ${tile.isFlipped || tile.isMatched ? 'flipped' : ''} ${
                tile.isMatched ? 'matched' : ''
              }`}
              onClick={() => handleTileClick(tile)}
            >
              <div className="tile-inner">
                <div className="tile-front">?</div>
                <div className="tile-back">
                  {tile.type === 'image' ? (
                    <div className="tile-image-wrapper">
                      <img
                        src={tile.value}
                        alt="Memory card"
                        className="tile-image"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="tile-emoji">{tile.value}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="button-container">
          <button onClick={initializeGame} className="back-button">
            Reset / Play Again
          </button>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemoryGame;