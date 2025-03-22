import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChessBoardComponent } from './components/chess-board/chess-board.component';
import { OfflineModePageComponent } from './pages/offline-mode-page/offline-mode-page.component';
import { OnlineModePageComponent } from './pages/online-mode-page/online-mode-page.component';
import { PageWrapperComponent } from './components/page-wrapper/page-wrapper.component';

const routes: Routes = [
  { path: '', redirectTo: '/offline', pathMatch: 'full' },
  { path: 'chess-board', component: ChessBoardComponent },
  {
    path: '',
    component: PageWrapperComponent,
    children: [
      { path: 'offline', component: OfflineModePageComponent },
      { path: 'online', component: OnlineModePageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
