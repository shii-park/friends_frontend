export type Rarity = 'C' | 'UC' | 'R' | 'SR' | 'SSR';

export interface Card {
  cardId: string;
  name: string;
  rarity: Rarity;
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
}
