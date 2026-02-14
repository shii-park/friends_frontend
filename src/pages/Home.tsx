import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!user) {
    return <div>読み込み中...</div>;
  }

  const menuItems = [
    { label: 'バトル', path: '/battle-select', color: '#e91e63', description: 'NPCやオンラインで対戦' },
    { label: 'ストレージ', path: '/storage', color: '#2196f3', description: 'キャラクター・装備の確認' },
    { label: 'ガチャ', path: '/gacha', color: '#ffeb3b', description: '新しいカードを入手', textColor: '#000' },
  ];

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="user-info">
          <div className="user-name">{user.userName}</div>
          <div className="user-stats">
            <span>RP: {user.rp}</span>
            <span>コイン: {user.coin}</span>
            <span>石: 0</span> {/* 石の型定義を後で調整 */}
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
            <h2 className="menu-label">{item.label}</h2>
            <p className="menu-desc">{item.description}</p>
          </button>
        ))}
      </main>
    </div>
  );
};

export default Home;
