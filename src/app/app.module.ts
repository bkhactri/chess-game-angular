import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OfflineModePageComponent } from './pages/offline-mode-page/offline-mode-page.component';
import { OnlineModePageComponent } from './pages/online-mode-page/online-mode-page.component';
import { ChessBoardComponent } from './components/chess-board/chess-board.component';
import { PageWrapperComponent } from './components/page-wrapper/page-wrapper.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { environment } from './environments/environment';
import { OnlineOperationService } from './services/online-operation.service';

@NgModule({
  declarations: [
    AppComponent,
    ChessBoardComponent,
    OfflineModePageComponent,
    OnlineModePageComponent,
    PageWrapperComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxChessBoardModule.forRoot(),

    // UI component
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatSnackBarModule,

    // Firebase
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,

    // Form
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [OnlineOperationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
