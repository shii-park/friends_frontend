import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import type { Chara, Equip } from '../types/game';

const Storage: React.FC = () => {
  const navigate = useNavigate();
  const { user, ownedCharas, ownedEquips, levelUpCard } = useUser();
  const [tab, setTab] = useState<'chara' | 'equip'>('chara');
  const [selectedCard, setSelectedCard] = useState<{ id: string, type: 'chara' | 'equip' } | null>(null);

  if (!user) {
    return (
      <div style={{ 
        color: '#333', 
        padding: '50px', 
        backgroundColor: '#fff', 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <h2>ユーザー情報が見つかりません</h2>
        <p>タイトル画面からユーザー名を入力して「始める」を押してください。</p>
        <button 
          onClick={() => navigate('/')}
          style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
        >
          タイトルへ戻る
        </button>
      </div>
    );
  }

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

  const getCardData = () => {
    if (!selectedCard) return null;
    if (selectedCard.type === 'chara') {
      return ownedCharas.find(c => c.cardId === selectedCard.id);
    }
    return ownedEquips.find(e => e.cardId === selectedCard.id);
  };

  const handleLevelUp = () => {
    if (!selectedCard) return;
    const result = levelUpCard(selectedCard.id, selectedCard.type);
    if (!result.success) {
      alert(result.message || '強化に失敗しました');
    }
  };

  const currentCard = getCardData();
  const costs: Record<number, number> = {
    2: 100, 3: 200, 4: 300, 5: 400, 6: 500, 
    7: 600, 8: 700, 9: 800, 10: 10000
  };

  return (
    <div className="storage-page">
      <header className="app-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/home')}>← 戻る</button>
        </div>
        <div className="header-center">
          <h1>ストレージ</h1>
        </div>
        <div className="header-right">
          <div className="header-stats-item">コイン: {user.coin}</div>
        </div>
      </header>

      <div className="storage-tabs-container">
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
      </div>

      <main className="storage-content">
        <div className="card-grid">
          {tab === 'chara' ? (
            ownedCharas.map((chara: Chara) => (
              <div 
                key={chara.cardId} 
                className="storage-card chara-card"
                onClick={() => setSelectedCard({ id: chara.cardId, type: 'chara' })}
              >
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
              <div 
                key={equip.cardId} 
                className="storage-card equip-card"
                onClick={() => setSelectedCard({ id: equip.cardId, type: 'equip' })}
              >
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

      {/* 強化モーダル */}
      {selectedCard && currentCard && (
        <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
          <div className="strengthen-modal" onClick={e => e.stopPropagation()}>
            <h2>カード強化</h2>
            <div className="modal-card-info">
              <div className="modal-card-visual">
                {renderRarity(currentCard.rarity)}
                <div className="modal-image-placeholder">{selectedCard.type === 'chara' ? 'Chara' : 'Equip'}</div>
              </div>
              <div className="modal-card-details">
                <h3>{currentCard.name}</h3>
                <p className="modal-level">Lv.{currentCard.level} → {currentCard.level < 10 ? currentCard.level + 1 : 'MAX'}</p>
                {selectedCard.type === 'chara' ? (
                  <div className="modal-stats">
                    <p>HP: {(currentCard as Chara).hp} → {(currentCard as Chara).level < 10 ? '???' : 'MAX'}</p>
                    <p>ATK: {(currentCard as Chara).atk} → {(currentCard as Chara).level < 10 ? '???' : 'MAX'}</p>
                  </div>
                ) : (
                  <div className="modal-stats">
                    <p>Bonus ATK: +{(currentCard as Equip).bonusAtk} → {(currentCard as Equip).level < 10 ? '???' : 'MAX'}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              <p className="upgrade-cost">
                消費コイン: {currentCard.level < 10 ? costs[currentCard.level + 1] : '-'}
              </p>
              <button 
                className="upgrade-button" 
                disabled={currentCard.level >= 10 || user.coin < costs[currentCard.level + 1]}
                onClick={handleLevelUp}
              >
                強化する
              </button>
              <button className="close-button" onClick={() => setSelectedCard(null)}>閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storage;
