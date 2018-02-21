import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
import {ChatsService} from '../../../services/chats.service';
import {Apollo} from 'apollo-angular';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpLink, HttpLinkModule, Options} from 'apollo-angular-link-http';
import {defaultDataIdFromObject, InMemoryCache} from 'apollo-cache-inmemory';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs/observable/of';
import {By} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {NewMessageComponent} from '../../components/new-message/new-message.component';
import {MessagesListComponent} from '../../components/messages-list/messages-list.component';
import {MessageItemComponent} from '../../components/message-item/message-item.component';
import {SelectableListModule} from 'ngx-selectable-list';
import {LoginService} from '../../../login/services/login.service';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let el: DebugElement;

  let httpMock: HttpTestingController;
  let httpLink: HttpLink;
  let apollo: Apollo;

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
            readAt: null
          }
        ],
        ownership: false
      }
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
        HttpLinkModule,
        HttpClientTestingModule,
        RouterTestingModule,
        SelectableListModule,
      ],
      providers: [
        ChatsService,
        Apollo,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: chat.id }),
            queryParams: of({}),
          }
        },
        LoginService,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne(httpReq => httpReq.body.operationName === 'chatAdded', 'call to chatAdded api');
    httpMock.expectOne(httpReq => httpReq.body.operationName === 'messageAdded', 'call to messageAdded api');
    httpMock.expectOne(httpReq => httpReq.body.operationName === 'GetChats', 'call to getChats api');
    const req = httpMock.expectOne(httpReq => httpReq.body.operationName === 'GetChat', 'call to getChat api');
    req.flush({
      data: {
        chat
      }
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the chat', () => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      el = fixture.debugElement;
      expect(el.query(By.css(`app-toolbar > mat-toolbar > div > div`)).nativeElement.textContent).toContain(chat.name);
      for (let i = 0; i < chat.messages.length; i++) {
        expect(el.query(By.css(`app-messages-list > mat-list > mat-list-item:nth-child(${i + 1}) > div > app-message-item > div`))
          .nativeElement.textContent).toContain(chat.messages[i].content);
      }
    });

    httpMock.verify();
  });
});
