export type Maybe<T> = T | null;

/** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
export type DateTime = any;

// ====================================================
// Documents
// ====================================================

export namespace AddChat {
  export type Variables = {
    recipientId: string;
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
    recipientIds: string[];
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

export namespace ChatUpdated {
  export type Variables = {};

  export type Subscription = {
    __typename?: "Subscription";

    chatUpdated: Maybe<ChatUpdated>;
  };

  export type ChatUpdated = {
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

export namespace GetUsers {
  export type Variables = {};

  export type Query = {
    __typename?: "Query";

    users: Users[];
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

    removeMessages: string[];
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
    messagesIds?: Maybe<string[]>;
  };

  export type Mutation = {
    __typename?: "Mutation";

    removeMessages: string[];
  };
}

export namespace UserAdded {
  export type Variables = {};

  export type Subscription = {
    __typename?: "Subscription";

    userAdded: Maybe<UserAdded>;
  };

  export type UserAdded = User.Fragment;
}

export namespace UserUpdated {
  export type Variables = {};

  export type Subscription = {
    __typename?: "Subscription";

    userUpdated: Maybe<UserUpdated>;
  };

  export type UserUpdated = User.Fragment;
}

export namespace User {
  export type Fragment = {
    __typename?: "User";

    id: string;

    name: Maybe<string>;

    picture: Maybe<string>;
  };
}

export namespace ChatWithoutMessages {
  export type Fragment = {
    __typename?: "Chat";

    id: string;

    name: Maybe<string>;

    picture: Maybe<string>;

    updatedAt: Maybe<DateTime>;

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

  users: User[];

  chats: Chat[];

  chat?: Maybe<Chat>;
}

export interface User {
  id: string;

  name?: Maybe<string>;

  picture?: Maybe<string>;
}

export interface Chat {
  id: string;

  name?: Maybe<string>;

  picture?: Maybe<string>;

  allTimeMembers: User[];

  listingMembers: User[];

  actualGroupMembers: User[];

  admins?: Maybe<User[]>;

  owner?: Maybe<User>;

  messages: (Maybe<Message>)[];

  lastMessage?: Maybe<Message>;

  updatedAt?: Maybe<DateTime>;

  isGroup: boolean;

  unreadMessages: number;
}

export interface Message {
  id: string;

  sender: User;

  content: string;

  createdAt: DateTime;

  recipients: Recipient[];

  holders: User[];

  ownership: boolean;

  chat: Chat;
}

export interface Recipient {
  receivedAt?: Maybe<DateTime>;

  readAt?: Maybe<DateTime>;

  user: User;

  message: Message;

  chat: Chat;
}

export interface Mutation {
  updateUser: User;

  addMessage?: Maybe<Message>;

  removeMessages: string[];

  addChat?: Maybe<Chat>;

  addGroup?: Maybe<Chat>;

  updateChat?: Maybe<Chat>;

  removeChat?: Maybe<string>;

  addAdmins: (Maybe<string>)[];

  removeAdmins: (Maybe<string>)[];

  addMembers: (Maybe<string>)[];

  removeMembers: (Maybe<string>)[];
}

export interface Subscription {
  userAdded?: Maybe<User>;

  userUpdated?: Maybe<User>;

  messageAdded?: Maybe<Message>;

  chatAdded?: Maybe<Chat>;

  chatUpdated?: Maybe<Chat>;
}

// ====================================================
// Arguments
// ====================================================

export interface ChatQueryArgs {
  chatId: string;
}
export interface MessagesChatArgs {
  amount?: Maybe<number>;

  before?: Maybe<string>;
}
export interface UpdateUserMutationArgs {
  name?: Maybe<string>;

  picture?: Maybe<string>;
}
export interface AddMessageMutationArgs {
  chatId: string;

  content: string;
}
export interface RemoveMessagesMutationArgs {
  chatId: string;

  messagesIds?: Maybe<string[]>;

  all?: Maybe<boolean>;
}
export interface AddChatMutationArgs {
  recipientId: string;
}
export interface AddGroupMutationArgs {
  recipientIds: string[];

  groupName: string;

  groupPicture?: Maybe<string>;
}
export interface UpdateChatMutationArgs {
  chatId: string;

  name?: Maybe<string>;

  picture?: Maybe<string>;
}
export interface RemoveChatMutationArgs {
  chatId: string;
}
export interface AddAdminsMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface RemoveAdminsMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface AddMembersMutationArgs {
  groupId: string;

  userIds: string[];
}
export interface RemoveMembersMutationArgs {
  groupId: string;

  userIds: string[];
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

export const UserFragment = gql`
  fragment User on User {
    id
    name
    picture
  }
`;

export const ChatWithoutMessagesFragment = gql`
  fragment ChatWithoutMessages on Chat {
    id
    name
    picture
    updatedAt
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
export class AddChatGQL extends Apollo.Mutation<
  AddChat.Mutation,
  AddChat.Variables
> {
  document: any = gql`
    mutation AddChat($recipientId: ID!) {
      addChat(recipientId: $recipientId) {
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
    mutation AddGroup($recipientIds: [ID!]!, $groupName: String!) {
      addGroup(recipientIds: $recipientIds, groupName: $groupName) {
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
export class ChatUpdatedGQL extends Apollo.Subscription<
  ChatUpdated.Subscription,
  ChatUpdated.Variables
> {
  document: any = gql`
    subscription chatUpdated {
      chatUpdated {
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
    mutation RemoveMessages($chatId: ID!, $messagesIds: [ID!]) {
      removeMessages(chatId: $chatId, messagesIds: $messagesIds)
    }
  `;
}
@Injectable({
  providedIn: "root"
})
export class UserAddedGQL extends Apollo.Subscription<
  UserAdded.Subscription,
  UserAdded.Variables
> {
  document: any = gql`
    subscription userAdded {
      userAdded {
        ...User
      }
    }

    ${UserFragment}
  `;
}
@Injectable({
  providedIn: "root"
})
export class UserUpdatedGQL extends Apollo.Subscription<
  UserUpdated.Subscription,
  UserUpdated.Variables
> {
  document: any = gql`
    subscription userUpdated {
      userUpdated {
        ...User
      }
    }

    ${UserFragment}
  `;
}

// ====================================================
// END: Apollo Angular template
// ====================================================
