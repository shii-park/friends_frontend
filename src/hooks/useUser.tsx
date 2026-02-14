import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Chara, Equip } from '../types/game';

interface UserContextType {
  user: User | null;
  ownedCharas: Chara[];
  ownedEquips: Equip[];
  gachaStones: number;
  login: (userName: string) => void;
  updateStats: (rp: number, coin: number) => void;
  drawGacha: (count: number) => (Chara | Equip)[];
  levelUpCard: (cardId: string, type: 'chara' | 'equip') => { success: boolean, message?: string };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 開発用に初期状態でモックデータをセット
  const [user, setUser] = useState<User | null>({
    userId: 'dev-user',
    userName: '開発者ユーザー',
    latestLoginDate: new Date().toISOString(),
    registeredDate: new Date().toISOString(),
    streakLogin: 1,
    rp: 120,
    coin: 5000,
  });

  const [ownedCharas, setOwnedCharas] = useState<Chara[]>([
    {
      cardId: 'c1',
      charaId: 'chara_001',
      name: '冒険者',
      rarity: 'C',
      acquiredDate: new Date().toISOString(),
      level: 5,
      exp: 0,
      hp: 150,
      atk: 15,
      tech: 8,
      initHp: 100,
      initAtk: 10,
      initTech: 5,
      maxHp: 500,
      maxAtk: 50,
      maxTech: 30,
      specialType: 'G',
    },
    {
      cardId: 'c_uc',
      charaId: 'chara_003',
      name: '見習い騎士',
      rarity: 'UC',
      acquiredDate: new Date().toISOString(),
      level: 1,
      exp: 0,
      hp: 120,
      atk: 18,
      tech: 10,
      initHp: 120,
      initAtk: 18,
      initTech: 10,
      maxHp: 600,
      maxAtk: 80,
      maxTech: 50,
      specialType: 'G',
    },
    {
      cardId: 'c2',
      charaId: 'chara_002',
      name: '魔法使い',
      rarity: 'R',
      acquiredDate: new Date().toISOString(),
      level: 1,
      exp: 0,
      hp: 80,
      atk: 25,
      tech: 20,
      initHp: 80,
      initAtk: 25,
      initTech: 20,
      maxHp: 400,
      maxAtk: 100,
      maxTech: 80,
      specialType: 'C',
    },
    {
      cardId: 'c_sr',
      charaId: 'chara_004',
      name: '暗殺者',
      rarity: 'SR',
      acquiredDate: new Date().toISOString(),
      level: 1,
      exp: 0,
      hp: 100,
      atk: 45,
      tech: 35,
      initHp: 100,
      initAtk: 45,
      initTech: 35,
      maxHp: 550,
      maxAtk: 180,
      maxTech: 150,
      specialType: 'C',
    },
    {
      cardId: 'c_ssr',
      charaId: 'chara_005',
      name: '聖騎士',
      rarity: 'SSR',
      acquiredDate: new Date().toISOString(),
      level: 1,
      exp: 0,
      hp: 250,
      atk: 60,
      tech: 40,
      initHp: 250,
      initAtk: 60,
      initTech: 40,
      maxHp: 1200,
      maxAtk: 250,
      maxTech: 180,
      specialType: 'P',
    }
  ]);

  const [ownedEquips, setOwnedEquips] = useState<Equip[]>([
    {
      cardId: 'e1',
      equipId: 'equip_001',
      name: '錆びた剣',
      rarity: 'C',
      acquiredDate: new Date().toISOString(),
      level: 1,
      exp: 0,
      bonusHp: 0,
      bonusAtk: 5,
      bonusTech: 0,
      initBonusHp: 0,
      initBonusAtk: 5,
      initBonusTech: 0,
      maxBonusHp: 100,
      maxBonusAtk: 50,
      maxBonusTech: 20,
    },
    {
      cardId: 'e_uc',
      equipId: 'equip_003',
      name: '鉄の盾',
      rarity: 'UC',
      acquiredDate: new Date().toISOString(),
      level: 1,
      exp: 0,
      bonusHp: 20,
      bonusAtk: 0,
      bonusTech: 0,
      initBonusHp: 20,
      initBonusAtk: 0,
      initBonusTech: 0,
      maxBonusHp: 200,
      maxBonusAtk: 20,
      maxBonusTech: 10,
    },
    {
      cardId: 'e_r',
      equipId: 'equip_004',
      name: '銀のナイフ',
      rarity: 'R',
      acquiredDate: new Date().toISOString(),
      level: 1,
      exp: 0,
      bonusHp: 0,
      bonusAtk: 15,
      bonusTech: 10,
      initBonusHp: 0,
      initBonusAtk: 15,
      initBonusTech: 10,
      maxBonusHp: 50,
      maxBonusAtk: 100,
      maxBonusTech: 80,
    },
    {
      cardId: 'e2',
      equipId: 'equip_002',
      name: '魔力の杖',
      rarity: 'SR',
      acquiredDate: new Date().toISOString(),
      level: 3,
      exp: 0,
      bonusHp: 10,
      bonusAtk: 0,
      bonusTech: 15,
      initBonusHp: 5,
      initBonusAtk: 0,
      initBonusTech: 10,
      maxBonusHp: 100,
      maxBonusAtk: 20,
      maxBonusTech: 80,
    },
    {
      cardId: 'e_ssr',
      equipId: 'equip_005',
      name: '竜殺しの槍',
      rarity: 'SSR',
      acquiredDate: new Date().toISOString(),
      level: 1,
      exp: 0,
      bonusHp: 50,
      bonusAtk: 80,
      bonusTech: 30,
      initBonusHp: 50,
      initBonusAtk: 80,
      initBonusTech: 30,
      maxBonusHp: 500,
      maxBonusAtk: 400,
      maxBonusTech: 200,
    }
  ]);

