import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { lastValueFrom, Observable } from 'rxjs';
import { JoinGameResult, OnlineGameState, Player } from '../types/game.type';

@Injectable({
  providedIn: 'root',
})
export class OnlineOperationService {
  private ONLINE_GAME_CODE_KEY = 'online_game_code_current';
  private GAME_FIREBASE_COLLECTION = 'games';

  constructor(private firestore: AngularFirestore) {}

  async handleCreateGame(playerId: string): Promise<string> {
    const gameCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    if (!playerId) {
      alert('Player id not found, please reload the page');
    }

    const gameState: OnlineGameState = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      isWhitePlayerTurn: true,
      whitePlayerId: playerId as string,
      blackPlayerId: null,
      lastMove: null,
      status: 'waiting',
    };

    await this.firestore
      .collection(this.GAME_FIREBASE_COLLECTION)
      .doc(gameCode)
      .set(gameState);

    localStorage.setItem(this.ONLINE_GAME_CODE_KEY, gameCode);

    return gameCode;
  }

  async joinGame(gameCode: string, playerId: string): Promise<JoinGameResult> {
    const result: JoinGameResult = {
      localTurn: 'white',
      competitorId: '',
      isWhitePlayerTurn: true,
    };

    const gameDoc = this.firestore
      .collection(this.GAME_FIREBASE_COLLECTION)
      .doc<OnlineGameState>(gameCode);
    const gameRef = await lastValueFrom(gameDoc.get());

    if (!gameRef.exists) {
      alert('Game not found!');
    }

    const gameState = gameRef.data();

    if (
      gameState?.status === 'playing' &&
      gameState.blackPlayerId &&
      gameState.whitePlayerId
    ) {
      alert('This game room is full, try again later');
    }

    if (gameState?.whitePlayerId) {
      result.competitorId = gameState.whitePlayerId;
      result.localTurn = 'black';
      await gameDoc.update({ blackPlayerId: playerId, status: 'playing' });
    }

    if (gameState?.blackPlayerId) {
      result.competitorId = gameState.blackPlayerId;
      result.localTurn = 'white';
      await gameDoc.update({ whitePlayerId: playerId, status: 'playing' });
    }

    result.isWhitePlayerTurn = !!gameState?.isWhitePlayerTurn;
    localStorage.setItem(this.ONLINE_GAME_CODE_KEY, gameCode);

    return result;
  }

  async getGameState(gameCode: string): Promise<OnlineGameState> {
    const gameDoc = this.firestore
      .collection(this.GAME_FIREBASE_COLLECTION)
      .doc<OnlineGameState>(gameCode);
    const gameRef = await lastValueFrom(gameDoc.get());

    return gameRef.data() as OnlineGameState;
  }

  async updateGameMoves(
    gameCode: string,
    gameState: OnlineGameState
  ): Promise<void> {
    return this.firestore
      .collection(this.GAME_FIREBASE_COLLECTION)
      .doc(gameCode)
      .update(gameState);
  }

  listenGameUpdates(gameCode: string): Observable<OnlineGameState> {
    return this.firestore
      .collection(this.GAME_FIREBASE_COLLECTION)
      .doc<OnlineGameState>(gameCode)
      .valueChanges() as Observable<OnlineGameState>;
  }

  async startNewGame(gameCode: string): Promise<void> {
    const gameDoc = this.firestore
      .collection(this.GAME_FIREBASE_COLLECTION)
      .doc<OnlineGameState>(gameCode);

    await gameDoc.update({
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      isWhitePlayerTurn: true,
      status: 'playing',
      lastMove: null,
      winner: '',
    });
  }
}
