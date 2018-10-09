export type Maybe<T> = T | null;

export enum MessageType {
  Location = "LOCATION",
  Text = "TEXT",
  Picture = "PICTURE"
}

/** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
export type DateTime = any;

// ====================================================
// Documents
// ====================================================

export namespace GetChats {
  export type Variables = {
    amount?: Maybe<number>;
  };

  export type Query = {
    __typename?: "Query";

    chats: Chats[];
  };

  export type Chats = {
    __typename?: "Chat";

    messages: (Maybe<Messages>)[];
  } & ChatWithoutMessages.Fragment;

  export type Messages = Message.Fragment;
}

export namespace ChatWithoutMessages {
  export type Fragment = {
    __typename?: "Chat";

    id: string;

    name: Maybe<string>;

    picture: Maybe<string>;

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

    createdAt: DateTime;

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

    name: Maybe<string>;
  };

  export type Recipients = {
    __typename?: "Recipient";

    user: User;

    message: Message;

    chat: __Chat;

    receivedAt: Maybe<DateTime>;

    readAt: Maybe<DateTime>;
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

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  me?: Maybe<User>;

  users?: Maybe<User[]>;

  chats: Chat[];

  chat?: Maybe<Chat>;
}

export interface User {
  id: string;

  name?: Maybe<string>;

  picture?: Maybe<string>;

  phone?: Maybe<string>;
}

export interface Chat {
  /** May be a chat or a group */
  id: string;

  createdAt: DateTime;
  /** Computed for chats */
  name?: Maybe<string>;
  /** Computed for chats */
  picture?: Maybe<string>;
  /** All members, current and past ones. Includes users who still didn't get the chat listed. */
  allTimeMembers: User[];
  /** Whoever gets the chat listed. For groups includes past members who still didn't delete the group. For chats they are the only ones who can send messages. */
  listingMembers: User[];
  /** Actual members of the group. Null for chats. For groups they are the only ones who can send messages. They aren't the only ones who get the group listed. */
  actualGroupMembers?: Maybe<User[]>;
  /** Null for chats */
  admins?: Maybe<User[]>;
  /** If null the group is read-only. Null for chats. */
  owner?: Maybe<User>;
  /** Computed property */
  isGroup: boolean;

  messages: (Maybe<Message>)[];
  /** Computed property */
  lastMessage?: Maybe<Message>;
  /** Computed property */
  updatedAt: DateTime;
  /** Computed property */
  unreadMessages: number;
}

export interface Message {
  id: string;

  sender: User;

  chat: Chat;

  content: string;

  createdAt: DateTime;
  /** FIXME: should return MessageType */
  type: number;
  /** Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */
  holders: User[];
  /** Computed property */
  ownership: boolean;
  /** Whoever received the message */
  recipients: Recipient[];
}

export interface Recipient {
  user: User;

  message: Message;

  chat: Chat;

  receivedAt?: Maybe<DateTime>;

  readAt?: Maybe<DateTime>;
}

// ====================================================
// Arguments
// ====================================================

export interface ChatQueryArgs {
  chatId: string;
}
export interface MessagesChatArgs {
  amount?: Maybe<number>;
}

// ====================================================
// START: Apollo Angular template
// ====================================================

import { Injectable } from "@angular/core";
import * as Apollo from "apollo-angular";

import gql from "graphql-tag";

// ====================================================
// GraphQL Fragments
// ====================================================

export const ChatWithoutMessagesFragment = gql`
  fragment ChatWithoutMessages on Chat {
    id
    name
    picture
    allTimeMembers {
      id
    }
    unreadMessages
    isGroup
  }
`;

export const MessageFragment = gql`
  fragment Message on Message {
    id
    chat {
      id
    }
    sender {
      id
      name
    }
    content
    createdAt
    type
    recipients {
      user {
        id
      }
      message {
        id
        chat {
          id
        }
      }
      chat {
        id
      }
      receivedAt
      readAt
    }
    ownership
  }
`;

// ====================================================
// Apollo Services
// ====================================================

@Injectable({
  providedIn: "root"
})
export class GetChatsGQL extends Apollo.Query<
  GetChats.Query,
  GetChats.Variables
> {
  document: any = gql`
    query GetChats($amount: Int) {
      chats {
        ...ChatWithoutMessages
        messages(amount: $amount) {
          ...Message
        }
      }
    }

    ${ChatWithoutMessagesFragment}
    ${MessageFragment}
  `;
}

// ====================================================
// END: Apollo Angular template
// ====================================================
