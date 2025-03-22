import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'page-wrapper',
  templateUrl: './page-wrapper.component.html',
  styleUrls: ['./page-wrapper.component.scss'],
})
export class PageWrapperComponent {
  isOnlineMode: boolean = false;

  constructor(private router: Router) {}

  toggleMode() {
    const newMode = !this.isOnlineMode;
    this.isOnlineMode = newMode;

    this.router.navigate([newMode ? 'online' : 'offline']);
  }
}
