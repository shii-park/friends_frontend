import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type Hand = 'G' | 'C' | 'P';

const Battle: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedChara, selectedEquip, opponent } = location.state || {};

  const [playerHp, setPlayerHp] = useState(0);
  const [opponentHp, setOpponentHp] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>(['バトル開始！']);
  const [isAnimating, setIsAnimating] = useState(false);
  const [damagePopup, setDamagePopup] = useState<{ value: number, target: 'player' | 'opponent' } | null>(null);
  const [lastResult, setLastResult] = useState<{playerHand: Hand, opponentHand: Hand, winner: 'player' | 'opponent' | 'draw' | null}>({
    playerHand: 'G',
    opponentHand: 'G',
    winner: null
  });

  // 初期HP設定
  useEffect(() => {
    if (selectedChara) {
      setPlayerHp(selectedChara.hp + (selectedEquip?.bonusHp || 0));
      setOpponentHp(opponent.chara.hp + (opponent.equip?.bonusAtk || 0)); // モックデータの整合性
    }
  }, [selectedChara, selectedEquip, opponent]);

  if (!selectedChara || !opponent) return null;

  const calculateDamage = (attacker: any, defender: any, isSpecial: boolean) => {
    const atk = (attacker.atk || attacker.chara.atk) + (attacker.bonusAtk || attacker.equip?.bonusAtk || 0);
    const tech = (attacker.tech || attacker.chara.tech) + (attacker.bonusTech || attacker.equip?.bonusTech || 0);
    
    let dmg = atk * (0.8 + Math.random() * 0.2) + tech * (0.5 + Math.random() * 0.5);
    if (isSpecial) dmg *= 1.5;

    const defAtk = (defender.atk || defender.chara.atk) + (defender.bonusAtk || defender.equip?.bonusAtk || 0);
    const def = defAtk * (0.3 + Math.random() * 0.2);

    const finalDmg = Math.max(0, Math.floor(dmg - def));
    return finalDmg;
  };

  const handleHandSelect = (playerHand: Hand) => {
    if (isAnimating || playerHp <= 0 || opponentHp <= 0) return;

    setIsAnimating(true);
    const hands: Hand[] = ['G', 'C', 'P'];
    const opponentHand = hands[Math.floor(Math.random() * 3)];

    let winner: 'player' | 'opponent' | 'draw' = 'draw';
    if (playerHand === opponentHand) winner = 'draw';
    else if (
      (playerHand === 'G' && opponentHand === 'C') ||
      (playerHand === 'C' && opponentHand === 'P') ||
      (playerHand === 'P' && opponentHand === 'G')
    ) winner = 'player';
    else winner = 'opponent';

    setLastResult({ playerHand, opponentHand, winner });

    setTimeout(() => {
      processBattleTurn(winner, playerHand, opponentHand);
    }, 1000);
  };

  const processBattleTurn = (winner: 'player' | 'opponent' | 'draw', playerHand: Hand, opponentHand: Hand) => {
    if (winner === 'draw') {
      setBattleLog(prev => ['引き分け！ダメージなし', ...prev]);
    } else if (winner === 'player') {
      const isSpecial = selectedChara.specialType === playerHand;
      const dmg = calculateDamage({ ...selectedChara, ...selectedEquip }, opponent, isSpecial);
      setOpponentHp(prev => Math.max(0, prev - dmg));
      setDamagePopup({ value: dmg, target: 'opponent' });
      setBattleLog(prev => [`あなたの攻撃！${isSpecial ? '【必殺】' : ''}${dmg}のダメージ！`, ...prev]);
    } else {
      const isSpecial = opponent.chara.specialType === opponentHand;
      const dmg = calculateDamage(opponent, { ...selectedChara, ...selectedEquip }, isSpecial);
      setPlayerHp(prev => Math.max(0, prev - dmg));
      setDamagePopup({ value: dmg, target: 'player' });
      setBattleLog(prev => [`相手の攻撃！${isSpecial ? '【必殺】' : ''}${dmg}のダメージ！`, ...prev]);
    }

    setTimeout(() => setDamagePopup(null), 1000);
    setIsAnimating(false);
  };

  // 決着判定
  useEffect(() => {
    if (!isAnimating) {
      if (opponentHp <= 0) {
        setBattleLog(prev => ['あなたの勝利！', ...prev]);
        setTimeout(() => navigate('/battle-result', { state: { result: 'win' } }), 2000);
      } else if (playerHp <= 0) {
        setBattleLog(prev => ['敗北...', ...prev]);
        setTimeout(() => navigate('/battle-result', { state: { result: 'lose' } }), 2000);
      }
    }
  }, [playerHp, opponentHp, isAnimating, navigate]);

  const handToEmoji = (h: Hand) => h === 'G' ? '✊' : h === 'C' ? '✌️' : '✋';

  return (
    <div className="battle-page">
      <div className="battle-arena">
        {/* Opponent Side */}
        <div className="battle-side opponent">
          <div className="chara-plate">
            <div className="chara-name">{opponent.chara.name}</div>
            <div className="hp-bar-container">
              <div className="hp-bar" style={{ width: `${(opponentHp / (opponent.chara.hp + (opponent.equip?.bonusAtk || 0))) * 100}%` }}></div>
            </div>
            <div className="hp-text">{opponentHp} HP</div>
          </div>
          <div className={`chara-sprite ${isAnimating && lastResult.winner === 'opponent' ? 'attacking' : ''}`}>
            <span style={{ position: 'relative' }}>
              👿
              {damagePopup?.target === 'opponent' && <div className="damage-popup">-{damagePopup.value}</div>}
            </span>
          </div>
        </div>

        <div className="battle-center">
          {isAnimating && (
            <div className="hand-display">
              <div className="hand player-hand">{handToEmoji(lastResult.playerHand)}</div>
              <div className="vs-text">VS</div>
              <div className="hand opponent-hand">{handToEmoji(lastResult.opponentHand)}</div>
            </div>
          )}
        </div>

        {/* Player Side */}
        <div className="battle-side player">
          <div className={`chara-sprite ${isAnimating && lastResult.winner === 'player' ? 'attacking' : ''}`}>
            <span style={{ position: 'relative' }}>
              🛡️
              {damagePopup?.target === 'player' && <div className="damage-popup">-{damagePopup.value}</div>}
            </span>
          </div>
          <div className="chara-plate">
            <div className="chara-name">{selectedChara.name}</div>
            <div className="hp-bar-container">
              <div className="hp-bar" style={{ width: `${(playerHp / (selectedChara.hp + (selectedEquip?.bonusHp || 0))) * 100}%` }}></div>
            </div>
            <div className="hp-text">{playerHp} HP</div>
          </div>
        </div>
      </div>

      <div className="battle-ui">
        <div className="battle-log">
          {battleLog.slice(0, 3).map((log, i) => (
            <div key={i} className="log-entry">{log}</div>
          ))}
        </div>

        <div className="hand-selector">
          {(['G', 'C', 'P'] as Hand[]).map(h => (
            <button 
              key={h} 
              className={`hand-button ${selectedChara.specialType === h ? 'special' : ''}`}
              onClick={() => handleHandSelect(h)}
              disabled={isAnimating}
            >
              <span className="hand-icon">{handToEmoji(h)}</span>
              <span className="hand-label">{h === 'G' ? 'グー' : h === 'C' ? 'チョキ' : 'パー'}</span>
              {selectedChara.specialType === h && <span className="special-badge">必殺</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Battle;
