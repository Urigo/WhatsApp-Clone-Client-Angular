export type Maybe<T> = T | null;

export interface CreateUserInput {
  username?: Maybe<string>;

  email?: Maybe<string>;

  password?: Maybe<string>;

  name?: Maybe<string>;

  picture?: Maybe<string>;

  phone?: Maybe<string>;
}

export interface TwoFactorSecretKeyInput {
  ascii?: Maybe<string>;

  base32?: Maybe<string>;

  hex?: Maybe<string>;

  qr_code_ascii?: Maybe<string>;

  qr_code_hex?: Maybe<string>;

  qr_code_base32?: Maybe<string>;

  google_auth_qr?: Maybe<string>;

  otpauth_url?: Maybe<string>;
}

export interface AuthenticateParamsInput {
  access_token?: Maybe<string>;

  access_token_secret?: Maybe<string>;

  provider?: Maybe<string>;

  password?: Maybe<string>;

  user?: Maybe<UserInput>;

  code?: Maybe<string>;
}

export interface UserInput {
  id?: Maybe<string>;

  email?: Maybe<string>;

  username?: Maybe<string>;
}

export enum MessageType {
  Location = "LOCATION",
  Text = "TEXT",
  Picture = "PICTURE"
}

/** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
export type DateTime = any;

/** The `Upload` scalar type represents a file upload. */
export type Upload = any;

// ====================================================
// Documents
// ====================================================

export namespace AddChat {
  export type Variables = {
    userId: string;
  };

  export type Mutation = {
    __typename?: "Mutation";

    addChat: Maybe<AddChat>;
  };

  export type AddChat = {
    __typename?: "Chat";

    messages: (Maybe<Messages>)[];
  } & ChatWithoutMessages.Fragment;

  export type Messages = Message.Fragment;
}

export namespace AddGroup {
  export type Variables = {
    userIds: string[];
    groupName: string;
  };

  export type Mutation = {
    __typename?: "Mutation";

    addGroup: Maybe<AddGroup>;
  };

  export type AddGroup = {
    __typename?: "Chat";

    messages: (Maybe<Messages>)[];
  } & ChatWithoutMessages.Fragment;

  export type Messages = Message.Fragment;
}

export namespace AddMessage {
  export type Variables = {
    chatId: string;
    content: string;
  };

  export type Mutation = {
    __typename?: "Mutation";

    addMessage: Maybe<AddMessage>;
  };

  export type AddMessage = Message.Fragment;
}

export namespace ChatAdded {
  export type Variables = {};

  export type Subscription = {
    __typename?: "Subscription";

    chatAdded: Maybe<ChatAdded>;
  };

  export type ChatAdded = {
    __typename?: "Chat";

    messages: (Maybe<Messages>)[];
  } & ChatWithoutMessages.Fragment;

  export type Messages = Message.Fragment;
}

export namespace GetChat {
  export type Variables = {
    chatId: string;
  };

  export type Query = {
    __typename?: "Query";

    chat: Maybe<Chat>;
  };

  export type Chat = {
    __typename?: "Chat";

    messages: (Maybe<Messages>)[];
  } & ChatWithoutMessages.Fragment;

  export type Messages = Message.Fragment;
}

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

export namespace GetUser {
  export type Variables = {};

  export type Query = {
    __typename?: "Query";

    getUser: Maybe<GetUser>;
  };

  export type GetUser = {
    __typename?: "User";

    id: string;

    username: Maybe<string>;

    name: Maybe<string>;

    picture: Maybe<string>;

    phone: Maybe<string>;
  };
}

export namespace GetUsers {
  export type Variables = {};

  export type Query = {
    __typename?: "Query";

    users: Maybe<Users[]>;
  };

  export type Users = {
    __typename?: "User";

    id: string;

    name: Maybe<string>;

    picture: Maybe<string>;
  };
}

export namespace MessageAdded {
  export type Variables = {};

  export type Subscription = {
    __typename?: "Subscription";

    messageAdded: Maybe<MessageAdded>;
  };

  export type MessageAdded = {
    __typename?: "Message";

    chat: Chat;
  } & Message.Fragment;

  export type Chat = {
    __typename?: "Chat";

    id: string;
  };
}

export namespace RemoveAllMessages {
  export type Variables = {
    chatId: string;
    all?: Maybe<boolean>;
  };

  export type Mutation = {
    __typename?: "Mutation";

    removeMessages: (Maybe<string>)[];
  };
}

export namespace RemoveChat {
  export type Variables = {
    chatId: string;
  };

  export type Mutation = {
    __typename?: "Mutation";

    removeChat: Maybe<string>;
  };
}

