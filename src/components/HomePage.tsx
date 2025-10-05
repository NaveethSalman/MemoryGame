import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import uiBackground from '../assets/nui.png';

interface GameBox {
  id: number;
  title: string;
  isLocked: boolean;
  icon: string;
}

function HomePage() {
  const navigate = useNavigate();
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const games: GameBox[] = [
    { id: 1, title: 'Memory Match', isLocked: false, icon: '🧠' },
    { id: 2, title: 'Puzzle Quest', isLocked: true, icon: '🧩' },
    { id: 3, title: 'Word Hunter', isLocked: true, icon: '📝' },
    { id: 4, title: 'Color Match', isLocked: true, icon: '🎨' },
    { id: 5, title: 'Number Game', isLocked: true, icon: '🔢' },
    { id: 6, title: 'Pattern Master', isLocked: true, icon: '🔷' },
    { id: 7, title: 'Speed Click', isLocked: true, icon: '⚡' },
    { id: 8, title: 'Brain Teaser', isLocked: true, icon: '🎯' },
    { id: 9, title: 'Reflex Test', isLocked: true, icon: '⏱️' },
    { id: 10, title: 'Logic Master', isLocked: true, icon: '🎓' },
  ];

  const handlePlayClick = () => {
    setShowInitialScreen(false);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleGameClick = (game: GameBox) => {
    if (game.isLocked) {
      setToastMessage('🔒 Complete the first game to unlock this level!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        navigate('/game');
      }, 1500);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loader-spinner"></div>
          <h2 className="loading-text">Loading...</h2>
        </div>
      </div>
    );
  }

  if (showInitialScreen) {
    return (
      <div className="homepage" style={{ 
        backgroundImage: `url(${uiBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden'
      }}>
        <div className="homepage-content-centered">
          <div className="center-container">
            <h1 className="title-text">Scamsters</h1>
            <button className="play-button" onClick={handlePlayClick}>
              <span className="button-text">PLAY/Explore Scammers</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage" style={{ 
      backgroundImage: `url(${uiBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '100vw',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'auto'
    }}>
      {showToast && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
      <div className="homepage-content">
        <div className="games-container">
          <h1 className="main-title">Scamsters</h1>
          <p className="subtitle">Choose Your Game</p>
          <div className="games-grid">
            {games.map((game) => (
              <div
                key={game.id}
                className={`game-box ${game.isLocked ? 'locked' : 'unlocked'}`}
                onClick={() => handleGameClick(game)}
              >
                <div className="game-icon">{game.icon}</div>
                <h3 className="game-title">{game.title}</h3>
                {game.isLocked && (
                  <div className="lock-overlay">
                    <span className="lock-icon">🔒</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;