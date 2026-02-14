import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import type { Chara, Equip } from '../types/game';

const Storage: React.FC = () => {
  const navigate = useNavigate();
  const { user, ownedCharas, ownedEquips } = useUser();
  const [tab, setTab] = React.useState<'chara' | 'equip'>('chara');

  if (!user) return null;

  const renderRarity = (rarity: string) => {
    const colors: Record<string, string> = {
      C: '#888',
      UC: '#4caf50',
      R: '#2196f3',
      SR: '#9c27b0',
      SSR: '#ff9800',
    };
    return (
      <span className="rarity-badge" style={{ backgroundColor: colors[rarity] }}>
        {rarity}
      </span>
    );
  };

  return (
    <div className="storage-page">
      <header className="storage-header">
        <button className="back-button" onClick={() => navigate('/home')}>← 戻る</button>
        <h1>ストレージ</h1>
        <div className="tab-buttons">
          <button 
            className={`tab-button ${tab === 'chara' ? 'active' : ''}`}
            onClick={() => setTab('chara')}
          >
            キャラクター
          </button>
          <button 
            className={`tab-button ${tab === 'equip' ? 'active' : ''}`}
            onClick={() => setTab('equip')}
          >
            装備
          </button>
        </div>
      </header>

      <main className="storage-content">
        <div className="card-grid">
          {tab === 'chara' ? (
            ownedCharas.map((chara: Chara) => (
              <div key={chara.cardId} className="storage-card chara-card">
                <div className="card-rarity">{renderRarity(chara.rarity)}</div>
                <div className="card-image-placeholder">Chara</div>
                <div className="card-info">
                  <div className="card-name">{chara.name}</div>
                  <div className="card-level">Lv.{chara.level}</div>
                  <div className="card-stats">
                    <span>HP: {chara.hp}</span>
                    <span>ATK: {chara.atk}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            ownedEquips.map((equip: Equip) => (
              <div key={equip.cardId} className="storage-card equip-card">
                <div className="card-rarity">{renderRarity(equip.rarity)}</div>
                <div className="card-image-placeholder">Equip</div>
                <div className="card-info">
                  <div className="card-name">{equip.name}</div>
                  <div className="card-level">Lv.{equip.level}</div>
                  <div className="card-stats">
                    <span>ATK: +{equip.bonusAtk}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Storage;
