import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatItemComponent } from './chat-item.component';
import {GetChats} from '../../../../types';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {TruncateModule} from 'ng2-truncate';

describe('ChatItemComponent', () => {
  let component: ChatItemComponent;
  let fixture: ComponentFixture<ChatItemComponent>;
  let el: DebugElement;

  const chat: GetChats.Chats = {
    id: '1',
    name: 'Niccolo\' Belli',
    picture: null,
    userIds: ['1', '2'],
    unreadMessages: 0,
    lastMessage: {
      id: '1234567890',
      senderId: '1',
      sender: {
        id: '1',
        name: 'Niccolo\' Belli',
      },
      content: 'Hello! How are you? A lot happened since last time',
      createdAt: 1513435525,
      type: 0,
      recipients: [{
        id: '2',
        receivedAt: null,
        readAt: null
      }],
      ownership: true
    },
    isGroup: false
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
    expect(el.query(By.css('.chat-content')).nativeElement.textContent).toContain(chat.lastMessage.content.slice(0, 20));
  });

  it('should not contain the latest characters of the message content', () => {
    expect(el.query(By.css('.chat-content')).nativeElement.textContent).not.toContain(chat.lastMessage.content.slice(20));
  });
});
