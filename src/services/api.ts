import { User, Chara, Equip } from '../types/game';

// 本来は .env などから取得する
const API_BASE_URL = 'http://localhost:3000/api';

// 擬似的な通信遅延を再現するユーティリティ
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // ユーザー情報の取得
  getUser: async (userId: string): Promise<User> => {
    await sleep(500);
    // モックデータを返す（実際は fetch(`${API_BASE_URL}/user/${userId}`)）
    return {
      userId,
      userName: '開発者ユーザー',
      latestLoginDate: new Date().toISOString(),
      registeredDate: new Date().toISOString(),
      streakLogin: 1,
      rp: 120,
      coin: 5000,
    };
  },

  // ログイン/登録
  login: async (userName: string): Promise<User> => {
    await sleep(800);
    return {
      userId: Math.random().toString(36).substring(2, 11),
      userName,
      latestLoginDate: new Date().toISOString(),
      registeredDate: new Date().toISOString(),
      streakLogin: 1,
      rp: 0,
      coin: 1000,
    };
  },

  // 所持カードの取得
  getOwnedCards: async (userId: string): Promise<{ charas: Chara[], equips: Equip[], stones: number }> => {
    await sleep(600);
    // 初期配布カードのモック
    return {
      charas: [
        {
          cardId: 'c1', charaId: 'chara_001', name: '冒険者', rarity: 'C',
          acquiredDate: new Date().toISOString(), level: 5, exp: 0,
          hp: 150, atk: 15, tech: 8, initHp: 100, initAtk: 10, initTech: 5,
          maxHp: 500, maxAtk: 50, maxTech: 30, specialType: 'G',
        }
      ],
      equips: [
        {
          cardId: 'e1', equipId: 'equip_001', name: '錆びた剣', rarity: 'C',
          acquiredDate: new Date().toISOString(), level: 1, exp: 0,
          bonusHp: 0, bonusAtk: 5, bonusTech: 0, initBonusHp: 0, initBonusAtk: 5, initBonusTech: 0,
          maxBonusHp: 100, maxBonusAtk: 50, maxBonusTech: 20,
        }
      ],
      stones: 50
    };
  },

  // ガチャを引く
  drawGacha: async (userId: string, count: number): Promise<{ newItems: (Chara | Equip)[], remainingStones: number }> => {
    await sleep(1500);
    // ここでバックエンドが抽選を行う想定
    const newItems: (Chara | Equip)[] = [];
    for (let i = 0; i < count; i++) {
      const rand = Math.random() * 100;
      const isChara = rand < 40;
      const rarity = Math.random() > 0.9 ? 'SR' : 'R'; // 簡易的な抽選
      
      if (isChara) {
        newItems.push({
          cardId: Math.random().toString(36).substring(2, 11),
          charaId: `chara_${rarity}_${Math.floor(Math.random() * 1000)}`,
          name: `${rarity}キャラクター`, rarity: rarity as any,
          acquiredDate: new Date().toISOString(), level: 1, exp: 0,
          hp: 100, atk: 10, tech: 5, initHp: 100, initAtk: 10, initTech: 5,
          maxHp: 500, maxAtk: 50, maxTech: 30, specialType: 'G',
        });
      } else {
        newItems.push({
          cardId: Math.random().toString(36).substring(2, 11),
          equipId: `equip_${rarity}_${Math.floor(Math.random() * 1000)}`,
          name: `${rarity}装備`, rarity: rarity as any,
          acquiredDate: new Date().toISOString(), level: 1, exp: 0,
          bonusHp: 5, bonusAtk: 5, bonusTech: 5, initBonusHp: 5, initBonusAtk: 5, initBonusTech: 5,
          maxBonusHp: 50, maxBonusAtk: 50, maxBonusTech: 50,
        });
      }
    }
    return { newItems, remainingStones: 50 - count }; // 実際はDBの値
  },

  // カード強化
  levelUpCard: async (userId: string, cardId: string, type: 'chara' | 'equip'): Promise<{ success: boolean, updatedCard: Chara | Equip, newCoin: number }> => {
    await sleep(1000);
    // 本来はサーバー側で計算して結果を返す
    return {
      success: true,
      updatedCard: {} as any, // 簡略化
      newCoin: 4000
    };
  },

  // バトル結果の送信
  updateBattleResult: async (userId: string, result: 'win' | 'lose'): Promise<{ rp: number, coin: number, stones: number }> => {
    await sleep(800);
    return {
      rp: result === 'win' ? 20 : 5,
      coin: result === 'win' ? 100 : 20,
      stones: result === 'win' ? 1 : 0
    };
  }
};
