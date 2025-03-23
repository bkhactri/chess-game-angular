export type Player = 'white' | 'black';

export type OnlineGameStatus = 'waiting' | 'playing' | 'end';

export type OnlineGameState = {
  fen: string;
  whitePlayerId: string;
  blackPlayerId: string | null;
  lastMove: string | null;
  winner?: string;
  status: OnlineGameStatus;
  isWhitePlayerTurn: boolean;
};

export type JoinGameResult = {
  localTurn: Player;
  competitorId: string;
  isWhitePlayerTurn: boolean;
};