  const [gachaStones, setGachaStones] = useState<number>(50);

  const login = (userName: string) => {
    const newUser: User = {
      userId: Math.random().toString(36).substring(2, 11),
      userName: userName,
      latestLoginDate: new Date().toISOString(),
      registeredDate: new Date().toISOString(),
      streakLogin: 1,
      rp: 0,
      coin: 1000,
    };
    setUser(newUser);
  };

  const updateStats = (rp: number, coin: number) => {
    if (user) {
      setUser({ ...user, rp: user.rp + rp, coin: user.coin + coin });
    }
  };

  const levelUpCard = (cardId: string, type: 'chara' | 'equip') => {
    if (!user) return { success: false };

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

      // ステータス計算
      const nextLevel = chara.level + 1;
      const calc = (init: number, max: number) => Math.floor(init + (max - init) / 9 * (nextLevel - 1));

      const updatedChara: Chara = {
        ...chara,
        level: nextLevel,
        hp: calc(chara.initHp, chara.maxHp),
        atk: calc(chara.initAtk, chara.maxAtk),
        tech: calc(chara.initTech, chara.maxTech),
      };

      const newCharas = [...ownedCharas];
      newCharas[charaIndex] = updatedChara;
      setOwnedCharas(newCharas);
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

      const newEquips = [...ownedEquips];
      newEquips[equipIndex] = updatedEquip;
      setOwnedEquips(newEquips);
      setUser({ ...user, coin: user.coin - cost });
      return { success: true };
    }
  };

  const drawGacha = (count: number): (Chara | Equip)[] => {
    if (gachaStones < count) return [];
    
    setGachaStones(prev => prev - count);
    const newItems: (Chara | Equip)[] = [];

    for (let i = 0; i < count; i++) {
      const rand = Math.random() * 100;
      const isChara = rand < 40; // キャラ40%, 装備60%
      const subRand = Math.random() * 100;
      
      let rarity: 'C' | 'UC' | 'R' | 'SR' | 'SSR' = 'C';
      if (subRand < 1.25) rarity = 'SSR';
      else if (subRand < 3.75) rarity = 'SR';
      else if (subRand < 8.75) rarity = 'R';
      else if (subRand < 18.75) rarity = 'UC';

      if (isChara) {
        const chara: Chara = {
          cardId: Math.random().toString(36).substring(2, 11),
          charaId: `chara_${rarity}_${Math.floor(Math.random() * 1000)}`,
          name: `${rarity}キャラクター`,
          rarity,
          acquiredDate: new Date().toISOString(),
          level: 1,
          exp: 0,
          hp: 100,
          atk: 10,
          tech: 5,
          initHp: 100,
          initAtk: 10,
          initTech: 5,
          maxHp: 500,
          maxAtk: 50,
          maxTech: 30,
          specialType: 'G',
        };
        newItems.push(chara);
      } else {
        const equip: Equip = {
          cardId: Math.random().toString(36).substring(2, 11),
          equipId: `equip_${rarity}_${Math.floor(Math.random() * 1000)}`,
          name: `${rarity}装備`,
          rarity,
          acquiredDate: new Date().toISOString(),
          level: 1,
          exp: 0,
          bonusHp: 5,
          bonusAtk: 5,
          bonusTech: 5,
          initBonusHp: 5,
          initBonusAtk: 5,
          initBonusTech: 5,
          maxBonusHp: 50,
          maxBonusAtk: 50,
          maxBonusTech: 50,
        };
        newItems.push(equip);
      }
    }

    // 所持品に追加
    const newCharas = newItems.filter(item => 'charaId' in item) as Chara[];
    const newEquips = newItems.filter(item => 'equipId' in item) as Equip[];
    
    setOwnedCharas(prev => [...prev, ...newCharas]);
    setOwnedEquips(prev => [...prev, ...newEquips]);

    return newItems;
  };

  return (
    <UserContext.Provider value={{ user, ownedCharas, ownedEquips, gachaStones, login, updateStats, drawGacha, levelUpCard }}>
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
