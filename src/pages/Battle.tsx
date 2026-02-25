import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useBattleWebSocket } from '../hooks/useBattleWebSocket';
import type { FrontendHand } from '../types/game';

type Hand = FrontendHand;

const Battle: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, gachaStones } = useUser();
  const { selectedChara, selectedEquip } = location.state || {};

  const {
    phase,
    playerHP,
    npcHP,
    npcInfo,
    lastRound,
    gameOver,
    error,
    connect,
    startBattle,
    sendHand,
    disconnect,
  } = useBattleWebSocket();

  const [isAnimating, setIsAnimating] = useState(false);
  const [damagePopup, setDamagePopup] = useState<{ value: string; target: 'player' | 'opponent' } | null>(null);
  const [playerHand, setPlayerHand] = useState<Hand | null>(null);
  const [initialPlayerHP, setInitialPlayerHP] = useState(0);
  const [initialNpcHP, setInitialNpcHP] = useState(0);
  const [roundWinner, setRoundWinner] = useState<'player' | 'opponent' | 'draw' | null>(null);
  const prevPlayerHP = useRef(0);
  const prevNpcHP = useRef(0);

  // mount時にWebSocket接続
  useEffect(() => {
    if (selectedChara) connect();
    return () => { disconnect(); };
  }, []);

  // 接続完了後にバトル開始
  useEffect(() => {
    if (phase === 'waiting' && selectedChara && selectedEquip) {
      startBattle(selectedChara.charaId, selectedEquip.equipId);
    }
  }, [phase, selectedChara, selectedEquip, startBattle]);

  // ready受信時に初期HP保存
  useEffect(() => {
    if (phase === 'ready' && initialPlayerHP === 0) {
      setInitialPlayerHP(playerHP);
      setInitialNpcHP(npcHP);
      prevPlayerHP.current = playerHP;
      prevNpcHP.current = npcHP;
    }
  }, [phase, playerHP, npcHP, initialPlayerHP]);

  // round_result受信時のアニメーション
  useEffect(() => {
    if (phase === 'round_result' && lastRound) {
      const hpDiffPlayer = prevPlayerHP.current - playerHP;
      const hpDiffNpc = prevNpcHP.current - npcHP;

      // winnerを先にstateに保存してからrefを更新
      if (hpDiffNpc > 0) {
        setRoundWinner('player');
        setDamagePopup({ value: `-${hpDiffNpc}`, target: 'opponent' });
      } else if (hpDiffPlayer > 0) {
        setRoundWinner('opponent');
        setDamagePopup({ value: `-${hpDiffPlayer}`, target: 'player' });
      } else {
        setRoundWinner('draw');
      }

      prevPlayerHP.current = playerHP;
      prevNpcHP.current = npcHP;

      setIsAnimating(true);
      const timer1 = setTimeout(() => setDamagePopup(null), 1000);
      const timer2 = setTimeout(() => setIsAnimating(false), 1200);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [phase, lastRound, playerHP, npcHP]);

  // game_over受信時のアニメーション＆遷移
  useEffect(() => {
    if (phase === 'game_over' && gameOver) {
      const hpDiffPlayer = prevPlayerHP.current - playerHP;
      const hpDiffNpc = prevNpcHP.current - npcHP;

      if (hpDiffNpc > 0) {
        setRoundWinner('player');
        setDamagePopup({ value: `-${hpDiffNpc}`, target: 'opponent' });
      } else if (hpDiffPlayer > 0) {
        setRoundWinner('opponent');
        setDamagePopup({ value: `-${hpDiffPlayer}`, target: 'player' });
      }
      setIsAnimating(true);

      const timer = setTimeout(() => {
        navigate('/battle-result', {
          state: {
            result: gameOver.outcome === 'win' ? 'win' : 'lose',
            rankPointDelta: gameOver.rankPointDelta,
            coinReward: gameOver.coinReward,
            stoneReward: gameOver.stoneReward,
            from: '/battle',
          },
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, gameOver, navigate, playerHP, npcHP]);

  const handleHandSelect = (hand: Hand) => {
    if (isAnimating || phase === 'game_over') return;
    setPlayerHand(hand);
    setIsAnimating(true);
    sendHand(hand);
  };

  const handToEmoji = (h: Hand) => (h === 'G' ? '✊' : h === 'C' ? '✌️' : '✋');

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      C: '#a7b0a0', UC: '#baed82', R: '#11c9c3', SR: '#004ef5', SSR: '#f369ce',
    };
    return colors[rarity] || '#ccc';
  };

  if (!user || !selectedChara) return null;

  // ローディング表示
  if (phase === 'idle' || phase === 'connecting' || phase === 'waiting') {
    return (
      <div className="battle-page">
        <header className="app-header">
          <div className="header-left">
            <div className="header-user-name">{user.userName}</div>
          </div>
          <div className="header-center">
            <h1>BATTLE</h1>
          </div>
          <div className="header-right">
            <div className="header-stats-item">RP: {user.rp}</div>
            <div className="header-stats-item">コイン: {user.coin}</div>
            <div className="header-stats-item">石: {gachaStones}</div>
          </div>
        </header>
        <div className="battle-arena" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: '#e98f11', fontSize: '1.5rem', fontWeight: 700 }}>
            対戦相手を探しています...
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (phase === 'error') {
    return (
      <div className="battle-page">
        <header className="app-header">
          <div className="header-left">
            <div className="header-user-name">{user.userName}</div>
          </div>
          <div className="header-center">
            <h1>BATTLE</h1>
          </div>
          <div className="header-right" />
        </header>
        <div className="battle-arena" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
          <div style={{ color: '#ff4444', fontSize: '1.2rem' }}>エラー: {error}</div>
          <button className="home-button" onClick={() => navigate('/home')}>ホームへ戻る</button>
        </div>
      </div>
    );
  }

  const npcCharaName = npcInfo?.charaName || '???';
  const npcCharaRarity = npcInfo?.charaRarity || 'C';
  const npcEquipName = npcInfo?.equipName || '???';
  const npcEquipRarity = npcInfo?.equipRarity || 'C';

  return (
    <div className="battle-page">
      <header className="app-header">
        <div className="header-left">
          <div className="header-user-name">{user.userName}</div>
        </div>
        <div className="header-center">
          <h1>BATTLE</h1>
        </div>
        <div className="header-right">
          <div className="header-stats-item">RP: {user.rp}</div>
          <div className="header-stats-item">コイン: {user.coin}</div>
          <div className="header-stats-item">石: {gachaStones}</div>
        </div>
      </header>

      <div className="battle-arena">
        {/* Opponent Side */}
        <div className="battle-side opponent">
          <div className="chara-plate">
            <div className="chara-name">{npcCharaName}</div>
            <div className="hp-bar-container">
              <div className="hp-bar" style={{ width: `${initialNpcHP > 0 ? (npcHP / initialNpcHP) * 100 : 0}%` }}></div>
            </div>
            <div className="hp-text">{npcHP} HP</div>
          </div>

          <div className="battle-cards-container">
            <div className={`battle-card chara ${isAnimating && roundWinner === 'opponent' ? 'attacking' : ''}`}
                 style={{ borderColor: getRarityColor(npcCharaRarity) }}>
              <div className="battle-card-image">Chara</div>
              <div className="battle-card-name">{npcCharaName}</div>
              {damagePopup?.target === 'opponent' && <div className="damage-popup">{damagePopup.value}</div>}
            </div>
            <div className="battle-card equip"
                 style={{ borderColor: getRarityColor(npcEquipRarity) }}>
              <div className="battle-card-image mini">Equip</div>
              <div className="battle-card-name mini">{npcEquipName}</div>
            </div>
          </div>
        </div>

        <div className="battle-center">
          {isAnimating && playerHand && lastRound ? (
            <div className="hand-display">
              <div className="hand player-hand">{handToEmoji(playerHand)}</div>
              <div className="vs-text">VS</div>
              <div className="hand opponent-hand">{handToEmoji(lastRound.npcHand)}</div>
            </div>
          ) : (
            playerHP > 0 && npcHP > 0 && phase !== 'game_over' && (
              <div className="choose-hand-text">CHOOSE YOUR HAND!</div>
            )
          )}
        </div>

        {/* Player Side */}
        <div className="battle-side player">
          <div className="battle-cards-container">
            <div className="battle-card equip"
                 style={{ borderColor: getRarityColor(selectedEquip.rarity) }}>
              <div className="battle-card-image mini">Equip</div>
              <div className="battle-card-name mini">{selectedEquip.name}</div>
            </div>
            <div className={`battle-card chara ${isAnimating && roundWinner === 'player' ? 'attacking' : ''}`}
                 style={{ borderColor: getRarityColor(selectedChara.rarity) }}>
              <div className="battle-card-image">Chara</div>
              <div className="battle-card-name">{selectedChara.name}</div>
              {damagePopup?.target === 'player' && <div className="damage-popup">{damagePopup.value}</div>}
            </div>
          </div>

          <div className="chara-plate">
            <div className="chara-name">{selectedChara.name}</div>
            <div className="hp-bar-container">
              <div className="hp-bar" style={{ width: `${initialPlayerHP > 0 ? (playerHP / initialPlayerHP) * 100 : 0}%` }}></div>
            </div>
            <div className="hp-text">{playerHP} HP</div>
          </div>
        </div>
      </div>

      <div className="battle-ui">
        <div className="hand-selector">
          {(['G', 'C', 'P'] as Hand[]).map(h => (
            <button
              key={h}
              className={`hand-button ${selectedChara.specialType === h ? 'special' : ''}`}
              onClick={() => handleHandSelect(h)}
              disabled={isAnimating || phase === 'game_over'}
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
