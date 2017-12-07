/* tslint:disable */

export interface Query {
  users?: User[] | null;
  chats?: Chat[] | null;
  chat?: Chat | null;
}

export interface User {
  id: string;
  name?: string | null;
  picture?: string | null;
  phone?: string | null;
}

export interface Chat {
  id: string /** May be a chat or a group */;
  name?: string | null /** Computed for chats */;
  picture?: string | null /** Computed for chats */;
  allTimeMembers: User[] /** All members, current and past ones. */;
  listingMembers: User[] /** Whoever gets the chat listed. For groups includes past members who still didn't delete the group. */;
  actualGroupMembers: User[] /** Actual members of the group (they are not the only ones who get the group listed). Null for chats. */;
  admins?: User[] | null /** Null for chats */;
  owner?: User | null /** If null the group is read-only. Null for chats. */;
  messages: (Message | null)[];
  unreadMessages: number /** Computed property */;
  isGroup: boolean /** Computed property */;
}

export interface Message {
  id: string;
  sender: User;
  chat: Chat;
  content: string;
  createdAt: string;
  type: number /** FIXME: should return MessageType */;
  recipients: Recipient[] /** Whoever received the message */;
  holders: User[] /** Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */;
  ownership: boolean /** Computed property */;
}

export interface Recipient {
  user: User;
  message: Message;
  chat: Chat;
  receivedAt?: string | null;
  readAt?: string | null;
}
export interface ChatQueryArgs {
  chatId: string;
}
export interface MessagesChatArgs {
  amount?: number | null;
}

export enum MessageType {
  LOCATION = "LOCATION",
  TEXT = "TEXT",
  PICTURE = "PICTURE"
}
export namespace GetChats {
  export type Variables = {
    amount?: number | null;
  };

  export type Query = {
    __typename?: "Query";
    chats?: Chats[] | null;
  };

  export type Chats = {
    __typename?: "Chat";
    messages: (Messages | null)[];
  } & ChatWithoutMessages.Fragment;

  export type Messages = Message.Fragment;
}

export namespace ChatWithoutMessages {
  export type Fragment = {
    __typename?: "Chat";
    id: string;
    name?: string | null;
    picture?: string | null;
    allTimeMembers: AllTimeMembers[];
    unreadMessages: number;
    isGroup: boolean;
  };

  export type AllTimeMembers = {
    __typename?: "User";
    id: string;
  };
}

export namespace Message {
  export type Fragment = {
    __typename?: "Message";
    id: string;
    chat: Chat;
    sender: Sender;
    content: string;
    createdAt: string;
    type: number;
    recipients: Recipients[];
    ownership: boolean;
  };

  export type Chat = {
    __typename?: "Chat";
    id: string;
  };

  export type Sender = {
    __typename?: "User";
    id: string;
    name?: string | null;
  };

  export type Recipients = {
    __typename?: "Recipient";
    user: User;
    message: Message;
    chat: __Chat;
    receivedAt?: string | null;
    readAt?: string | null;
  };

  export type User = {
    __typename?: "User";
    id: string;
  };

  export type Message = {
    __typename?: "Message";
    id: string;
    chat: _Chat;
  };

  export type _Chat = {
    __typename?: "Chat";
    id: string;
  };

  export type __Chat = {
    __typename?: "Chat";
    id: string;
  };
}
