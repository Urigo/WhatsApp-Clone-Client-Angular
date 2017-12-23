import { TestBed, inject } from '@angular/core/testing';

import { ChatsService } from './chats.service';
import {Apollo} from 'apollo-angular';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {InMemoryCache} from 'apollo-cache-inmemory';

describe('ChatsService', () => {
  let httpMock: HttpTestingController;
  let httpLink: HttpLink;
  let apollo: Apollo;
  const chats = [
    {
      id: '1',
      __typename: 'Chat',
      name: 'Avery Stewart',
      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
      userIds: [
        '1',
        '3'
      ],
      unreadMessages: 1,
      lastMessage: {
        id: '708323562255',
        __typename: 'Message',
        senderId: '3',
        sender: {
          id: '3',
          __typename: 'User',
          name: 'Avery Stewart'
        },
        content: 'Yep!',
        createdAt: 1514035700,
        type: 0,
        recipients: [
          {
            id: '1',
            __typename: 'Recipient',
            receivedAt: null,
            readAt: null
          }
        ],
        ownership: false
      },
      isGroup: false
    },
    {
      id: '2',
      __typename: 'Chat',
      name: 'Katie Peterson',
      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
      userIds: [
        '1',
        '4'
      ],
      unreadMessages: 0,
      lastMessage: {
        id: '559578737535',
        __typename: 'Message',
        senderId: '1',
        sender: {
          id: '1',
          __typename: 'User',
          name: 'Ethan Gonzalez'
        },
        content: 'Hey, it\'s me',
        createdAt: 1514031800,
        type: 0,
        recipients: [
          {
            id: '4',
            __typename: 'Recipient',
            receivedAt: null,
            readAt: null
          }
        ],
        ownership: true
      },
      isGroup: false
    },
    {
      id: '3',
      __typename: 'Chat',
      name: 'Ray Edwards',
      picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
      userIds: [
        '1',
        '5'
      ],
      unreadMessages: 0,
      lastMessage: {
        id: '127559683621',
        __typename: 'Message',
        senderId: '1',
        sender: {
          id: '1',
          __typename: 'User',
          name: 'Ethan Gonzalez'
        },
        content: 'You still there?',
        createdAt: 1514010200,
        type: 0,
        recipients: [
          {
            id: '5',
            __typename: 'Recipient',
            receivedAt: null,
            readAt: null
          }
        ],
        ownership: true
      },
      isGroup: false
    },
    {
      id: '6',
      __typename: 'Chat',
      name: 'Niccolò Belli',
      picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
      userIds: [
        '1',
        '6'
      ],
      unreadMessages: 0,
      lastMessage: null,
      isGroup: false
    },
    {
      id: '8',
      __typename: 'Chat',
      name: 'A user 0 group',
      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
      userIds: [
        '1',
        '3',
        '4',
        '6'
      ],
      unreadMessages: 1,
      lastMessage: {
        id: '147283729633',
        __typename: 'Message',
        senderId: '4',
        sender: {
          id: '4',
          __typename: 'User',
          name: 'Katie Peterson'
        },
        content: 'Awesome!',
        createdAt: 1512830000,
        type: 0,
        recipients: [
          {
            id: '1',
            __typename: 'Recipient',
            receivedAt: null,
            readAt: null
          },
          {
            id: '6',
            __typename: 'Recipient',
            receivedAt: null,
            readAt: null
          }
        ],
        ownership: false
      },
      isGroup: true
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpLinkModule,
        // HttpClientModule,
        HttpClientTestingModule,
      ],
      providers: [
        ChatsService,
        Apollo,
      ]
    });

    httpMock = TestBed.get(HttpTestingController);
    httpLink = TestBed.get(HttpLink);
    apollo = TestBed.get(Apollo);

    apollo.create({
      link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
      cache: new InMemoryCache()
    });
  });

  it('should be created', inject([ChatsService], (service: ChatsService) => {
    expect(service).toBeTruthy();
  }));

  it('should get chats', inject([ChatsService], (service: ChatsService) => {
    service.getChats().chats$.subscribe(_chats => {
      expect(_chats.length).toEqual(chats.length);
      for (let i = 0; i < _chats.length; i++) {
        expect(_chats[i]).toEqual(chats[i]);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
    expect(req.request.method).toBe('POST');
    req.flush({
      data: {
        chats
      }
    });
    httpMock.verify();
  }));
});
