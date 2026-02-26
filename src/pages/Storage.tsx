import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import GameCard from '../components/GameCard';
import type { Chara, Equip } from '../types/game';

const Storage: React.FC = () => {
  const navigate = useNavigate();
  const { user, ownedCharas, ownedEquips, levelUpCard } = useUser();
  const [tab, setTab] = useState<'chara' | 'equip'>('chara');
  const [selectedCard, setSelectedCard] = useState<{ id: string, type: 'chara' | 'equip' } | null>(null);

  if (!user) {
    return (
      <div className="error-container">
        <h2>ユーザー情報が見つかりません</h2>
        <p>タイトル画面からユーザー名を入力して「始める」を押してください。</p>
        <button onClick={() => navigate('/')}>タイトルへ戻る</button>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      C: '#a7b0a0', UC: '#baed82', R: '#11c9c3', SR: '#004ef5', SSR: '#f369ce',
    };
    return colors[rarity] || '#ccc';
  };

  const getCardData = () => {
    if (!selectedCard) return null;
    if (selectedCard.type === 'chara') {
      return ownedCharas.find(c => c.cardId === selectedCard.id);
    }
    return ownedEquips.find(e => e.cardId === selectedCard.id);
  };

  const handleLevelUp = async () => {
    if (!selectedCard) return;
    const result = await levelUpCard(selectedCard.id, selectedCard.type);
    if (!result.success) {
      alert(result.message || '強化に失敗しました');
    }
  };

  // 強化後のステータスを計算する関数
  const calculateNextStat = (init: number, max: number, currentLevel: number) => {
    if (currentLevel >= 10) return max;
    return Math.floor(init + (max - init) / 9 * currentLevel);
  };

  const currentCard = getCardData();
  const { isLoading } = useUser();
  const costs: Record<number, number> = {
    2: 100, 3: 200, 4: 300, 5: 400, 6: 500, 
    7: 600, 8: 700, 9: 800, 10: 10000
  };

  return (
    <div className="storage-page">
      <header className="app-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/home', { state: { from: '/storage' } })}>↑ 戻る</button>
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
          <button className={`tab-button ${tab === 'chara' ? 'active' : ''}`} onClick={() => setTab('chara')}>キャラクター</button>
          <button className={`tab-button ${tab === 'equip' ? 'active' : ''}`} onClick={() => setTab('equip')}>装備</button>
        </div>
      </div>

      <main className="storage-content">
        <div className="card-grid">
          {tab === 'chara' ? (
            ownedCharas.map((chara: Chara) => (
              <GameCard 
                key={chara.cardId} 
                card={chara}
                onClick={() => setSelectedCard({ id: chara.cardId, type: 'chara' })}
              />
            ))
          ) : (
            ownedEquips.map((equip: Equip) => (
              <GameCard 
                key={equip.cardId} 
                card={equip}
                onClick={() => setSelectedCard({ id: equip.cardId, type: 'equip' })}
              />
            ))
          )}
        </div>
      </main>

      {/* 強化モーダル */}
      {selectedCard && currentCard && (
        <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
          <div 
            className="strengthen-modal" 
            style={{ borderColor: getRarityColor(currentCard.rarity) }} 
            onClick={e => e.stopPropagation()}
          >
            <h2>カード強化</h2>
            <div className="modal-card-info">
              <div className="modal-card-visual">
                <GameCard card={currentCard} />
              </div>
              <div className="modal-card-details">
                <h3>{currentCard.name}</h3>
                <p className="modal-level">Lv.{currentCard.level} <span className="arrow">→</span> {currentCard.level < 10 ? currentCard.level + 1 : 'MAX'}</p>
                {selectedCard.type === 'chara' ? (
                  <div className="modal-stats">
                    <p><span>HP</span> <span>{(currentCard as Chara).hp} <span className="arrow">→</span> {currentCard.level < 10 ? calculateNextStat((currentCard as Chara).initHp, (currentCard as Chara).maxHp, currentCard.level) : 'MAX'}</span></p>
                    <p><span>ATK</span> <span>{(currentCard as Chara).atk} <span className="arrow">→</span> {currentCard.level < 10 ? calculateNextStat((currentCard as Chara).initAtk, (currentCard as Chara).maxAtk, currentCard.level) : 'MAX'}</span></p>
                    <p><span>TECH</span> <span>{(currentCard as Chara).tech} <span className="arrow">→</span> {currentCard.level < 10 ? calculateNextStat((currentCard as Chara).initTech, (currentCard as Chara).maxTech, currentCard.level) : 'MAX'}</span></p>
                  </div>
                ) : (
                  <div className="modal-stats">
                    <p><span>Bonus HP</span> <span>+{(currentCard as Equip).bonusHp} <span className="arrow">→</span> {currentCard.level < 10 ? '+' + calculateNextStat((currentCard as Equip).initBonusHp, (currentCard as Equip).maxBonusHp, currentCard.level) : 'MAX'}</span></p>
                    <p><span>Bonus ATK</span> <span>+{(currentCard as Equip).bonusAtk} <span className="arrow">→</span> {currentCard.level < 10 ? '+' + calculateNextStat((currentCard as Equip).initBonusAtk, (currentCard as Equip).maxBonusAtk, currentCard.level) : 'MAX'}</span></p>
                    <p><span>Bonus TECH</span> <span>+{(currentCard as Equip).bonusTech} <span className="arrow">→</span> {currentCard.level < 10 ? '+' + calculateNextStat((currentCard as Equip).initBonusTech, (currentCard as Equip).maxBonusTech, currentCard.level) : 'MAX'}</span></p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <p className="upgrade-cost">消費コイン: {currentCard.level < 10 ? costs[currentCard.level + 1].toLocaleString() : '-'}</p>
              <button className="upgrade-button" disabled={isLoading || currentCard.level >= 10 || user.coin < (costs[currentCard.level + 1] || 0)} onClick={handleLevelUp}>
                {isLoading ? '強化中...' : '強化する'}
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
