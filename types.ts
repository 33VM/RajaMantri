export enum Role {
  RAJA = 'RAJA',
  MANTRI = 'MANTRI',
  CHOR = 'CHOR',
  SIPAHI = 'SIPAHI',
}

export interface Player {
  id: string; // Peer ID
  name: string;
  role: Role | null;
  score: number;
  avatarSeed: string;
  isHost: boolean;
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  REVEAL = 'REVEAL',
  GUESS = 'GUESS',
  RESULT = 'RESULT',
}

export const POINTS = {
  [Role.RAJA]: 1000,
  [Role.SIPAHI]: 500,
  [Role.MANTRI]: 800,
  [Role.CHOR]: 0,
};

// Network Types
export type MessageType = 
  | 'JOIN' 
  | 'PLAYER_UPDATE' 
  | 'START_GAME' 
  | 'STATE_UPDATE' 
  | 'GUESS' 
  | 'RESTART';

export interface NetworkMessage {
  type: MessageType;
  payload?: any;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  mantriId: string;
  commentary: string;
  winner: Role | null;
  winnerName?: string;
}