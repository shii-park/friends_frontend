export type Rarity = 'C' | 'UC' | 'R' | 'SR' | 'SSR';

export interface Card {
  cardId: string;
  name: string;
  rarity: Rarity;
  cardIconUrl?: string;
  acquiredDate: string; // yyyy-mm-dd-MM:SS
  level: number;
  exp: number;
}

export interface Chara extends Card {
  charaId: string;
  hp: number;
  atk: number;
  tech: number;
  initHp: number;
  initAtk: number;
  initTech: number;
  maxHp: number;
  maxAtk: number;
  maxTech: number;
  specialType: 'G' | 'C' | 'P'; // Rock, Paper, Scissors
}

export interface Equip extends Card {
  equipId: string;
  bonusHp: number;
  bonusAtk: number;
  bonusTech: number;
  initBonusHp: number;
  initBonusAtk: number;
  initBonusTech: number;
  maxBonusHp: number;
  maxBonusAtk: number;
  maxBonusTech: number;
  buffEffect?: string;
}

// バトル用の手マッピング
export type BackendHand = 'rock' | 'paper' | 'scissors';
export type FrontendHand = 'G' | 'C' | 'P';
export const HAND_TO_BACKEND: Record<FrontendHand, BackendHand> = { G: 'rock', C: 'scissors', P: 'paper' };
export const HAND_FROM_BACKEND: Record<BackendHand, FrontendHand> = { rock: 'G', scissors: 'C', paper: 'P' };
export const SPECIAL_FROM_BACKEND: Record<string, FrontendHand> = { rock: 'G', scissors: 'C', paper: 'P' };

export interface User {
  userId: string;
  userName: string;
  icon?: string;
  profileMsg?: string;
  birthday?: string; // mm-dd
  latestLoginDate: string;
  streakLogin: number;
  registeredDate: string;
  rp: number;
  coin: number;
  gachaStone: number;
}
