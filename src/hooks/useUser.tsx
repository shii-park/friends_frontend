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
  const [user, setUser] = useState<User | null>(null);
  const [ownedCharas] = useState<Chara[]>([]);
  const [ownedEquips] = useState<Equip[]>([]);

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
