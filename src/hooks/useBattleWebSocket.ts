import { useCallback, useEffect, useRef, useState } from 'react';
import type { BackendHand, FrontendHand } from '../types/game';
import { HAND_FROM_BACKEND, HAND_TO_BACKEND, SPECIAL_FROM_BACKEND } from '../types/game';

export interface NpcInfo {
  charaName: string;
  charaRarity: string;
  charaIconUrl?: string;
  charaHp: number;
  charaAtk: number;
  charaTech: number;
  equipName: string;
  equipRarity: string;
  equipIconUrl?: string;
  equipHp: number;
  equipAtk: number;
  equipTech: number;
  specialType: FrontendHand;
}

export interface PlayerBattleInfo {
  charaHp: number;
  charaAtk: number;
  charaTech: number;
  equipHp: number;
  equipAtk: number;
  equipTech: number;
}

export interface RoundResultData {
  playerHP: number;
  npcHP: number;
  npcHand: FrontendHand;
}

export interface GameOverData {
  playerHP: number;
  npcHP: number;
  npcHand: FrontendHand;
  outcome: string;
  rankPointDelta: number;
  coinReward: number;
  stoneReward: number;
}

type BattlePhase =
  | 'idle'
  | 'connecting'
  | 'waiting'
  | 'matching'
  | 'ready'
  | 'round_result'
  | 'game_over'
  | 'error'
  | 'opponent_disconnected';

export function useBattleWebSocket(battleType: 'npc' | 'online' = 'npc') {
  const wsRef = useRef<WebSocket | null>(null);

  const [phase, setPhase] = useState<BattlePhase>('idle');
  const [playerHP, setPlayerHP] = useState(0);
  const [npcHP, setNpcHP] = useState(0);
  const [npcInfo, setNpcInfo] = useState<NpcInfo | null>(null);
  const [playerBattleInfo, setPlayerBattleInfo] = useState<PlayerBattleInfo | null>(null);
  const [lastRound, setLastRound] = useState<RoundResultData | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // NPCの予告テキスト
  const [npcHintText, setNpcHintText] = useState<string | null>(null);

  // prepare_round 二重送信防止
  const preparedRef = useRef(false);

  const prepareRound = useCallback(() => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    if (preparedRef.current) return;

    wsRef.current.send(JSON.stringify({ type: 'prepare_round' }));
    preparedRef.current = true;
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'ready': {
        setPlayerHP(data.playerHP);
        setNpcHP(data.npcHP);

        setNpcInfo({
          charaName: data.npcCharaName || '???',
          charaRarity: data.npcCharaRarity || 'C',
          charaIconUrl: data.npcCharaIconURL,
          charaHp: data.npcCharaHP,
          charaAtk: data.npcCharaATK,
          charaTech: data.npcCharaTECH,
          equipName: data.npcEquipName || '???',
          equipRarity: data.npcEquipRarity || 'C',
          equipIconUrl: data.npcEquipIconURL,
          equipHp: data.npcEquipHP,
          equipAtk: data.npcEquipATK,
          equipTech: data.npcEquipTECH,
          specialType: SPECIAL_FROM_BACKEND[data.npcSpecialType] || 'G',
        });
        setPlayerBattleInfo({
          charaHp: data.playerCharaHP,
          charaAtk: data.playerCharaATK,
          charaTech: data.playerCharaTECH,
          equipHp: data.playerEquipHP,
          equipAtk: data.playerEquipATK,
          equipTech: data.playerEquipTECH,
        });

        // 新規バトル開始＝予告状態リセット
        setNpcHintText(null);
        preparedRef.current = false;

        setPhase('ready');
        break;
      }

      // NPCの予告テキスト受信
      case 'npc_hint': {
        setNpcHintText(data.npcHandText || null);
        // 予告が返ってきた＝このラウンドの prepare は完了扱いのままでOK
        break;
      }

      case 'round_result': {
        setPlayerHP(data.playerHP);
        setNpcHP(data.npcHP);
        setLastRound({
          playerHP: data.playerHP,
          npcHP: data.npcHP,
          npcHand: HAND_FROM_BACKEND[data.npcHand as BackendHand] || 'G',
        });

        // 次ラウンドでまた prepare できるようにする
        preparedRef.current = false;
        setNpcHintText(null);

        setPhase('round_result');
        break;
      }

      case 'game_over': {
        setPlayerHP(data.playerHP);
        setNpcHP(data.npcHP);

        const npcHand = HAND_FROM_BACKEND[data.npcHand as BackendHand] || 'G';

        setLastRound({
          playerHP: data.playerHP,
          npcHP: data.npcHP,
          npcHand,
        });

        setGameOver({
          playerHP: data.playerHP,
          npcHP: data.npcHP,
          npcHand,
          outcome: data.outcome,
          rankPointDelta: data.rankPointDelta,
          coinReward: data.coinReward || 0,
          stoneReward: data.stoneReward || 0,
        });

        preparedRef.current = false;
        setNpcHintText(null);

        setPhase('game_over');
        break;
      }

      case 'matching':
        setPhase('matching');
        break;

      case 'opponent_disconnected':
        setError('対戦相手が切断しました');
        setPhase('opponent_disconnected');
        break;

      case 'error':
        setError(data.error);
        setPhase('error');
        break;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) return; // StrictMode対策
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const path = battleType === 'online' ? '/battle/online/ws' : '/battle/ws';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + path;

    setPhase('connecting');

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (wsRef.current !== ws) return;
      setPhase('waiting');
    };

    ws.onmessage = (event) => {
      if (wsRef.current !== ws) return;
      handleMessage(event);
    };

    ws.onerror = () => {
      if (wsRef.current !== ws) return;
      setError('WebSocket接続エラー');
      setPhase('error');
    };

    ws.onclose = () => {
      if (wsRef.current !== ws) return;
      wsRef.current = null;
    };
  }, [handleMessage, battleType]);

  const startBattle = useCallback((charaID: string, equipID: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    setError(null);
    setLastRound(null);
    setGameOver(null);
    setNpcHintText(null);
    preparedRef.current = false;

    wsRef.current.send(JSON.stringify({ type: 'start', charaID, equipID }));
  }, []);

  const sendHand = useCallback((hand: FrontendHand) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    // 「相手の手はまだ見せない」に戻す
    setLastRound(null);
    setNpcHintText(null);

    wsRef.current.send(JSON.stringify({
      type: 'round',
      hand: HAND_TO_BACKEND[hand],
    }));
  }, []);

  const disconnect = useCallback(() => {
    if (!wsRef.current) return;
    wsRef.current.close();
    wsRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return {
    phase,
    playerHP,
    npcHP,
    npcInfo,
    playerBattleInfo,
    lastRound,
    gameOver,
    error,
    npcHintText,
    opponentDisconnected: phase === 'opponent_disconnected',
    connect,
    startBattle,
    prepareRound,
    sendHand,
    disconnect,
  };
}