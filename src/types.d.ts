/* tslint:disable */

export interface Query {
  users: User[]; 
  chats: Chat[]; 
  chat?: Chat | null; 
}

export interface User {
  id: string; 
  name?: string | null; 
  picture?: string | null; 
  phone?: string | null; 
}

export interface Chat {
  id: string; /* May be a chat or a group */
  name?: string | null; /* Computed for chats */
  picture?: string | null; /* Computed for chats */
  allTimeMembers: User[]; /* All members, current and past ones. */
  listingMembers: User[]; /* Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group. */
  actualGroupMembers: User[]; /* Actual members of the group (they are not the only ones who get the group listed). Null for chats. */
  admins: User[]; /* Null for chats */
  owner?: User | null; /* If null the group is read-only. Null for chats. */
  messages: Message[]; 
  unreadMessages: number; /* Computed property */
  isGroup: boolean; /* Computed property */
}

export interface Message {
  id: string; 
  sender: User; 
  chat: Chat; 
  content: string; 
  createdAt: string; 
  type: number; /* FIXME: should return MessageType */
  recipients: Recipient[]; /* Whoever received the message */
  holders: User[]; /* Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */
  ownership: boolean; /* Computed property */
}

export interface Recipient {
  user: User; 
  message: Message; 
  receivedAt?: string | null; 
  readAt?: string | null; 
}
export interface ChatQueryArgs {
  chatId: string; 
}
export interface MessagesChatArgs {
  amount?: number | null; 
}

export type MessageType = "LOCATION" | "TEXT" | "PICTURE";

export namespace GetChat {
  export type Variables = {
    chatId: string;
  }

  export type Query = {
    chat?: Chat | null; 
  } 

  export type Chat = {
    messages: Messages[]; 
  } & ChatWithoutMessages.Fragment

  export type Messages = Message.Fragment
}
export namespace GetChats {
  export type Variables = {
    amount?: number | null;
  }

  export type Query = {
    chats: Chats[]; 
  } 

  export type Chats = {
    messages: Messages[]; 
  } & ChatWithoutMessages.Fragment

  export type Messages = Message.Fragment
}

export namespace ChatWithoutMessages {
  export type Fragment = {
    id: string; 
    name?: string | null; 
    picture?: string | null; 
    allTimeMembers: AllTimeMembers[]; 
    unreadMessages: number; 
    isGroup: boolean; 
  } 

  export type AllTimeMembers = {
    id: string; 
  } 
}

export namespace Message {
  export type Fragment = {
    id: string; 
    sender: Sender; 
    content: string; 
    createdAt: string; 
    type: number; 
    recipients: Recipients[]; 
    ownership: boolean; 
  } 

  export type Sender = {
    id: string; 
    name?: string | null; 
  } 

  export type Recipients = {
    user: User; 
    message: Message; 
    receivedAt?: string | null; 
    readAt?: string | null; 
  } 

  export type User = {
    id: string; 
  } 

  export type Message = {
    id: string; 
  } 
}
