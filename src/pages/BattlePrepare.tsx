import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import GameCard from '../components/GameCard';
import type { Chara, Equip } from '../types/game';

const BattlePrepare: React.FC = () => {
  const navigate = useNavigate();
  const { user, ownedCharas, ownedEquips } = useUser();

  const [selectedChara, setSelectedChara] = useState<Chara | null>(null);
  const [selectedEquip, setSelectedEquip] = useState<Equip | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  if (!user) return null;

  const handleStartBattle = () => {
    if (selectedChara && selectedEquip) {
      navigate('/battle', { state: { selectedChara, selectedEquip, from: '/battle-prepare' } });
    }
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
              <div className="card-grid">
                {ownedCharas.map((chara) => (
                  <GameCard
                    key={chara.cardId}
                    card={chara}
                    onClick={() => { setSelectedChara(chara); setStep(2); }}
                  />
                ))}
              </div>
            ) : (
              <div className="card-grid">
                {ownedEquips.map((equip) => (
                  <GameCard
                    key={equip.cardId}
                    card={equip}
                    onClick={() => setSelectedEquip(equip)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="preview-section">
          <div className="vs-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem 1rem' }}>
            <div className="player-side" style={{ transform: 'translateY(30px)', flex: 1 }}>
              <h3 style={{ marginBottom: '1rem' }}>YOU</h3>
              {selectedChara ? (
                <div className="preview-card-holder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <GameCard card={selectedChara} isMini />
                  {selectedEquip ? (
                    <GameCard card={selectedEquip} isMini />
                  ) : (
                    <div className="preview-card-placeholder" style={{ width: '100px', height: '140px', fontSize: '0.7rem' }}>装備未選択</div>
                  )}
                </div>
              ) : (
                <div className="preview-card-placeholder" style={{ width: '100px', height: '140px', fontSize: '0.7rem' }}>選択中...</div>
              )}
            </div>

            <div className="vs-badge" style={{ fontSize: '3rem', zIndex: 10 }}>VS</div>

            <div className="opponent-side" style={{ transform: 'translateY(-30px)', flex: 1 }}>
              <h3 style={{ marginBottom: '1rem' }}>ENEMY</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <div className="preview-card-placeholder" style={{ width: '100px', height: '140px', fontSize: '0.7rem' }}>???</div>
                <div className="preview-card-placeholder" style={{ width: '100px', height: '140px', fontSize: '0.7rem' }}>???</div>
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
