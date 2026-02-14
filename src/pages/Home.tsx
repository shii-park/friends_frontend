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
    { label: 'バトル', path: '/battle-select', color: '#ff7675', icon: '⚔️', description: 'NPCやオンラインで対戦' },
    { label: 'ストレージ', path: '/storage', color: '#74b9ff', icon: '🎒', description: 'キャラクター・装備の確認' },
    { label: 'ガチャ', path: '/gacha', color: '#ffeaa7', icon: '💎', description: '新しいカードを入手', textColor: '#2d3436' },
  ];

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="user-info">
          <div className="user-name">{user.userName}</div>
          <div className="user-stats">
            <span>RP: {user.rp}</span>
            <span>コイン: {user.coin}</span>
            <span>石: {gachaStones}</span>
          </div>
        </div>
      </header>

      <main className="home-menu">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="menu-card"
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
