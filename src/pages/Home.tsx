import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import homeLogo from '../assets/freeking.png';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, gachaStones } = useUser();

  if (!user) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="home-page">
      <div className="home-main-container">
        <div className="home-title-container">
          <img src={homeLogo} alt="フリキング" className="home-logo" />
          <div className="home-title-sub-info">
            <div className="home-user-info">
              <div className="home-user-name">{user.userName}</div>
            </div>
          </div>
        </div>

        <main className="home-menu">
          <div className="home-menu-left">
            <div className="home-stats-summary">
              <div className="stat-item">RP: {user.rp}</div>
              <div className="stat-item">COIN: {user.coin}</div>
              <div className="stat-item">STONE: {gachaStones}</div>
            </div>
            <div className="home-menu-cards-row">
              <button
                className="menu-card landscape"
                onClick={() => navigate('/storage', { state: { from: '/home' } })}
              >
                <span className="menu-icon">🎒</span>
                <div className="menu-text">
                  <h2 className="menu-label">STORAGE</h2>
                  <p className="menu-desc">所持カードの確認・強化</p>
                </div>
              </button>
              <button
                className="menu-card landscape"
                onClick={() => navigate('/collection', { state: { from: '/home' } })}
              >
                <span className="menu-icon">📖</span>
                <div className="menu-text">
                  <h2 className="menu-label">COLLECTION</h2>
                  <p className="menu-desc">カード図鑑を見る</p>
                </div>
              </button>
            </div>
            <div className="home-menu-cards-row" style={{ marginTop: '2rem' }}>
              <button
                className="menu-card landscape"
                style={{ width: '100%' }}
                onClick={() => navigate('/gacha', { state: { from: '/home' } })}
              >
                <span className="menu-icon">💎</span>
                <div className="menu-text">
                  <h2 className="menu-label">GACHA</h2>
                  <p className="menu-desc">新しいカードを入手</p>
                </div>
              </button>
            </div>
          </div>
          <div className="home-menu-right">
            <button
              className="menu-card square"
              onClick={() => navigate('/battle-select', { state: { from: '/home' } })}
            >
              <h2 className="menu-label">BATTLE</h2>
              <p className="menu-desc">NPCやオンラインで対戦</p>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
