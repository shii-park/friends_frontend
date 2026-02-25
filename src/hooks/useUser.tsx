import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Chara, Equip } from '../types/game';
import { apiService } from '../services/api';

interface UserContextType {
  user: User | null;
  ownedCharas: Chara[];
  ownedEquips: Equip[];
  gachaStones: number;
  isLoading: boolean;
  register: (userName: string) => Promise<void>;
  login: (userName: string) => Promise<void>;
  updateStats: (rp: number, coin: number) => Promise<void>;
  refreshUserData: () => Promise<void>;
  drawGacha: (count: number) => Promise<(Chara | Equip)[]>;
  levelUpCard: (cardId: string, type: 'chara' | 'equip') => Promise<{ success: boolean, message?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 開発用のリッチなダミーデータ
const MOCK_USER: User = {
  userId: 'dev-user-001',
  userName: '伝説の勇者',
  latestLoginDate: new Date().toISOString(),
  registeredDate: new Date().toISOString(),
  streakLogin: 15,
  rp: 1250, // ランクS
  coin: 50000,
};

const MOCK_CHARAS: Chara[] = [
  {
    cardId: 'c-ssr-1', charaId: 'chara_ssr_01', name: '聖騎士アーサー', rarity: 'SSR',
    acquiredDate: '2026-02-01', level: 10, exp: 0,
    hp: 850, atk: 95, tech: 60, initHp: 300, initAtk: 40, initTech: 20,
    maxHp: 1000, maxAtk: 120, maxTech: 80, specialType: 'G',
  },
  {
    cardId: 'c-sr-1', charaId: 'chara_sr_01', name: '氷の魔術師', rarity: 'SR',
    acquiredDate: '2026-02-05', level: 8, exp: 0,
    hp: 450, atk: 75, tech: 90, initHp: 200, initAtk: 30, initTech: 40,
    maxHp: 600, maxAtk: 80, maxTech: 100, specialType: 'C',
  },
  {
    cardId: 'c-sr-2', charaId: 'chara_sr_02', name: '疾風の暗殺者', rarity: 'SR',
    acquiredDate: '2026-02-10', level: 5, exp: 0,
    hp: 400, atk: 85, tech: 50, initHp: 180, initAtk: 35, initTech: 25,
    maxHp: 550, maxAtk: 95, maxTech: 70, specialType: 'P',
  },
  {
    cardId: 'c-r-1', charaId: 'chara_r_01', name: '重戦士', rarity: 'R',
    acquiredDate: '2026-02-15', level: 4, exp: 0,
    hp: 500, atk: 40, tech: 10, initHp: 250, initAtk: 20, initTech: 5,
    maxHp: 700, maxAtk: 60, maxTech: 30, specialType: 'G',
  },
  {
    cardId: 'c-uc-1', charaId: 'chara_uc_01', name: '見習い剣士', rarity: 'UC',
    acquiredDate: '2026-02-20', level: 3, exp: 0,
    hp: 200, atk: 25, tech: 15, initHp: 120, initAtk: 15, initTech: 8,
    maxHp: 400, maxAtk: 45, maxTech: 35, specialType: 'C',
  },
  {
    cardId: 'c-c-1', charaId: 'chara_c_01', name: '村人A', rarity: 'C',
    acquiredDate: '2026-02-25', level: 1, exp: 0,
    hp: 100, atk: 10, tech: 5, initHp: 100, initAtk: 10, initTech: 5,
    maxHp: 300, maxAtk: 30, maxTech: 20, specialType: 'P',
  }
];

const MOCK_EQUIPS: Equip[] = [
  {
    cardId: 'e-ssr-1', equipId: 'equip_ssr_01', name: 'エクスカリバー', rarity: 'SSR',
    acquiredDate: '2026-02-01', level: 5, exp: 0,
    bonusHp: 100, bonusAtk: 150, bonusTech: 50, initBonusHp: 20, initBonusAtk: 30, initBonusTech: 10,
    maxBonusHp: 200, maxBonusAtk: 300, maxBonusTech: 100, buffEffect: '全ステータス大幅アップ',
  },
  {
    cardId: 'e-sr-1', equipId: 'equip_sr_01', name: '知恵の杖', rarity: 'SR',
    acquiredDate: '2026-02-05', level: 7, exp: 0,
    bonusHp: 20, bonusAtk: 10, bonusTech: 120, initBonusHp: 5, initBonusAtk: 2, initBonusTech: 30,
    maxBonusHp: 50, maxBonusAtk: 20, maxBonusTech: 180, buffEffect: '必殺攻撃力アップ',
  },
  {
    cardId: 'e-r-1', equipId: 'equip_r_01', name: '鋼の盾', rarity: 'R',
    acquiredDate: '2026-02-15', level: 3, exp: 0,
    bonusHp: 200, bonusAtk: 0, bonusTech: 0, initBonusHp: 50, initBonusAtk: 0, initBonusTech: 0,
    maxBonusHp: 400, maxBonusAtk: 10, maxBonusTech: 10, buffEffect: '体力アップ',
  }
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(MOCK_USER); // 初期値をダミーに設定
  const [ownedCharas, setOwnedCharas] = useState<Chara[]>(MOCK_CHARAS);
  const [ownedEquips, setOwnedEquips] = useState<Equip[]>(MOCK_EQUIPS);
  const [gachaStones, setGachaStones] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAllData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [userData, storageData] = await Promise.all([
        apiService.getUser(userId),
        apiService.getStorage()
      ]);
      setUser(userData);
      setOwnedCharas(storageData.charas);
      setOwnedEquips(storageData.equips);
      setGachaStones(storageData.stones);
    } catch (error) {
      console.error('Failed to fetch data, using mock data:', error);
      // 通信失敗時はダミーデータのままにする
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      fetchAllData(savedUserId);
    }
  }, []);

  const register = async (userName: string) => {
    setIsLoading(true);
    try {
      const registeredUser = await apiService.register(userName);
      localStorage.setItem('userId', registeredUser.userId);
      await fetchAllData(registeredUser.userId);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userName: string) => {
    setIsLoading(true);
    try {
      const currentUserId = user?.userId || localStorage.getItem('userId') || 'dev-user';
      const updatedUser = await apiService.updateUser(currentUserId, userName);
      localStorage.setItem('userId', updatedUser.userId);
      await fetchAllData(updatedUser.userId);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    const currentUserId = user?.userId || localStorage.getItem('userId');
    if (currentUserId) {
      await fetchAllData(currentUserId);
    }
  };

  const updateStats = async (_rp: number, _coin: number) => {
    await refreshUserData();
  };

  const levelUpCard = async (cardId: string, _type: 'chara' | 'equip') => {
    setIsLoading(true);
    try {
      const result = await apiService.upgradeCard(cardId);
      if (result.success) {
        await refreshUserData();
        return { success: true };
      }
      return { success: false, message: '強化に失敗しました' };
    } catch (error: any) {
      // 開発用：APIが失敗してもローカルで数値をいじる場合はここに書く
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const drawGacha = async (count: number): Promise<(Chara | Equip)[]> => {
    setIsLoading(true);
    try {
      const result = await apiService.drawGacha(count);
      await refreshUserData(); 
      return result.newItems;
    } catch (error) {
      console.error('Gacha failed:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, ownedCharas, ownedEquips, gachaStones, isLoading, 
      register, login, updateStats, refreshUserData, drawGacha, levelUpCard 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
};
