import type { User, Chara, Equip, Rarity } from '../types/game';
import { SPECIAL_FROM_BACKEND } from '../types/game';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://friends-app-backend.gentlecoast-82b23d45.japanwest.azurecontainerapps.io';

/**
 * セッションベースの認証に対応するため、credentials: 'include' を設定した共通リクエスト関数
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // クッキー（セッション）を送信・受信するために必須
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  // レスポンスが空の場合は null を返す
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// --- バックエンドのレスポンス型 ---

interface BackendCardMaster {
  cardID: number;
  cardName: string;
  cardKind: number; // 0=equip, 1=character
  rarity: Rarity;
  cardIconURL: string;
}

interface BackendCharacterDetail {
  characterID: string;
  hp: number;
  atk: number;
  tech: number;
  initHP: number;
  initATK: number;
  initTECH: number;
  maxHP: number;
  maxATK: number;
  maxTECH: number;
  specialType: string; // "rock" | "paper" | "scissors"
}

interface BackendEquipmentDetail {
  equipmentID: string;
  bonusHP: number;
  bonusATK: number;
  bonusTECH: number;
  initBonusHP: number;
  initBonusATK: number;
  initBonusTECH: number;
  maxBonusHP: number;
  maxBonusATK: number;
  maxBonusTECH: number;
  buffEffect?: string;
}

interface BackendCardInstanceDetail {
  instanceID: string;
  level: number;
  card: BackendCardMaster;
  character?: BackendCharacterDetail;
  equipment?: BackendEquipmentDetail;
}

interface BackendDrawResult {
  instanceID: string;
  cardID: number;
  kind: string;
  rarity: string;
  isPickup: boolean;
}

interface BackendCollectionEntry {
  card: {
    base: {
      cardID: string;
      cardName: string;
      cardIcon?: string;
      detail?: string;
      rarity: Rarity;
      cardKind: number;
      latestAcquiredDate: string;
    };
    character?: BackendCharacterDetail;
    equip?: BackendEquipmentDetail;
  };
  state: 'notFound' | 'find' | 'get';
  count: number;
}

interface BackendCollectionResponse {
  entries: BackendCollectionEntry[];
  count: number;
}

// --- 変換関数 ---

function mapToChara(item: BackendCardInstanceDetail): Chara {
  const ch = item.character!;
  return {
    cardId: item.instanceID,
    name: item.card.cardName,
    rarity: item.card.rarity as Rarity,
    cardIconUrl: item.card.cardIconURL,
    acquiredDate: '',
    level: item.level,
    exp: 0,
    charaId: ch.characterID,
    hp: ch.hp,
    atk: ch.atk,
    tech: ch.tech,
    initHp: ch.initHP,
    initAtk: ch.initATK,
    initTech: ch.initTECH,
    maxHp: ch.maxHP,
    maxAtk: ch.maxATK,
    maxTech: ch.maxTECH,
    specialType: SPECIAL_FROM_BACKEND[ch.specialType] || 'G',
  };
}

function mapToEquip(item: BackendCardInstanceDetail): Equip {
  const eq = item.equipment!;
  return {
    cardId: item.instanceID,
    name: item.card.cardName,
    rarity: item.card.rarity as Rarity,
    cardIconUrl: item.card.cardIconURL,
    acquiredDate: '',
    level: item.level,
    exp: 0,
    equipId: eq.equipmentID,
    bonusHp: eq.bonusHP,
    bonusAtk: eq.bonusATK,
    bonusTech: eq.bonusTECH,
    initBonusHp: eq.initBonusHP,
    initBonusAtk: eq.initBonusATK,
    initBonusTech: eq.initBonusTECH,
    maxBonusHp: eq.maxBonusHP,
    maxBonusAtk: eq.maxBonusATK,
    maxBonusTech: eq.maxBonusTECH,
    buffEffect: eq.buffEffect,
  };
}

export const apiService = {
  // 疎通確認
  ping: async (): Promise<string> => {
    const res = await fetch(`${BASE_URL}/ping`, { credentials: 'include' });
    return res.text();
  },

  // ユーザー登録
  register: async (userName: string): Promise<User> => {
    return request<User>(`/register`, {
      method: 'POST',
      body: JSON.stringify({ userName })
    });
  },

  // ユーザー情報の取得
  getUser: async (userId: string): Promise<User> => {
    return request<User>(`/user/${userId}/get`);
  },

  // ユーザー名の更新
  updateUser: async (userId: string, userName: string): Promise<User> => {
    return request<User>(`/user/${userId}/update`, {
      method: 'PUT',
      body: JSON.stringify({ userName })
    });
  },

  // ストレージ（所持カード詳細）の取得
  getStorage: async (): Promise<{ charas: Chara[], equips: Equip[] }> => {
    const data = await request<BackendCardInstanceDetail[]>(`/storage/detail`);
    const charas: Chara[] = [];
    const equips: Equip[] = [];
    for (const item of data) {
      if (item.character) {
        charas.push(mapToChara(item));
      } else if (item.equipment) {
        equips.push(mapToEquip(item));
      }
    }
    return { charas, equips };
  },

  // 図鑑データの取得
  getCollection: async (): Promise<BackendCollectionResponse> => {
    return request<BackendCollectionResponse>(`/collection`);
  },

  // ガチャのラインナップ取得
  getGachaLineup: async (): Promise<any> => {
    return request<any>(`/gacha/lineup`);
  },

  // ガチャを引く（instanceIDリストと残り石数を返す）
  drawGacha: async (count: number): Promise<{ newInstanceIDs: string[], remainingStones: number }> => {
    const res = await request<{ gachaStone: number, results: BackendDrawResult[] }>(`/gacha/draw`, {
      method: 'POST',
      body: JSON.stringify({ count })
    });
    return {
      newInstanceIDs: res.results.map(r => r.instanceID),
      remainingStones: res.gachaStone,
    };
  },

  // カードを強化する
  upgradeCard: async (instanceID: string): Promise<{ newLevel: number, cost: number }> => {
    return request<{ newLevel: number, cost: number }>(`/card/${instanceID}/enhancement`, {
      method: 'POST',
      body: JSON.stringify({ times: 1 })
    });
  },

  // ユーザー情報を削除
  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      await request<void>(`/user/${userId}/delete`, {
        method: 'DELETE'
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
