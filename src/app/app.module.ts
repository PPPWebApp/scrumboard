import { NavbarService } from './services/navbar.service';
import { FirebaseConfig } from './../environments/FirebaseConfig';


import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';


// Components and services
import { AppComponent } from './app.component';
import { LoginComponent } from './ui/login/login.component';
import { NavbarComponent } from './ui/navbar/navbar.component';
import { BoardsComponent } from './ui/boards/boards.component';
import { TeamsService } from './services/teams.service';
import { AuthServiceService } from './services/auth-service.service';
import { AngularFirestore, AngularFirestoreModule } from 'angularfire2/firestore';
import { ProfileGuardService } from './services/profile-guard.service';
import { ScrumComponent } from './ui/scrum/scrum.component';

// Angular Material components
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OverlayModule } from '@angular/cdk/overlay';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatSliderModule } from '@angular/material/slider';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { TeamsModuleComponent } from './modules/teams-module/teams-module.component';
import { AngularFireFunctions } from 'angularfire2/functions';
import { AdminComponent } from './ui/admin/admin.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { MapToIterablePipe } from './extra/map-to-iterable.pipe';
import { TeamSettingsComponent } from './ui/team-settings/team-settings.component';
import { ReactiveFormsModule, FormsModule } from '../../node_modules/@angular/forms';
import { ScrumService } from './services/scrum.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    BoardsComponent,
    ScrumComponent,
    TeamsModuleComponent,
    AdminComponent,
    MapToIterablePipe,
    TeamSettingsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    MatSelectModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatToolbarModule,
    OverlayModule,
    FormsModule,
    MatProgressBarModule,
    MatButtonModule,
    MatSlideToggleModule,
    AngularFireModule.initializeApp(FirebaseConfig),
    AngularFirestoreModule.enablePersistence(),
    AngularFireDatabaseModule,
    BrowserModule,
    SweetAlert2Module.forRoot(),
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      { path: 'admin', component: AdminComponent, canActivate: [ProfileGuardService]},
      { path: 'scrum/:teamId/:id', component: ScrumComponent, canActivate: [ProfileGuardService] },
      { path: 'team/:teamId', component: TeamSettingsComponent, canActivate: [ProfileGuardService] },
      { path: '', component: BoardsComponent, canActivate: [ProfileGuardService] },
      { path: ':teamId', component: BoardsComponent, canActivate: [ProfileGuardService] },
      // { path: '**', component: NotFoundComponent } // must be last
    ]),
  ],
  providers: [AngularFireAuth, TeamsService, ScrumService, AuthServiceService, AngularFirestore,
    ProfileGuardService, NavbarService, AngularFireFunctions],
  bootstrap: [AppComponent]
})
export class AppModule { }
