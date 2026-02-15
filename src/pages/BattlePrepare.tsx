import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import type { Chara, Equip } from '../types/game';

const BattlePrepare: React.FC = () => {
  const navigate = useNavigate();
  const { user, ownedCharas, ownedEquips } = useUser();
  
  const [selectedChara, setSelectedChara] = useState<Chara | null>(null);
  const [selectedEquip, setSelectedEquip] = useState<Equip | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  if (!user) return null;

  // 対戦相手のモックデータ
  const opponent = {
    name: '強敵ライバル',
    chara: { name: '伝説の剣士', rarity: 'SSR', level: 10, hp: 800, atk: 80 },
    equip: { name: '神殺しの剣', rarity: 'SSR', level: 10, bonusAtk: 100 }
  };

  const handleStartBattle = () => {
    if (selectedChara && selectedEquip) {
      navigate('/battle', { state: { selectedChara, selectedEquip, opponent, from: '/battle-prepare' } });
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      C: '#a7b0a0', UC: '#baed82', R: '#11c9c3', SR: '#004ef5', SSR: '#f369ce',
    };
    return colors[rarity] || '#ccc';
  };

  return (
    <div className="battle-prepare-page">
      <header className="app-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/battle-select', { state: { from: '/battle-prepare' } })}>← 戻る</button>
        </div>
        <div className="header-center">
          <h1>バトル準備</h1>
        </div>
        <div className="header-right">
          {/* 追加のステータスがあればここに表示 */}
        </div>
      </header>

      <main className="battle-prepare-content">
        <div className="selection-section">
          <div className="step-indicator">
            <span 
              className={step === 1 ? 'active' : ''} 
              onClick={() => setStep(1)}
            >
              1. キャラクター選択
            </span>
            <span 
              className={step === 2 ? 'active' : ''} 
              onClick={() => setStep(2)}
            >
              2. 装備選択
            </span>
          </div>

          <div className="selection-list">
            {step === 1 ? (
              <div className="card-grid mini">
                {ownedCharas.map((chara) => (
                  <div 
                    key={chara.cardId} 
                    className={`storage-card ${selectedChara?.cardId === chara.cardId ? 'selected' : ''}`}
                    style={{ borderColor: getRarityColor(chara.rarity), '--rarity-color': getRarityColor(chara.rarity) } as React.CSSProperties}
                    onClick={() => { setSelectedChara(chara); setStep(2); }}
                  >
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
                ))}
              </div>
            ) : (
              <div className="card-grid mini">
                {ownedEquips.map((equip) => (
                  <div 
                    key={equip.cardId} 
                    className={`storage-card ${selectedEquip?.cardId === equip.cardId ? 'selected' : ''}`}
                    style={{ borderColor: getRarityColor(equip.rarity), '--rarity-color': getRarityColor(equip.rarity) } as React.CSSProperties}
                    onClick={() => setSelectedEquip(equip)}
                  >
                    <div className="card-image-placeholder">Equip</div>
                    <div className="card-info">
                      <div className="card-name">{equip.name}</div>
                      <div className="card-level">Lv.{equip.level}</div>
                      <div className="card-stats">
                        <span>ATK: +{equip.bonusAtk}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="preview-section">
          <div className="vs-container">
            <div className="player-side">
              <h3>YOU</h3>
              <div className="preview-card">
                {selectedChara ? (
                  <>
                    <div className="preview-chara-name">{selectedChara.name}</div>
                    <div className="preview-equip-name">{selectedEquip ? `E: ${selectedEquip.name}` : '装備未選択'}</div>
                  </>
                ) : (
                  <div className="empty-preview">キャラを選択してください</div>
                )}
              </div>
            </div>

            <div className="vs-badge">VS</div>

            <div className="opponent-side">
              <h3>ENEMY</h3>
              <div className="preview-card opponent">
                <div className="preview-chara-name">{opponent.chara.name}</div>
                <div className="preview-equip-name">E: {opponent.equip.name}</div>
              </div>
            </div>
          </div>

          <button 
            className="battle-start-button" 
            disabled={!selectedChara || !selectedEquip}
            onClick={handleStartBattle}
          >
            バトル開始！
          </button>
        </div>
      </main>
    </div>
  );
};

export default BattlePrepare;
