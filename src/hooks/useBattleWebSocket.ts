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

// npc_hint は phase にしなくてもよい（表示テキストだけ持てばOK）
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

  // 追加：NPCの予告テキスト
  const [npcHintText, setNpcHintText] = useState<string | null>(null);

  // 追加：連打・二重送信防止（ready/round_resultで自動prepareするため）
  const preparedRef = useRef(false);

  const prepareRound = useCallback(() => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    // すでに予告済みなら送らない（hook側の自動呼び出しが重なるのを防ぐ）
    if (preparedRef.current) return;

    wsRef.current.send(JSON.stringify({ type: 'prepare_round' }));
    preparedRef.current = true;
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'ready':
          setPlayerHP(data.playerHP);
          setNpcHP(data.npcHP);
          setNpcInfo({
            charaName: data.npcCharaName || '???',
            charaRarity: data.npcCharaRarity || 'C',
            charaIconUrl: data.npcCharaIconURL,
            charaHp: data.npcCharaHP || 0,
            charaAtk: data.npcCharaATK || 0,
            charaTech: data.npcCharaTECH || 0,
            equipName: data.npcEquipName || '???',
            equipRarity: data.npcEquipRarity || 'C',
            equipIconUrl: data.npcEquipIconURL,
            equipHp: data.npcEquipHP || 0,
            equipAtk: data.npcEquipATK || 0,
            equipTech: data.npcEquipTECH || 0,
            specialType: SPECIAL_FROM_BACKEND[data.npcSpecialType] || 'G',
          });
          setPlayerBattleInfo({
            charaHp: data.playerCharaHP || 0,
            charaAtk: data.playerCharaATK || 0,
            charaTech: data.playerCharaTECH || 0,
            equipHp: data.playerEquipHP || 0,
            equipAtk: data.playerEquipATK || 0,
            equipTech: data.playerEquipTECH || 0,
          });

          // ready になったら次ラウンドの予告を自動要求
          setNpcHintText(null);
          preparedRef.current = false;
          setPhase('ready');

          // ★ここで自動prepare
          // setState後に送ってもOKなので即呼ぶ
          prepareRound();
          break;

        // 追加：NPCの予告テキスト受信
        case 'npc_hint':
          setNpcHintText(data.npcHandText || null);
          // phaseは変えない（UIは任意）。必要なら 'ready' のまま表示でOK
          break;

        case 'round_result':
          setPlayerHP(data.playerHP);
          setNpcHP(data.npcHP);
          setLastRound({
            playerHP: data.playerHP,
            npcHP: data.npcHP,
            npcHand: HAND_FROM_BACKEND[data.npcHand as BackendHand] || 'G',
          });

          // round が確定したので「次の予告」は未実施状態に戻す
          preparedRef.current = false;
          setNpcHintText(null);

          setPhase('round_result');

          // ★次ラウンドの予告を自動要求（アニメ後にしたいならBattle.tsx側で呼ぶ方式にする）
          // ここで先に予告を出してOKなら即prepare
          prepareRound();
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

          // 終了時は予告不要
          preparedRef.current = false;
          setNpcHintText(null);

          setPhase('game_over');
          break;

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
    },
    [prepareRound],
  );

  const connect = useCallback(() => {
    if (wsRef.current) return; // 既に接続中の場合はスキップ（StrictMode対策）
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const path = battleType === 'online' ? '/battle/online/ws' : '/battle/ws';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + path;

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
  }, [handleMessage, battleType]);

  const startBattle = useCallback((charaID: string, equipID: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // バトル開始時は状態を初期化
      setError(null);
      setLastRound(null);
      setGameOver(null);
      setNpcHintText(null);
      preparedRef.current = false;

      wsRef.current.send(
        JSON.stringify({
          type: 'start',
          charaID,
          equipID,
        }),
      );
    }
  }, []);

  const sendHand = useCallback((hand: FrontendHand) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // 手を送ったら予告は「消費済み」とみなす（次の予告はround_result後に行う）
      setNpcHintText(null);

      wsRef.current.send(
        JSON.stringify({
          type: 'round',
          hand: HAND_TO_BACKEND[hand],
        }),
      );
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
    playerBattleInfo,
    lastRound,
    gameOver,
    error,
    npcHintText, // 追加
    opponentDisconnected: phase === 'opponent_disconnected',
    connect,
    startBattle,
    prepareRound, // 追加（Battle.tsx側でアニメ後に呼びたい場合にも使える）
    sendHand,
    disconnect,
  };
}