import {Component, OnInit} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Observable} from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import {ApolloQueryResult} from 'apollo-client';
import {GetChats} from '../../../types';
import {getChatsQuery} from '../../../graphql/getChats.query';
import {ActivatedRoute, Router} from '@angular/router';
import {ChatsService} from '../../services/chats.service';

@Component({
  template: `
    <app-toolbar>
      <div class="title">Whatsapp Clone</div>
      <button mat-icon-button [matMenuTriggerFor]="menu" class="menu">
        <mat-icon>more_vert</mat-icon>
      </button>
    </app-toolbar>

    <mat-menu #menu="matMenu">
      <button mat-menu-item>
        <mat-icon>dialpad</mat-icon>
        <span>Redial</span>
      </button>
      <button mat-menu-item disabled>
        <mat-icon>voicemail</mat-icon>
        <span>Check voicemail</span>
      </button>
      <button mat-menu-item>
        <mat-icon>notifications_off</mat-icon>
        <span>Disable alerts</span>
      </button>
    </mat-menu>

    <app-chats-list [chats$]="chats$" (view)="goToChat($event)"></app-chats-list>

    <button class="new-chat" mat-fab color="primary" (click)="goToUsers()">
      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
    </button>
  `,
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit {
  chats$: Observable<GetChats.Chats[]>;

  constructor(private apollo: Apollo,
              private route: ActivatedRoute,
              private router: Router,
              private chatsService: ChatsService) {}

  ngOnInit() {
    this.chats$ = this.chatsService.getChats().chats$;
  }

  goToChat(chatId: string) {
    this.router.navigate(['/chat', chatId]);
  }

  goToUsers() {
    this.router.navigate(['/new-chat']);
  }
}
