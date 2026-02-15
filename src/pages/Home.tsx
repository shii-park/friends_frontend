import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, gachaStones } = useUser();

  if (!user) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="home-page">
      <div className="home-title-container">
        <div className="home-user-info">
          <div className="home-user-name">{user.userName}</div>
          <div className="home-stats-summary">
            <span>RP: {user.rp}</span>
            <span>COIN: {user.coin}</span>
            <span>STONE: {gachaStones}</span>
          </div>
        </div>
        <h1 className="home-large-title">FRIENDS GAME</h1>
      </div>

      <main className="home-menu">
        <div className="home-menu-left">
          <button
            className="menu-card landscape"
            onClick={() => navigate('/storage')}
          >
            <span className="menu-icon">🎒</span>
            <div className="menu-text">
              <h2 className="menu-label">ストレージ</h2>
              <p className="menu-desc">キャラクター・装備の確認</p>
            </div>
          </button>
          <button
            className="menu-card landscape"
            onClick={() => navigate('/gacha')}
          >
            <span className="menu-icon">💎</span>
            <div className="menu-text">
              <h2 className="menu-label">ガチャ</h2>
              <p className="menu-desc">新しいカードを入手</p>
            </div>
          </button>
        </div>
        <div className="home-menu-right">
          <button
            className="menu-card square"
            onClick={() => navigate('/battle-select')}
          >
            <span className="menu-icon">⚔️</span>
            <h2 className="menu-label">バトル</h2>
            <p className="menu-desc">NPCやオンラインで対戦</p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
