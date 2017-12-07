import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ChatsService} from '../../../services/chats.service';
import {GetChat} from '../../../../types';

@Component({
  template: `
    <app-toolbar>
      <button class="navigation" mat-button (click)="goToChats()">
        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
      </button>
      <div class="title">{{ name }}</div>
    </app-toolbar>
    <div class="container">
      <app-messages-list [items]="messages" [isGroup]="isGroup"
                         appSelectableList="multiple_press" (multiple)="deleteMessages($event)">
        <app-confirm-selection #confirmSelection></app-confirm-selection>
      </app-messages-list>
      <app-new-message (newMessage)="addMessage($event)"></app-new-message>
    </div>
  `,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  chatId: string;
  messages: GetChat.Messages[];
  name: string;
  isGroup: boolean;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private chatsService: ChatsService) {
  }

  ngOnInit() {
    this.route.params.subscribe(({id: chatId}) => {
      this.chatId = chatId;
      this.chatsService.getChat(chatId).chat$.subscribe(chat => {
        this.messages = chat.messages;
        this.name = chat.name;
        this.isGroup = chat.isGroup;
      });
    });
  }

  goToChats() {
    this.router.navigate(['/chats']);
  }

  addMessage(content: string) {
    this.chatsService.addMessage(this.chatId, content).subscribe();
  }

  deleteMessages(messageIds: string[]) {
    this.chatsService.removeMessages(this.chatId, this.messages, messageIds).subscribe();
  }
}
