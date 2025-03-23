import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { NgxChessBoardComponent } from 'ngx-chess-board';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnlineGameState, Player } from 'src/app/types/game.type';
import { OnlineOperationService } from 'src/app/services/online-operation.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-online-mode-page',
  templateUrl: './online-mode-page.component.html',
  styleUrls: ['./online-mode-page.component.scss'],
})
export class OnlineModePageComponent implements AfterViewInit {
  private ONLINE_GAME_PLAYER_ID_KEY = 'online_player_id';
  private ONLINE_GAME_CODE_KEY = 'online_game_code_current';

  @ViewChild('board', { static: false }) board!: NgxChessBoardComponent;
  infoForm!: FormGroup;
  gameCode: string | null = null;
  playerId: string | null = null;
  competitorId: string | null = null;
  localTurn: Player = 'white';
  isYourTurn: boolean = true;
  isWhitePlayerTurn: boolean = true;
  winner: string = '';
  isGameEnd: boolean = false;
  gameState!: OnlineGameState;
  isFirstLoad: boolean = true;

  constructor(
    private fb: FormBuilder,
    private opService: OnlineOperationService
  ) {}

  async ngOnInit() {
    // Init form
    this.infoForm = this.fb.group({
      gameCode: ['', Validators.required],
    });
  }

  async ngAfterViewInit() {
    // Check player
    let playerId = localStorage
      .getItem(this.ONLINE_GAME_PLAYER_ID_KEY)
      ?.toString();

    if (!playerId) {
      playerId = uuidv4();
      localStorage.setItem(this.ONLINE_GAME_PLAYER_ID_KEY, playerId);
    }

    this.playerId = playerId;

    // Check any current game code
    let gameCode = localStorage.getItem(this.ONLINE_GAME_CODE_KEY)?.toString();

    if (gameCode) {
      this.gameCode = gameCode;
      const gameState = await this.opService.getGameState(this.gameCode);
      this.setGameInformation(gameState);
      this.board.setFEN(gameState.fen);
    }

    this.onGameUpdates(this.gameCode as string);
  }

  async handleJoinGame() {
    const gameCode = this.infoForm.value['gameCode'] as string;
    const result = await this.opService.joinGame(
      gameCode,
      this.playerId as string
    );

    if (result) {
      this.localTurn = result?.localTurn;
      this.competitorId = result?.competitorId;
      this.isYourTurn = result?.isWhitePlayerTurn && this.localTurn === 'white';
      this.isWhitePlayerTurn = result?.isWhitePlayerTurn;
      this.gameCode = gameCode;

      // Register listen game changes
      this.onGameUpdates(this.gameCode);
    }
  }

  async handleCreateGame() {
    const gameCode = await this.opService.handleCreateGame(
      this.playerId as string
    );

    if (!gameCode) {
      alert('Create game failed');
    }

    this.gameCode = gameCode;
    this.localTurn = 'white';

    // Register listen game changes
    this.onGameUpdates(this.gameCode);
  }

  async onGameUpdates(gameCode: string): Promise<void> {
    this.opService.listenGameUpdates(gameCode).subscribe((data) => {
      this.gameState = data;

      // Update move
      this.board.move(data.lastMove as string);

      this.setGameInformation(data);
    });
  }

  setGameInformation(data: OnlineGameState) {
    if (data.status === 'end') {
      this.isGameEnd = true;
      this.winner = data.winner as string;
      return;
    }

    if (data?.whitePlayerId === this.playerId) {
      this.competitorId = data.blackPlayerId;
      this.localTurn = 'white';
    }

    if (data?.blackPlayerId === this.playerId) {
      this.competitorId = data.whitePlayerId;
      this.localTurn = 'black';
    }

    this.isYourTurn =
      (data?.isWhitePlayerTurn && this.localTurn === 'white') ||
      (!data?.isWhitePlayerTurn && this.localTurn === 'black');
    this.isWhitePlayerTurn = data?.isWhitePlayerTurn;

    if (this.localTurn === 'black' && this.isFirstLoad) {
      this.isFirstLoad = false;
      setTimeout(() => {
        this.board.reverse();
      });
    }
  }

  async onMoveChange() {
    const lastMove = this.board.getMoveHistory().slice(-1)[0];
    if (lastMove.color === this.localTurn) {
      this.board.move(lastMove.move);

      let newGameState: OnlineGameState = {
        ...this.gameState,
        fen: this.board.getFEN(),
        lastMove: lastMove.move,
        isWhitePlayerTurn: this.localTurn === 'white' ? false : true,
      };

      if (lastMove.mate) {
        this.isGameEnd = true;

        if (lastMove.color === this.localTurn) {
          this.winner === this.playerId;
        } else {
          this.winner === this.competitorId;
        }

        newGameState = {
          ...newGameState,
          winner: this.winner,
          status: 'end',
        };
      }

      await this.opService.updateGameMoves(
        this.gameCode as string,
        newGameState
      );
    }
  }

  async handleStartNewGame() {
    await this.opService.startNewGame(this.gameCode as string);

    this.winner = '';
    this.isGameEnd = false;
  }
}
