import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Apollo} from 'apollo-angular';
import {GetChat} from '../../../types';
import {Observable} from 'rxjs/Observable';
import {ChatsService} from '../../services/chats.service';

@Component({
  template: `
    <app-toolbar>
      <button class="navigation" mat-button (click)="goToChats()">
        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
      </button>
      <div class="title">{{ title$ | async }}</div>
    </app-toolbar>
    <div class="container">
      <app-messages-list [messages$]="messages$" [isGroup]="isGroup$ | async"></app-messages-list>
    <app-new-message (newMessage)="addMessage($event)"></app-new-message>
    </div>
  `,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  chatId: string;
  messages$: Observable<GetChat.Messages[]>;
  title$: Observable<string>;
  isGroup$: Observable<boolean>;

  constructor(private apollo: Apollo,
              private route: ActivatedRoute,
              private router: Router,
              private chatsService: ChatsService) {}

  ngOnInit() {
    this.route.params.subscribe(({id: chatId}: {id: string}) => {
      // Needed to update last message cache
      this.chatsService.getChats().chats$.subscribe();

      this.chatId = chatId;
      this.messages$ = this.chatsService.getChat(chatId).messages$;
      this.title$ = this.chatsService.getChat(chatId).title$;
      this.isGroup$ = this.chatsService.getChat(chatId).isGroup$;
    });
  }

  goToChats() {
    this.router.navigate(['/chats']);
  }

  addMessage(content: string) {
    this.chatsService.addMessage(this.chatId, content).subscribe();
  }
}
