import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // 簡易的なユーザーデータ（本来は状態管理やAPIから取得）
  const userData = {
    name: 'プレイヤー',
    rp: 0,
    coin: 1000,
    gachaStone: 10,
  };

  const menuItems = [
    { label: 'バトル', path: '/battle-select', color: '#e91e63', description: 'NPCやオンラインで対戦' },
    { label: 'ストレージ', path: '/storage', color: '#2196f3', description: 'キャラクター・装備の確認' },
    { label: 'ガチャ', path: '/gacha', color: '#ffeb3b', description: '新しいカードを入手', textColor: '#000' },
  ];

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="user-info">
          <div className="user-name">{userData.name}</div>
          <div className="user-stats">
            <span>RP: {userData.rp}</span>
            <span>コイン: {userData.coin}</span>
            <span>石: {userData.gachaStone}</span>
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
