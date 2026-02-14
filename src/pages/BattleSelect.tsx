import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const BattleSelect: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!user) return null;

  const battleTypes = [
    {
      id: 'npc',
      title: 'NPCバトル',
      description: 'コンピューターと対戦して腕を磨こう。',
      color: '#4caf50',
      icon: '🤖',
    },
    {
      id: 'online',
      title: 'オンラインバトル',
      description: '全国のプレイヤーとリアルタイムで対戦！',
      color: '#f44336',
      icon: '⚔️',
    },
  ];

  const handleSelect = (type: string) => {
    // どちらを選んでも次はバトル準備画面へ
    navigate('/battle-prepare', { state: { battleType: type } });
  };

  return (
    <div className="battle-select-page">
      <header className="app-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/home')}>← 戻る</button>
        </div>
        <div className="header-center">
          <h1>バトル選択</h1>
        </div>
        <div className="header-right">
          <div className="header-stats-item">RP: {user.rp}</div>
        </div>
      </header>

      <main className="battle-select-content">
        <div className="battle-type-container">
          {battleTypes.map((type) => (
            <button
              key={type.id}
              className="battle-type-card"
              style={{ borderTop: `8px solid ${type.color}` }}
              onClick={() => handleSelect(type.id)}
            >
              <div className="battle-type-icon">{type.icon}</div>
              <h2 className="battle-type-title">{type.title}</h2>
              <p className="battle-type-desc">{type.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BattleSelect;
