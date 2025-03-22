import { PLAYER_DISPLAY_NAME } from './../../constants/game.constant';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HistoryMove } from 'ngx-chess-board';
import { PLAYER } from 'src/app/types/game.type';

@Component({
  selector: 'offline-mode-page',
  templateUrl: './offline-mode-page.component.html',
  styleUrls: ['./offline-mode-page.component.scss'],
})
export class OfflineModePageComponent implements AfterViewInit {
  @ViewChild('light_board')
  lightBoard!: ElementRef<HTMLIFrameElement>;
  @ViewChild('dark_board')
  darkBoard!: ElementRef<HTMLIFrameElement>;

  readonly PLAYER_DISPLAY_NAME = PLAYER_DISPLAY_NAME;
  lightBoardIframeUrl: SafeResourceUrl = '';
  darkBoardIframeUrl: SafeResourceUrl = '';
  currentTurn: PLAYER = 'white';
  winner: string = '';
  isGameEnd: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.lightBoardIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${window.location.origin}/chess-board?player=white`
    );

    this.darkBoardIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${window.location.origin}/chess-board?player=black`
    );
  }

  ngAfterViewInit() {
    window.addEventListener('message', (event: { data: HistoryMove }) => {
      if (event.data.mate) {
        // Game is end
        this.winner = PLAYER_DISPLAY_NAME[event.data.color as PLAYER];
        this.isGameEnd = true;
      }

      if (event.data.color) {
        let nextTurnIframe!: ElementRef<HTMLIFrameElement>;
        let nextSendUrl!: SafeResourceUrl;

        switch (event.data.color) {
          case 'white':
            nextTurnIframe = this.darkBoard;
            nextSendUrl = this.darkBoardIframeUrl;
            this.currentTurn = 'black';

            break;

          case 'black':
            nextTurnIframe = this.lightBoard;
            nextSendUrl = this.lightBoardIframeUrl;

            this.currentTurn = 'white';

            break;

          default:
            break;
        }

        nextTurnIframe.nativeElement.contentWindow?.postMessage(
          event.data,
          nextSendUrl
        );
      }
    });
  }

  handleStartNewGame() {
    this.lightBoard.nativeElement.contentWindow?.postMessage(
      { startNewGame: true },
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `${window.location.origin}/chess-board?player=white`
      )
    );

    this.darkBoard.nativeElement.contentWindow?.postMessage(
      { startNewGame: true },
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `${window.location.origin}/chess-board?player=black`
      )
    );

    this.winner = '';
    this.isGameEnd = false;
  }
}
