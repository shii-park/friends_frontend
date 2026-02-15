import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Chara, Equip, Rarity } from '../types/game';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 擬似的な通信遅延
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ownedCharas, setOwnedCharas] = useState<Chara[]>([]);
  const [ownedEquips, setOwnedEquips] = useState<Equip[]>([]);
  const [gachaStones, setGachaStones] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 初期化
  useEffect(() => {
    setUser({
      userId: 'dev-user',
      userName: '開発者ユーザー',
      latestLoginDate: new Date().toISOString(),
      registeredDate: new Date().toISOString(),
      streakLogin: 1,
      rp: 120,
      coin: 5000,
    });
    setOwnedCharas([
      {
        cardId: 'c1', charaId: 'chara_001', name: '冒険者', rarity: 'C',
        acquiredDate: new Date().toISOString(), level: 5, exp: 0,
        hp: 150, atk: 15, tech: 8, initHp: 100, initAtk: 10, initTech: 5,
        maxHp: 500, maxAtk: 50, maxTech: 30, specialType: 'G',
      }
    ]);
    setOwnedEquips([
      {
        cardId: 'e1', equipId: 'equip_001', name: '錆びた剣', rarity: 'C',
        acquiredDate: new Date().toISOString(), level: 1, exp: 0,
        bonusHp: 0, bonusAtk: 5, bonusTech: 0, initBonusHp: 0, initBonusAtk: 5, initBonusTech: 0,
        maxBonusHp: 100, maxBonusAtk: 50, maxBonusTech: 20,
      }
    ]);
  }, []);

  const login = async (userName: string) => {
    setIsLoading(true);
    await sleep(800);
    const newUser: User = {
      userId: Math.random().toString(36).substring(2, 11),
      userName,
      latestLoginDate: new Date().toISOString(),
      registeredDate: new Date().toISOString(),
      streakLogin: 1,
      rp: 0,
      coin: 1000,
    };
    setUser(newUser);
    setIsLoading(false);
  };

  const updateStats = async (rp: number, coin: number) => {
    if (user) {
      setUser({ ...user, rp: user.rp + rp, coin: user.coin + coin });
    }
  };

  const levelUpCard = async (cardId: string, type: 'chara' | 'equip') => {
    if (!user) return { success: false };
    setIsLoading(true);
    await sleep(1000);

    const costs: Record<number, number> = {
      2: 100, 3: 200, 4: 300, 5: 400, 6: 500, 
      7: 600, 8: 700, 9: 800, 10: 10000
    };

    if (type === 'chara') {
      const charaIndex = ownedCharas.findIndex(c => c.cardId === cardId);
      if (charaIndex === -1) { setIsLoading(false); return { success: false, message: 'カードが見つかりません' }; }
      const chara = ownedCharas[charaIndex];
      const cost = costs[chara.level + 1];
      if (user.coin < cost) { setIsLoading(false); return { success: false, message: 'コインが足りません' }; }

      const nextLevel = chara.level + 1;
      const calc = (init: number, max: number) => Math.floor(init + (max - init) / 9 * (nextLevel - 1));
      const updatedChara: Chara = {
        ...chara, level: nextLevel,
        hp: calc(chara.initHp, chara.maxHp),
        atk: calc(chara.initAtk, chara.maxAtk),
        tech: calc(chara.initTech, chara.maxTech),
      };
      setOwnedCharas(prev => { const n = [...prev]; n[charaIndex] = updatedChara; return n; });
      setUser({ ...user, coin: user.coin - cost });
    } else {
      const equipIndex = ownedEquips.findIndex(e => e.cardId === cardId);
      if (equipIndex === -1) { setIsLoading(false); return { success: false, message: '装備が見つかりません' }; }
      const equip = ownedEquips[equipIndex];
      const cost = costs[equip.level + 1];
      if (user.coin < cost) { setIsLoading(false); return { success: false, message: 'コインが足りません' }; }

      const nextLevel = equip.level + 1;
      const calc = (init: number, max: number) => Math.floor(init + (max - init) / 9 * (nextLevel - 1));
      const updatedEquip: Equip = {
        ...equip, level: nextLevel,
        bonusHp: calc(equip.initBonusHp, equip.maxBonusHp),
        bonusAtk: calc(equip.initBonusAtk, equip.maxBonusAtk),
        bonusTech: calc(equip.initBonusTech, equip.maxBonusTech),
      };
      setOwnedEquips(prev => { const n = [...prev]; n[equipIndex] = updatedEquip; return n; });
      setUser({ ...user, coin: user.coin - cost });
    }
    setIsLoading(false);
    return { success: true };
  };

  const drawGacha = async (count: number): Promise<(Chara | Equip)[]> => {
    if (gachaStones < count) return [];
    setIsLoading(true);
    await sleep(1500);
    setGachaStones(prev => prev - count);
    const newItems: (Chara | Equip)[] = [];

    const rarities: { rarity: Rarity; weight: number }[] = [
      { rarity: 'SSR', weight: 1.5 },
      { rarity: 'SR', weight: 4.5 },
      { rarity: 'R', weight: 10 },
      { rarity: 'UC', weight: 24 },
      { rarity: 'C', weight: 60 },
    ];

    for (let i = 0; i < count; i++) {
      const isChara = Math.random() < 0.5;
      const rand = Math.random() * 100;
      let cumulative = 0;
      let selectedRarity: Rarity = 'C';

      for (const r of rarities) {
        cumulative += r.weight;
        if (rand <= cumulative) {
          selectedRarity = r.rarity;
          break;
        }
      }

      const cardId = Math.random().toString(36).substring(2, 11);
      
      if (isChara) {
        newItems.push({
          cardId,
          charaId: `chara_${selectedRarity}_${cardId}`,
          name: `${selectedRarity} キャラクター`,
          rarity: selectedRarity,
          acquiredDate: new Date().toISOString(),
          level: 1, exp: 0,
          hp: 100, atk: 10, tech: 5,
          initHp: 100, initAtk: 10, initTech: 5,
          maxHp: 500, maxAtk: 50, maxTech: 30,
          specialType: (['G', 'C', 'P'] as const)[Math.floor(Math.random() * 3)],
        });
      } else {
        newItems.push({
          cardId,
          equipId: `equip_${selectedRarity}_${cardId}`,
          name: `${selectedRarity} 装備`,
          rarity: selectedRarity,
          acquiredDate: new Date().toISOString(),
          level: 1, exp: 0,
          bonusHp: 10, bonusAtk: 5, bonusTech: 2,
          initBonusHp: 10, initBonusAtk: 5, initBonusTech: 2,
          maxBonusHp: 100, maxBonusAtk: 50, maxBonusTech: 20,
        });
      }
    }

    const newCharas = newItems.filter(i => 'charaId' in i) as Chara[];
    const newEquips = newItems.filter(i => 'equipId' in i) as Equip[];
    setOwnedCharas(prev => [...prev, ...newCharas]);
    setOwnedEquips(prev => [...prev, ...newEquips]);
    
    setIsLoading(false);
    return newItems;
  };

  return (
    <UserContext.Provider value={{ user, ownedCharas, ownedEquips, gachaStones, isLoading, login, updateStats, drawGacha, levelUpCard }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
};
