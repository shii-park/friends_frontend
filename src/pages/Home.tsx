import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, gachaStones } = useUser();

  if (!user) {
    return <div>読み込み中...</div>;
  }

  const menuItems = [
    { label: 'バトル', path: '/battle-select', color: '#ff7675', icon: '⚔️', description: 'NPCやオンラインで対戦', textColor: '#000000' },
    { label: 'ストレージ', path: '/storage', color: '#74b9ff', icon: '🎒', description: 'キャラクター・装備の確認', textColor: '#000000' },
    { label: 'ガチャ', path: '/gacha', color: '#ffeaa7', icon: '💎', description: '新しいカードを入手', textColor: '#000000' },
  ];

  return (
    <div className="home-page">
      <header className="app-header">
        <div className="header-left">
          <div className="header-user-name">{user.userName}</div>
        </div>
        <div className="header-center">
          <h1>FRIENDS GAME</h1>
        </div>
        <div className="header-right">
          <div className="header-stats-item">RP: {user.rp}</div>
          <div className="header-stats-item">コイン: {user.coin}</div>
          <div className="header-stats-item">石: {gachaStones}</div>
        </div>
      </header>

      <main className="home-menu">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`menu-card ${item.path === '/storage' ? 'rotate-right' : ''}`}
            style={{ backgroundColor: item.color, color: item.textColor || '#fff' }}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon" style={{ fontSize: '5rem', marginBottom: '1rem' }}>{item.icon}</span>
            <h2 className="menu-label">{item.label}</h2>
            <p className="menu-desc">{item.description}</p>
          </button>
        ))}
      </main>
    </div>
  );
};

export default Home;