export namespace RemoveMessages {
  export type Variables = {
    chatId: string;
    messageIds?: Maybe<string[]>;
  };

  export type Mutation = {
    __typename?: "Mutation";

    removeMessages: (Maybe<string>)[];
  };
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
    ownership
  }
`;

// ====================================================
// Apollo Services
// ====================================================

@Injectable({
  providedIn: "root"
})
export class AddChatGQL extends Apollo.Mutation<
  AddChat.Mutation,
  AddChat.Variables
> {
  document: any = gql`
    mutation AddChat($userId: ID!) {
      addChat(userId: $userId) {
        ...ChatWithoutMessages
        messages {
          ...Message
        }
      }
    }

    ${ChatWithoutMessagesFragment}
    ${MessageFragment}
  `;
}
@Injectable({
  providedIn: "root"
})
export class AddGroupGQL extends Apollo.Mutation<
  AddGroup.Mutation,
  AddGroup.Variables
> {
  document: any = gql`
    mutation AddGroup($userIds: [ID!]!, $groupName: String!) {
      addGroup(userIds: $userIds, groupName: $groupName) {
        ...ChatWithoutMessages
        messages {
          ...Message
        }
      }
    }

    ${ChatWithoutMessagesFragment}
    ${MessageFragment}
  `;
}
@Injectable({
  providedIn: "root"
})
export class AddMessageGQL extends Apollo.Mutation<
  AddMessage.Mutation,
  AddMessage.Variables
> {
  document: any = gql`
    mutation AddMessage($chatId: ID!, $content: String!) {
      addMessage(chatId: $chatId, content: $content) {
        ...Message
      }
    }

    ${MessageFragment}
  `;
}
@Injectable({
  providedIn: "root"
})
export class ChatAddedGQL extends Apollo.Subscription<
  ChatAdded.Subscription,
  ChatAdded.Variables
> {
  document: any = gql`
    subscription chatAdded {
      chatAdded {
        ...ChatWithoutMessages
        messages {
          ...Message
        }
      }
    }

    ${ChatWithoutMessagesFragment}
    ${MessageFragment}
  `;
}
@Injectable({
  providedIn: "root"
})
export class GetChatGQL extends Apollo.Query<GetChat.Query, GetChat.Variables> {
  document: any = gql`
    query GetChat($chatId: ID!) {
      chat(chatId: $chatId) {
        ...ChatWithoutMessages
        messages {
          ...Message
        }
      }
    }

    ${ChatWithoutMessagesFragment}
    ${MessageFragment}
  `;
}
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
@Injectable({
  providedIn: "root"
})
export class GetUserGQL extends Apollo.Query<GetUser.Query, GetUser.Variables> {
  document: any = gql`
    query getUser {
      getUser {
        id
        username
        name
        picture
        phone
      }
    }
  `;
}
@Injectable({
  providedIn: "root"
})
export class GetUsersGQL extends Apollo.Query<
  GetUsers.Query,
  GetUsers.Variables
> {
  document: any = gql`
    query GetUsers {
      users {
        id
        name
        picture
      }
    }
  `;
}
@Injectable({
  providedIn: "root"
})
export class MessageAddedGQL extends Apollo.Subscription<
  MessageAdded.Subscription,
  MessageAdded.Variables
> {
  document: any = gql`
    subscription messageAdded {
      messageAdded {
        ...Message
        chat {
          id
        }
      }
    }

    ${MessageFragment}
  `;
}
@Injectable({
  providedIn: "root"
})
export class RemoveAllMessagesGQL extends Apollo.Mutation<
  RemoveAllMessages.Mutation,
  RemoveAllMessages.Variables
> {
  document: any = gql`
    mutation RemoveAllMessages($chatId: ID!, $all: Boolean) {
      removeMessages(chatId: $chatId, all: $all)
    }
  `;
}
@Injectable({
  providedIn: "root"
})
export class RemoveChatGQL extends Apollo.Mutation<
  RemoveChat.Mutation,
  RemoveChat.Variables
> {
  document: any = gql`
    mutation RemoveChat($chatId: ID!) {
      removeChat(chatId: $chatId)
    }
  `;
}
@Injectable({
  providedIn: "root"
})
export class RemoveMessagesGQL extends Apollo.Mutation<
  RemoveMessages.Mutation,
  RemoveMessages.Variables
> {
  document: any = gql`
    mutation RemoveMessages($chatId: ID!, $messageIds: [ID!]) {
      removeMessages(chatId: $chatId, messageIds: $messageIds)
    }
  `;
}

// ====================================================
// END: Apollo Angular template
// ====================================================
