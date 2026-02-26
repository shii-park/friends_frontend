import { Rarity } from './game';

export type CardState = 'notFound' | 'find' | 'get';

export interface CollectionEntry {
  card: {
    base: {
      cardID: string;
      cardName: string;
      cardIcon?: string;
      detail?: string;
      rarity: Rarity;
      cardKind: number; // 1: Chara, 0: Equip
      latestAcquiredDate: string;
    };
    character?: {
      charaID: string;
      initHP: number;
      initATK: number;
      initTECH: number;
      maxHP: number;
      maxATK: number;
      maxTECH: number;
      specialType: string;
    };
    equip?: {
      equipID: string;
      initBonusHP: number;
      initBonusATK: number;
      initBonusTECH: number;
      maxBonusHP: number;
      maxBonusATK: number;
      maxBonusTECH: number;
      buffEffect?: string;
    };
  };
  state: CardState;
  count: number;
}

export interface CollectionResponse {
  entries: CollectionEntry[];
  count: number;
}
