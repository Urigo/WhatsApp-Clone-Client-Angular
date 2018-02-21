import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule,
  MatToolbarModule
} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ChatsService} from '../services/chats.service';
import {UserItemComponent} from './components/user-item/user-item.component';
import {UsersListComponent} from './components/users-list/users-list.component';
import {NewGroupComponent} from './containers/new-group/new-group.component';
import {NewChatComponent} from './containers/new-chat/new-chat.component';
import {NewGroupDetailsComponent} from './components/new-group-details/new-group-details.component';
import {SharedModule} from '../shared/shared.module';
import {SelectableListModule} from 'ngx-selectable-list';
import {AuthGuard} from '../login/services/auth.guard';

const routes: Routes = [
  {path: 'new-chat', canActivate: [AuthGuard], component: NewChatComponent},
  {path: 'new-group', canActivate: [AuthGuard], component: NewGroupComponent},
];

@NgModule({
  declarations: [
    NewChatComponent,
    UsersListComponent,
    NewGroupComponent,
    UserItemComponent,
    NewGroupDetailsComponent,
  ],
  imports: [
    BrowserModule,
    // Animations (for Material)
    BrowserAnimationsModule,
    // Material
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatGridListModule,
    MatInputModule,
    MatFormFieldModule,
    MatGridListModule,
    // Routing
    RouterModule.forChild(routes),
    // Forms
    FormsModule,
    // Feature modules
    SelectableListModule,
    SharedModule,
  ],
  providers: [
    ChatsService,
  ],
})
export class ChatsCreationModule {
}
