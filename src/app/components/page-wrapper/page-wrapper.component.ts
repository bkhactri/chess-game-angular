import { Component } from '@angular/core';
import { NavigationEnd, Router, Scroll } from '@angular/router';

@Component({
  selector: 'page-wrapper',
  templateUrl: './page-wrapper.component.html',
  styleUrls: ['./page-wrapper.component.scss'],
})
export class PageWrapperComponent {
  isOnlineMode: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      this.isOnlineMode = (event as Scroll).routerEvent?.url?.includes(
        '/online'
      );
    });
  }

  toggleMode() {
    const newMode = !this.isOnlineMode;
    this.isOnlineMode = newMode;

    this.router.navigate([newMode ? 'online' : 'offline']);
  }
}
