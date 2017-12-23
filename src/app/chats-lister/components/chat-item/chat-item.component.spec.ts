import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatItemComponent } from './chat-item.component';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {TruncateModule} from 'ng2-truncate';

describe('ChatItemComponent', () => {
  let component: ChatItemComponent;
  let fixture: ComponentFixture<ChatItemComponent>;
  let el: DebugElement;

  const chat: any = {
    id: '1',
    __typename: 'Chat',
    name: 'Niccolo\' Belli',
    picture: null,
    allTimeMembers: [
      {
        id: '1',
        __typename: 'User',
      },
      {
        id: '2',
        __typename: 'User',
      }
    ],
    unreadMessages: 0,
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
          id: '1',
          __typename: 'User',
          name: 'Niccolo\' Belli',
        },
        content: 'Hello! How are you? A lot happened since last time',
        createdAt: '1513435525',
        type: 1,
        recipients: [
          {
            user: {
              id: '2',
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
        ownership: true,
      }
    ],
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatItemComponent ],
      imports: [TruncateModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatItemComponent);
    component = fixture.componentInstance;
    component.chat = chat;
    fixture.detectChanges();
    el = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain the chat name', () => {
    expect(el.query(By.css('.chat-recipient > div:first-child')).nativeElement.textContent).toContain(chat.name);
  });

  it('should contain the first couple of characters of the message content', () => {
    expect(el.query(By.css('.chat-content')).nativeElement.textContent)
      .toContain(chat.messages[chat.messages.length - 1].content.slice(0, 20));
  });

  it('should not contain the latest characters of the message content', () => {
    expect(el.query(By.css('.chat-content')).nativeElement.textContent)
      .not.toContain(chat.messages[chat.messages.length - 1].content.slice(20));
  });
});
