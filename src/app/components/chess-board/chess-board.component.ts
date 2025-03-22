import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgxChessBoardView, HistoryMove } from 'ngx-chess-board';

@Component({
  selector: 'chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent {
  private OFFLINE_GAME_STATE_STORAGE_KEY = 'office_game_state_store_key';

  isWhitePlayer: boolean = false;

  @ViewChild('board', { static: false }) board!: NgxChessBoardView;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.isWhitePlayer = params['player'] === 'white';
    });

    window.addEventListener('message', (event) => {
      if (event.data.startNewGame) {
        this.handleStartNewGame();
      } else {
        this.handleMoveEvent(event.data);
      }
    });
  }

  ngAfterViewInit() {
    const currBoardState = localStorage.getItem(
      this.OFFLINE_GAME_STATE_STORAGE_KEY
    );

    if (currBoardState) {
      this.board.setFEN(currBoardState);
    }

    if (!this.isWhitePlayer) {
      setTimeout(() => {
        this.board.reverse();
      });
    }
  }

  onMoveChange() {
    const lastMove = this.board.getMoveHistory().slice(-1)[0];

    window.parent.postMessage(
      lastMove,
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `${window.location.origin}/offline`
      )
    );
  }

  private handleStartNewGame() {
    this.board.reset();

    if (!this.isWhitePlayer) {
      this.board.reverse();
    }

    localStorage.removeItem(this.OFFLINE_GAME_STATE_STORAGE_KEY);
  }

  private handleMoveEvent(moveData: HistoryMove) {
    this.board.move(moveData.move);

    localStorage.setItem(
      this.OFFLINE_GAME_STATE_STORAGE_KEY,
      this.board.getFEN()
    );
  }
}
