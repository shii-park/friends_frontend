import type { User, Chara, Equip } from '../types/game';

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

  // ストレージ（所持カード）の取得
  getStorage: async (): Promise<{ charas: Chara[], equips: Equip[], stones: number }> => {
    return request<{ charas: Chara[], equips: Equip[], stones: number }>(`/storage`);
  },

  // ガチャのラインナップ取得
  getGachaLineup: async (): Promise<any> => {
    return request<any>(`/gacha/lineup`);
  },

  // ガチャを引く
  drawGacha: async (count: number): Promise<{ newItems: (Chara | Equip)[], remainingStones: number }> => {
    return request<{ newItems: (Chara | Equip)[], remainingStones: number }>(`/gacha/draw`, {
      method: 'POST',
      body: JSON.stringify({ count })
    });
  },

  // カードを強化する
  upgradeCard: async (cardId: string): Promise<{ success: boolean, updatedCard: Chara | Equip, newCoin: number }> => {
    return request<{ success: boolean, updatedCard: Chara | Equip, newCoin: number }>(`/card/${cardId}/upgrade`, {
      method: 'POST'
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
