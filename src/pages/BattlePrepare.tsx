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

  // 対戦相手のモックデータ
  const opponent = {
    name: '強敵ライバル',
    chara: { name: '伝説の剣士', rarity: 'SSR', level: 10, hp: 800, atk: 80, tech: 50 } as Chara,
    equip: { name: '神殺しの剣', rarity: 'SSR', level: 10, bonusHp: 50, bonusAtk: 100, bonusTech: 30 } as Equip
  };

  const handleStartBattle = () => {
    if (selectedChara && selectedEquip) {
      navigate('/battle', { state: { selectedChara, selectedEquip, opponent, from: '/battle-prepare' } });
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
              <div className="card-grid mini">
                {ownedCharas.map((chara) => (
                  <GameCard 
                    key={chara.cardId} 
                    card={chara}
                    isMini={true}
                    onClick={() => { setSelectedChara(chara); setStep(2); }}
                  />
                ))}
              </div>
            ) : (
              <div className="card-grid mini">
                {ownedEquips.map((equip) => (
                  <GameCard 
                    key={equip.cardId} 
                    card={equip}
                    isMini={true}
                    onClick={() => setSelectedEquip(equip)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="preview-section">
          <div className="vs-container">
            <div className="player-side">
              <h3>YOU</h3>
              {selectedChara ? (
                <div className="preview-card-holder">
                  <GameCard card={selectedChara} />
                  {selectedEquip && <div style={{ marginTop: '10px' }}><GameCard card={selectedEquip} isMini /></div>}
                </div>
              ) : (
                <div className="preview-card-placeholder">キャラを選択してください</div>
              )}
            </div>

            <div className="vs-badge">VS</div>

            <div className="opponent-side">
              <h3>ENEMY</h3>
              <div className="preview-card-holder">
                <GameCard card={opponent.chara} />
                <div style={{ marginTop: '10px' }}><GameCard card={opponent.equip} isMini /></div>
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
