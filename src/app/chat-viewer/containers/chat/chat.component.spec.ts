import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import {
  MatButtonModule,
  MatGridListModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatToolbarModule,
} from '@angular/material';
import {
  ApolloTestingModule,
  ApolloTestingController,
  APOLLO_TESTING_CACHE,
} from 'apollo-angular/testing';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { NgxSelectableListModule } from 'ngx-selectable-list';

import { dataIdFromObject } from '../../../graphql.module';
import { ChatComponent } from './chat.component';
import { ChatsService } from '../../../services/chats.service';
import { SharedModule } from '../../../shared/shared.module';
import { NewMessageComponent } from '../../components/new-message/new-message.component';
import { MessagesListComponent } from '../../components/messages-list/messages-list.component';
import { MessageItemComponent } from '../../components/message-item/message-item.component';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let el: DebugElement;

  let controller: ApolloTestingController;

  const chat: any = {
    id: '1',
    __typename: 'Chat',
    name: 'Avery Stewart',
    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
    allTimeMembers: [
      {
        id: '1',
        __typename: 'User',
      },
      {
        id: '3',
        __typename: 'User',
      },
    ],
    unreadMessages: 1,
    isGroup: false,
    messages: [
      {
        id: '1',
        chat: {
          id: '1',
          __typename: 'Chat',
        },
        __typename: 'Message',
        sender: {
          id: '3',
          __typename: 'User',
          name: 'Avery Stewart',
        },
        content: 'Yep!',
        createdAt: '1514035700',
        type: 0,
        recipients: [
          {
            user: {
              id: '1',
              __typename: 'User',
            },
            message: {
              id: '1',
              __typename: 'Message',
              chat: {
                id: '1',
                __typename: 'Chat',
              },
            },
            __typename: 'Recipient',
            chat: {
              id: '1',
              __typename: 'Chat',
            },
            receivedAt: null,
            readAt: null,
          },
        ],
        ownership: false,
      },
    ],
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ChatComponent,
        MessagesListComponent,
        MessageItemComponent,
        NewMessageComponent,
      ],
      imports: [
        MatToolbarModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatListModule,
        MatGridListModule,
        FormsModule,
        SharedModule,
        ApolloTestingModule,
        RouterTestingModule,
        NgxSelectableListModule,
      ],
      providers: [
        ChatsService,
        {
          provide: APOLLO_TESTING_CACHE,
          useFactory() {
            return new InMemoryCache({ dataIdFromObject });
          },
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: chat.id }) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    controller = TestBed.get(ApolloTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    controller.expectOne('GetChats', 'call to getChats api');

    const req = controller.expectOne('GetChat', 'call to getChat api');

    req.flush({
      data: {
        chat,
      },
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the chat', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      el = fixture.debugElement;
      expect(
        el.query(By.css(`app-toolbar > mat-toolbar > div > div`)).nativeElement
          .textContent,
      ).toContain(chat.name);
      for (let i = 0; i < chat.messages.length; i++) {
        expect(
          el.query(
            By.css(
              `app-messages-list > mat-list > mat-list-item:nth-child(${i +
                1}) > div > app-message-item > div`,
            ),
          ).nativeElement.textContent,
        ).toContain(chat.messages[i].content);
      }
    });

    controller.verify();
  });
});
