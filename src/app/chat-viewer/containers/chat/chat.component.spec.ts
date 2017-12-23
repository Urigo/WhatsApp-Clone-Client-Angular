import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
import {ChatsService} from '../../../services/chats.service';
import {Apollo} from 'apollo-angular';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs/observable/of';
import {By} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {NewMessageComponent} from '../../components/new-message/new-message.component';
import {MessagesListComponent} from '../../components/messages-list/messages-list.component';
import {MessageItemComponent} from '../../components/message-item/message-item.component';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let el: DebugElement;

  let httpMock: HttpTestingController;
  let httpLink: HttpLink;
  let apollo: Apollo;

  const chat = {
    id: '1',
    __typename: 'Chat',
    name: 'Avery Stewart',
    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
    userIds: [
      '1',
      '3'
    ],
    unreadMessages: 1,
    messages: [
      {
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
      }]
    ,
    isGroup: false
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
        RouterTestingModule
      ],
      providers: [
        ChatsService,
        Apollo,
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: chat.id }) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    httpMock = TestBed.get(HttpTestingController);
    httpLink = TestBed.get(HttpLink);
    apollo = TestBed.get(Apollo);

    apollo.create({
      link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
      cache: new InMemoryCache()
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
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
