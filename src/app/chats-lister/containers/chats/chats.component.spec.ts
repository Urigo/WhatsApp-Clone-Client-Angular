import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
} from '@angular/material';
import { Apollo } from 'apollo-angular';
import {
  ApolloTestingModule,
  ApolloTestingController,
  APOLLO_TESTING_CACHE,
} from 'apollo-angular/testing';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSelectableListModule } from 'ngx-selectable-list';

import { GetChats } from '../../../../graphql';
import { dataIdFromObject } from '../../../graphql.module';
import { ChatsComponent } from './chats.component';
import { ChatsListComponent } from '../../components/chats-list/chats-list.component';
import { ChatItemComponent } from '../../components/chat-item/chat-item.component';
import { ChatsService } from '../../../services/chats.service';

describe('ChatsComponent', () => {
  let component: ChatsComponent;
  let fixture: ComponentFixture<ChatsComponent>;
  let el: DebugElement;

  let controller: ApolloTestingController;
  let apollo: Apollo;

  const chats: GetChats.Chats[] = [
    {
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
    },
    {
      id: '2',
      __typename: 'Chat',
      name: 'Katie Peterson',
      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
      allTimeMembers: [
        {
          id: '1',
          __typename: 'User',
        },
        {
          id: '4',
          __typename: 'User',
        },
      ],
      unreadMessages: 0,
      isGroup: false,
      messages: [
        {
          id: '1',
          chat: {
            id: '2',
            __typename: 'Chat',
          },
          __typename: 'Message',
          sender: {
            id: '1',
            __typename: 'User',
            name: 'Ethan Gonzalez',
          },
          content: `Hey, it's me`,
          createdAt: '1514031800',
          type: 0,
          recipients: [
            {
              user: {
                id: '4',
                __typename: 'User',
              },
              message: {
                id: '1',
                __typename: 'Message',
                chat: {
                  id: '2',
                  __typename: 'Chat',
                },
              },
              __typename: 'Recipient',
              chat: {
                id: '2',
                __typename: 'Chat',
              },
              receivedAt: null,
              readAt: null,
            },
          ],
          ownership: true,
        },
      ],
    },
    {
      id: '3',
      __typename: 'Chat',
      name: 'Ray Edwards',
      picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
      allTimeMembers: [
        {
          id: '1',
          __typename: 'User',
        },
        {
          id: '5',
          __typename: 'User',
        },
      ],
      unreadMessages: 0,
      isGroup: false,
      messages: [
        {
          id: '1',
          __typename: 'Message',
          chat: {
            id: '3',
            __typename: 'Chat',
          },
          sender: {
            id: '1',
            __typename: 'User',
            name: 'Ethan Gonzalez',
          },
          content: 'You still there?',
          createdAt: '1514010200',
          type: 0,
          recipients: [
            {
              user: {
                id: '5',
                __typename: 'User',
              },
              message: {
                id: '1',
                __typename: 'Message',
                chat: {
                  id: '3',
                  __typename: 'Chat',
                },
              },
              __typename: 'Recipient',
              chat: {
                id: '3',
                __typename: 'Chat',
              },
              receivedAt: null,
              readAt: null,
            },
          ],
          ownership: true,
        },
      ],
    },
    {
      id: '6',
      __typename: 'Chat',
      name: 'Niccolò Belli',
      picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
      allTimeMembers: [
        {
          id: '1',
          __typename: 'User',
        },
        {
          id: '6',
          __typename: 'User',
        },
      ],
      unreadMessages: 0,
      messages: [],
      isGroup: false,
    },
    {
      id: '8',
      __typename: 'Chat',
      name: 'A user 0 group',
      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
      allTimeMembers: [
        {
          id: '1',
          __typename: 'User',
        },
        {
          id: '3',
          __typename: 'User',
        },
        {
          id: '4',
          __typename: 'User',
        },
        {
          id: '6',
          __typename: 'User',
        },
      ],
      unreadMessages: 1,
      isGroup: true,
      messages: [
        {
          id: '1',
          __typename: 'Message',
          chat: {
            id: '8',
            __typename: 'Chat',
          },
          sender: {
            id: '4',
            __typename: 'User',
            name: 'Katie Peterson',
          },
          content: 'Awesome!',
          createdAt: '1512830000',
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
                  id: '8',
                  __typename: 'Chat',
                },
              },
              __typename: 'Recipient',
              chat: {
                id: '8',
                __typename: 'Chat',
              },
              receivedAt: null,
              readAt: null,
            },
            {
              user: {
                id: '6',
                __typename: 'User',
              },
              message: {
                id: '1',
                __typename: 'Message',
                chat: {
                  id: '8',
                  __typename: 'Chat',
                },
              },
              __typename: 'Recipient',
              chat: {
                id: '8',
                __typename: 'Chat',
              },
              receivedAt: null,
              readAt: null,
            },
          ],
          ownership: false,
        },
      ],
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChatsComponent, ChatsListComponent, ChatItemComponent],
      imports: [
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatListModule,
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
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    controller = TestBed.get(ApolloTestingController);
    apollo = TestBed.get(Apollo);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = controller.expectOne('GetChats', 'GetChats operation');

    req.flush({
      data: {
        chats,
      },
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the chats', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      el = fixture.debugElement;
      for (let i = 0; i < chats.length; i++) {
        expect(
          el.query(
            By.css(
              `app-chats-list > mat-list > mat-list-item:nth-child(${i +
                1}) > div > app-chat-item > div > div > div`,
            ),
          ).nativeElement.textContent,
        ).toContain(chats[i].name);
      }
    });
  });

  afterAll(() => {
    controller.verify();
  });
});
