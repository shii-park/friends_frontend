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

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ownedCharas, setOwnedCharas] = useState<Chara[]>([]);
  const [ownedEquips, setOwnedEquips] = useState<Equip[]>([]);
  const [gachaStones, setGachaStones] = useState<number>(0);
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
      console.error('Failed to fetch data:', error);
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
    // 現状はRPとコインの数値を更新するロジックをサーバー側に任せるため
    // データの再取得のみを行う
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
