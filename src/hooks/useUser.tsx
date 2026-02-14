import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Chara, Equip } from '../types/game';

interface UserContextType {
  user: User | null;
  ownedCharas: Chara[];
  ownedEquips: Equip[];
  login: (userName: string) => void;
  updateStats: (rp: number, coin: number) => void;
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
    }
  ]);

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

    // 初期配布データのシミュレーション
    const initialChara: Chara = {
      cardId: 'c1',
      charaId: 'chara_001',
      name: '冒険者',
      rarity: 'C',
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

    const initialEquip: Equip = {
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
    };

    setOwnedCharas([initialChara]);
    setOwnedEquips([initialEquip]);
  };

  const updateStats = (rp: number, coin: number) => {
    if (user) {
      setUser({ ...user, rp: user.rp + rp, coin: user.coin + coin });
    }
  };

  return (
    <UserContext.Provider value={{ user, ownedCharas, ownedEquips, login, updateStats }}>
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
