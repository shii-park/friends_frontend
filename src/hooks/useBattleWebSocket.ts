import { useState, useRef, useCallback, useEffect } from 'react';
import type { FrontendHand, BackendHand } from '../types/game';
import { HAND_TO_BACKEND, HAND_FROM_BACKEND, SPECIAL_FROM_BACKEND } from '../types/game';

export interface NpcInfo {
  charaName: string;
  charaRarity: string;
  charaIconUrl?: string;
  equipName: string;
  equipRarity: string;
  equipIconUrl?: string;
  specialType: FrontendHand;
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

type BattlePhase = 'idle' | 'connecting' | 'waiting' | 'ready' | 'round_result' | 'game_over' | 'error';

export function useBattleWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [phase, setPhase] = useState<BattlePhase>('idle');
  const [playerHP, setPlayerHP] = useState(0);
  const [npcHP, setNpcHP] = useState(0);
  const [npcInfo, setNpcInfo] = useState<NpcInfo | null>(null);
  const [lastRound, setLastRound] = useState<RoundResultData | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'ready':
        setPlayerHP(data.playerHP);
        setNpcHP(data.npcHP);
        setNpcInfo({
          charaName: data.npcCharaName || '???',
          charaRarity: data.npcCharaRarity || 'C',
          charaIconUrl: data.npcCharaIconURL,
          equipName: data.npcEquipName || '???',
          equipRarity: data.npcEquipRarity || 'C',
          equipIconUrl: data.npcEquipIconURL,
          specialType: SPECIAL_FROM_BACKEND[data.npcSpecialType] || 'G',
        });
        setPhase('ready');
        break;

      case 'round_result':
        setPlayerHP(data.playerHP);
        setNpcHP(data.npcHP);
        setLastRound({
          playerHP: data.playerHP,
          npcHP: data.npcHP,
          npcHand: HAND_FROM_BACKEND[data.npcHand as BackendHand] || 'G',
        });
        setPhase('round_result');
        break;

      case 'game_over':
        setPlayerHP(data.playerHP);
        setNpcHP(data.npcHP);
        setLastRound({
          playerHP: data.playerHP,
          npcHP: data.npcHP,
          npcHand: HAND_FROM_BACKEND[data.npcHand as BackendHand] || 'G',
        });
        setGameOver({
          playerHP: data.playerHP,
          npcHP: data.npcHP,
          npcHand: HAND_FROM_BACKEND[data.npcHand as BackendHand] || 'G',
          outcome: data.outcome,
          rankPointDelta: data.rankPointDelta,
          coinReward: data.coinReward || 0,
          stoneReward: data.stoneReward || 0,
        });
        setPhase('game_over');
        break;

      case 'error':
        setError(data.error);
        setPhase('error');
        break;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) return; // 既に接続中の場合はスキップ（StrictMode対策）
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/battle/ws';

    setPhase('connecting');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (wsRef.current !== ws) return; // 古いWSのイベントを無視
      setPhase('waiting');
    };

    ws.onmessage = (event) => {
      if (wsRef.current !== ws) return; // 古いWSのイベントを無視
      handleMessage(event);
    };

    ws.onerror = () => {
      if (wsRef.current !== ws) return; // 古いWSのイベントを無視（StrictMode対策）
      setError('WebSocket接続エラー');
      setPhase('error');
    };

    ws.onclose = () => {
      if (wsRef.current !== ws) return; // 古いWSのイベントを無視
      wsRef.current = null;
    };
  }, [handleMessage]);

  const startBattle = useCallback((charaID: string, equipID: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start',
        charaID,
        equipID,
      }));
    }
  }, []);

  const sendHand = useCallback((hand: FrontendHand) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'round',
        hand: HAND_TO_BACKEND[hand],
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
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
    lastRound,
    gameOver,
    error,
    connect,
    startBattle,
    sendHand,
    disconnect,
  };
}
