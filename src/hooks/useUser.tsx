import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Chara, Equip } from '../types/game';
import { apiService } from '../services/api';

interface UserContextType {
  user: User | null;
  ownedCharas: Chara[];
  ownedEquips: Equip[];
  gachaStones: number;
  isLoading: boolean;
  login: (userName: string) => Promise<void>;
  updateStats: (rp: number, coin: number) => Promise<void>;
  drawGacha: (count: number) => Promise<(Chara | Equip)[]>;
  levelUpCard: (cardId: string, type: 'chara' | 'equip') => Promise<{ success: boolean, message?: string }>;
  fetchUserData: (userId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ownedCharas, setOwnedCharas] = useState<Chara[]>([]);
  const [ownedEquips, setOwnedEquips] = useState<Equip[]>([]);
  const [gachaStones, setGachaStones] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 初回読み込み（本来はログインチェックなどを行う）
  useEffect(() => {
    const init = async () => {
      // 開発用に固定のユーザーIDでデータを取得してみる
      await fetchUserData('dev-user');
      setIsLoading(false);
    };
    init();
  }, []);

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      const userData = await apiService.getUser(userId);
      const cardsData = await apiService.getOwnedCards(userId);
      
      setUser(userData);
      setOwnedCharas(cardsData.charas);
      setOwnedEquips(cardsData.equips);
      setGachaStones(cardsData.stones);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userName: string) => {
    setIsLoading(true);
    try {
      const newUser = await apiService.login(userName);
      setUser(newUser);
      // ログイン直後は初期データを取得
      const cardsData = await apiService.getOwnedCards(newUser.userId);
      setOwnedCharas(cardsData.charas);
      setOwnedEquips(cardsData.equips);
      setGachaStones(cardsData.stones);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = async (rp: number, coin: number) => {
    if (!user) return;
    // 本来はサーバーに送信
    // await apiService.updateBattleResult(user.userId, ...);
    setUser({ ...user, rp: user.rp + rp, coin: user.coin + coin });
  };

  const levelUpCard = async (cardId: string, type: 'chara' | 'equip') => {
    if (!user) return { success: false };
    
    setIsLoading(true);
    try {
      // 本来は apiService.levelUpCard(user.userId, cardId, type) を呼ぶ
      // ここでは以前のロジックを非同期に模倣
      const costs: Record<number, number> = {
        2: 100, 3: 200, 4: 300, 5: 400, 6: 500, 
        7: 600, 8: 700, 9: 800, 10: 10000
      };

      if (type === 'chara') {
        const charaIndex = ownedCharas.findIndex(c => c.cardId === cardId);
        if (charaIndex === -1) return { success: false, message: 'カードが見つかりません' };
        
        const chara = ownedCharas[charaIndex];
        if (chara.level >= 10) return { success: false, message: '最大レベルです' };

        const cost = costs[chara.level + 1];
        if (user.coin < cost) return { success: false, message: 'コインが足りません' };

        const nextLevel = chara.level + 1;
        const calc = (init: number, max: number) => Math.floor(init + (max - init) / 9 * (nextLevel - 1));

        const updatedChara: Chara = {
          ...chara,
          level: nextLevel,
          hp: calc(chara.initHp, chara.maxHp),
          atk: calc(chara.initAtk, chara.maxAtk),
          tech: calc(chara.initTech, chara.maxTech),
        };

        setOwnedCharas(prev => {
          const next = [...prev];
          next[charaIndex] = updatedChara;
          return next;
        });
        setUser({ ...user, coin: user.coin - cost });
        return { success: true };
      } else {
        const equipIndex = ownedEquips.findIndex(e => e.cardId === cardId);
        if (equipIndex === -1) return { success: false, message: '装備が見つかりません' };

        const equip = ownedEquips[equipIndex];
        if (equip.level >= 10) return { success: false, message: '最大レベルです' };

        const cost = costs[equip.level + 1];
        if (user.coin < cost) return { success: false, message: 'コインが足りません' };

        const nextLevel = equip.level + 1;
        const calc = (init: number, max: number) => Math.floor(init + (max - init) / 9 * (nextLevel - 1));

        const updatedEquip: Equip = {
          ...equip,
          level: nextLevel,
          bonusHp: calc(equip.initBonusHp, equip.maxBonusHp),
          bonusAtk: calc(equip.initBonusAtk, equip.maxBonusAtk),
          bonusTech: calc(equip.initBonusTech, equip.maxBonusTech),
        };

        setOwnedEquips(prev => {
          const next = [...prev];
          next[equipIndex] = updatedEquip;
          return next;
        });
        setUser({ ...user, coin: user.coin - cost });
        return { success: true };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const drawGacha = async (count: number): Promise<(Chara | Equip)[]> => {
    if (!user || gachaStones < count) return [];
    
    setIsLoading(true);
    try {
      const result = await apiService.drawGacha(user.userId, count);
      
      const newCharas = result.newItems.filter(item => 'charaId' in item) as Chara[];
      const newEquips = result.newItems.filter(item => 'equipId' in item) as Equip[];
      
      setOwnedCharas(prev => [...prev, ...newCharas]);
      setOwnedEquips(prev => [...prev, ...newEquips]);
      setGachaStones(result.remainingStones);

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
      login, updateStats, drawGacha, levelUpCard, fetchUserData 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
