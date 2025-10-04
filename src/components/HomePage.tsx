import { useNavigate } from 'react-router-dom';
import uiBackground from '../assets/ui.png';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage" style={{ 
      backgroundImage: `url(${uiBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="homepage-content">
        <div className="center-container">
          <h1 className="title-text">Scam Detector</h1>
          <button className="play-button" onClick={() => navigate('/game')}>
            <span className="button-text">PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;