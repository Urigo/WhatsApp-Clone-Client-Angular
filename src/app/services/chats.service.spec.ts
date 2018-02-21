import { TestBed, inject } from '@angular/core/testing';

import { ChatsService } from './chats.service';
import {Apollo} from 'apollo-angular';
import {HttpLink, HttpLinkModule, Options} from 'apollo-angular-link-http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {defaultDataIdFromObject, InMemoryCache} from 'apollo-cache-inmemory';
import {LoginService} from '../login/services/login.service';

describe('ChatsService', () => {
  let httpMock: HttpTestingController;
  let httpLink: HttpLink;
  let apollo: Apollo;

  const chats: any = [
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
        }
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
            name: 'Avery Stewart'
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
            }
          ],
          ownership: false,
        }
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
        }
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
            name: 'Ethan Gonzalez'
          },
          content: 'Hey, it\'s me',
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
            }
          ],
          ownership: true
        }
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
        }
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
            name: 'Ethan Gonzalez'
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
              readAt: null
            }
          ],
          ownership: true
        }
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
        }
      ],
      unreadMessages: 0,
      messages: [],
      isGroup: false
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
            name: 'Katie Peterson'
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
              readAt: null
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
              readAt: null
            }
          ],
          ownership: false
        }
      ],
    },
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
        LoginService,
      ]
    });

    httpMock = TestBed.get(HttpTestingController);
    httpLink = TestBed.get(HttpLink);
    apollo = TestBed.get(Apollo);

    apollo.create({
      link: httpLink.create(<Options>{ uri: 'http://localhost:3000/graphql' }),
      cache: new InMemoryCache({
        dataIdFromObject: (object: any) => {
          switch (object.__typename) {
            case 'Message': return `${object.chat.id}:${object.id}`; // use `chatId` prefix and `messageId` as the primary key
            default: return defaultDataIdFromObject(object); // fall back to default handling
          }
        }
      }),
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

    httpMock.expectOne(httpReq => httpReq.body.operationName === 'chatAdded', 'call to chatAdded api');
    httpMock.expectOne(httpReq => httpReq.body.operationName === 'messageAdded', 'call to messageAdded api');
    const req = httpMock.expectOne(httpReq => httpReq.body.operationName === 'GetChats', 'call to getChats api');
    expect(req.request.method).toBe('POST');
    req.flush({
      data: {
        chats
      }
    });
    httpMock.verify();
  }));
});
