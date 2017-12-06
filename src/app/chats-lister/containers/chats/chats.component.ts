import {Component, OnInit} from '@angular/core';
import {ChatsService} from '../../../services/chats.service';
import {Observable} from 'rxjs/Observable';

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

    <app-chats-list [items]="chats$ | async"></app-chats-list>

    <button class="chat-button" mat-fab color="primary">
      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
    </button>
  `,
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit {
  chats$: Observable<any[]>;

  constructor(private chatsService: ChatsService) {
  }

  ngOnInit() {
    this.chats$ = this.chatsService.getChats().chats$;
  }
}
