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
  const { selectedChara, selectedEquip, battleType } = location.state || {};

  const {
    phase,
    playerHP,
    npcHP,
    npcInfo,
    playerBattleInfo,
    lastRound,
    gameOver,
    error,
    opponentDisconnected,
    connect,
    startBattle,
    sendHand,
    disconnect,
  } = useBattleWebSocket(battleType ?? 'npc');

  const [isAnimating, setIsAnimating] = useState(false);
  const [roundResultReady, setRoundResultReady] = useState(false);
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
      startBattle(selectedChara.cardId, selectedEquip.cardId);
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

      if (hpDiffNpc > 0) {
        setRoundWinner('player');
        setDamagePopup({ value: `-${hpDiffNpc}dmg`, target: 'opponent' });
      } else if (hpDiffPlayer > 0) {
        setRoundWinner('opponent');
        setDamagePopup({ value: `-${hpDiffPlayer}dmg`, target: 'player' });
      } else {
        setRoundWinner('draw');
      }

      prevPlayerHP.current = playerHP;
      prevNpcHP.current = npcHP;

      setRoundResultReady(true);
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
        setDamagePopup({ value: `-${hpDiffNpc}dmg`, target: 'opponent' });
      } else if (hpDiffPlayer > 0) {
        setRoundWinner('opponent');
        setDamagePopup({ value: `-${hpDiffPlayer}dmg`, target: 'player' });
      }
      setRoundResultReady(true);
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
    setRoundResultReady(false);
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

  const getImageUrl = (url: string) => {
    return new URL(`../assets/${url}`, import.meta.url).href;
  };

  if (!user || !selectedChara) return null;

  // ヘッダー共通パーツ
  const header = (
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
  );

  // NPC戦ローディング
  if (phase === 'idle' || phase === 'connecting' || phase === 'waiting') {
    return (
      <div className="battle-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {header}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: '#e98f11', fontSize: '1.5rem', fontWeight: 700 }}>
            対戦相手を探しています...
          </div>
        </div>
      </div>
    );
  }

  // オンラインマッチング待機画面
  if (phase === 'matching') {
    return (
      <div className="battle-page matching-page">
        {header}
        <div className="matching-arena">
          <div className="matching-scanline" />

          <div className="matching-vs-container">
            {/* プレイヤー側 */}
            <div className="matching-player-side">
              <div className="matching-side-label">YOU</div>
              <div
                className="matching-card-player"
                style={{ borderColor: getRarityColor(selectedChara.rarity) }}
              >
                {selectedChara.cardIconUrl ? (
                  <img
                    src={getImageUrl(selectedChara.cardIconUrl)}
                    alt={selectedChara.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>⚔️</span>
                )}
              </div>
              <div className="matching-chara-name">{selectedChara.name}</div>
            </div>

            {/* 中央：レーダー＋VS */}
            <div className="matching-center">
              <div className="matching-radar">
                <div className="radar-ring ring-1" />
                <div className="radar-ring ring-2" />
                <div className="radar-ring ring-3" />
                <div className="matching-vs-text">VS</div>
              </div>
            </div>

            {/* 相手側 */}
            <div className="matching-opponent-side">
              <div className="matching-side-label">ENEMY</div>
              <div className="matching-card-unknown">
                <span className="unknown-question">?</span>
              </div>
              <div className="matching-chara-name matching-chara-name--unknown">???</div>
            </div>
          </div>

          {/* ステータス */}
          <div className="matching-status">
            <div className="matching-status-text">MATCHING</div>
            <div className="matching-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラー・切断表示
  if (phase === 'error' || opponentDisconnected) {
    return (
      <div className="battle-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {header}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
          <div style={{ color: '#ff4444', fontSize: '1.2rem' }}>
            {opponentDisconnected ? '対戦相手が切断しました' : `エラー: ${error}`}
          </div>
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
      {header}

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
            <div className={`battle-card chara ${isAnimating && roundWinner === 'opponent' ? 'attacking' : ''} ${damagePopup?.target === 'opponent' ? 'taking-damage' : ''}`}
                 style={{ borderColor: getRarityColor(npcCharaRarity) }}>
              <div className="battle-card-image">
                {npcInfo?.charaIconUrl ? (
                  <img src={getImageUrl(npcInfo.charaIconUrl)} alt={npcCharaName} className="card-icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  'Chara'
                )}
              </div>
              <div className="battle-card-name">{npcCharaName}</div>
              <div className="battle-card-stats">
                <span>HP: {npcInfo?.charaHp}</span>
                <span>ATK: {npcInfo?.charaAtk}</span>
                <span>TECH: {npcInfo?.charaTech}</span>
              </div>
              {damagePopup?.target === 'opponent' && (
                <div className="damage-popup opponent">{damagePopup.value}</div>
              )}
            </div>
            <div className="battle-card equip"
                 style={{ borderColor: getRarityColor(npcEquipRarity) }}>
              <div className="battle-card-image mini">
                {npcInfo?.equipIconUrl ? (
                  <img src={getImageUrl(npcInfo.equipIconUrl)} alt={npcEquipName} className="card-icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  'Equip'
                )}
              </div>
              <div className="battle-card-name mini">{npcEquipName}</div>
              <div className="battle-card-stats mini">
                <span>HP+: {npcInfo?.equipHp}</span>
                <span>ATK+: {npcInfo?.equipAtk}</span>
                <span>TECH+: {npcInfo?.equipTech}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="battle-center">
          {isAnimating && roundResultReady && playerHand && lastRound ? (
            <div className="hand-display">
              <div className="hand player-hand">{handToEmoji(playerHand)}</div>
              <div className="vs-text">VS</div>
              <div className="hand opponent-hand">{handToEmoji(lastRound.npcHand)}</div>
            </div>
          ) : phase === 'game_over' && gameOver ? (
            <div className={`finish-text ${gameOver.outcome === 'win' ? 'victory' : 'lose'}`}>
              {gameOver.outcome === 'win' ? 'VICTORY!' : 'LOSE...'}
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
              <div className="battle-card-image mini">
                {selectedEquip.cardIconUrl ? (
                  <img src={getImageUrl(selectedEquip.cardIconUrl)} alt={selectedEquip.name} className="card-icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  'Equip'
                )}
              </div>
              <div className="battle-card-name mini">{selectedEquip.name}</div>
              <div className="battle-card-stats mini">
                <span>HP+: {playerBattleInfo?.equipHp}</span>
                <span>ATK+: {playerBattleInfo?.equipAtk}</span>
                <span>TECH+: {playerBattleInfo?.equipTech}</span>
              </div>
            </div>
            <div className={`battle-card chara ${isAnimating && roundWinner === 'player' ? 'attacking' : ''} ${damagePopup?.target === 'player' ? 'taking-damage' : ''}`}
                 style={{ borderColor: getRarityColor(selectedChara.rarity) }}>
              <div className="battle-card-image">
                {selectedChara.cardIconUrl ? (
                  <img src={getImageUrl(selectedChara.cardIconUrl)} alt={selectedChara.name} className="card-icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  'Chara'
                )}
              </div>
              <div className="battle-card-name">{selectedChara.name}</div>
              <div className="battle-card-stats">
                <span>HP: {playerBattleInfo?.charaHp}</span>
                <span>ATK: {playerBattleInfo?.charaAtk}</span>
                <span>TECH: {playerBattleInfo?.charaTech}</span>
              </div>
              {damagePopup?.target === 'player' && (
                <div className="damage-popup player">{damagePopup.value}</div>
              )}
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
