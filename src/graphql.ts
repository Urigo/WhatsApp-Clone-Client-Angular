/* tslint:disable */
import { GraphQLResolveInfo } from "graphql";

export type Resolver<Result, Parent = any, Context = any, Args = any> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionResolver<
  Result,
  Parent = any,
  Context = any,
  Args = any
> = {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
};

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

export interface Mutation {
  addChat?: Chat | null;
  addGroup?: Chat | null;
  removeChat?: string | null;
  addMessage?: Message | null;
  removeMessages?: (string | null)[] | null;
  addMembers?: (string | null)[] | null;
  removeMembers?: (string | null)[] | null;
  addAdmins?: (string | null)[] | null;
  removeAdmins?: (string | null)[] | null;
  setGroupName?: string | null;
  setGroupPicture?: string | null;
  markAsReceived?: boolean | null;
  markAsRead?: boolean | null;
}

export interface Subscription {
  messageAdded?: Message | null;
  chatAdded?: Chat | null;
}
export interface ChatQueryArgs {
  chatId: string;
}
export interface MessagesChatArgs {
  amount?: number | null;
}
export interface AddChatMutationArgs {
  recipientId: string;
}
export interface AddGroupMutationArgs {
  recipientIds: string[];
  groupName: string;
}
export interface RemoveChatMutationArgs {
  chatId: string;
}
export interface AddMessageMutationArgs {
  chatId: string;
  content: string;
}
export interface RemoveMessagesMutationArgs {
  chatId: string;
  messageIds?: (string | null)[] | null;
  all?: boolean | null;
}
export interface AddMembersMutationArgs {
  groupId: string;
  userIds: string[];
}
export interface RemoveMembersMutationArgs {
  groupId: string;
  userIds: string[];
}
export interface AddAdminsMutationArgs {
  groupId: string;
  userIds: string[];
}
export interface RemoveAdminsMutationArgs {
  groupId: string;
  userIds: string[];
}
export interface SetGroupNameMutationArgs {
  groupId: string;
}
export interface SetGroupPictureMutationArgs {
  groupId: string;
}
export interface MarkAsReceivedMutationArgs {
  chatId: string;
}
export interface MarkAsReadMutationArgs {
  chatId: string;
}
export interface MessageAddedSubscriptionArgs {
  chatId?: string | null;
}

export enum MessageType {
  LOCATION = "LOCATION",
  TEXT = "TEXT",
  PICTURE = "PICTURE"
}

export namespace QueryResolvers {
  export interface Resolvers<Context = any> {
    users?: UsersResolver<User[] | null, any, Context>;
    chats?: ChatsResolver<Chat[] | null, any, Context>;
    chat?: ChatResolver<Chat | null, any, Context>;
  }

  export type UsersResolver<
    R = User[] | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type ChatsResolver<
    R = Chat[] | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<
    R = Chat | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, ChatArgs>;
  export interface ChatArgs {
    chatId: string;
  }
}

export namespace UserResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context>;
    name?: NameResolver<string | null, any, Context>;
    picture?: PictureResolver<string | null, any, Context>;
    phone?: PhoneResolver<string | null, any, Context>;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type NameResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type PhoneResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
}

export namespace ChatResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context> /** May be a chat or a group */;
    name?: NameResolver<string | null, any, Context> /** Computed for chats */;
    picture?: PictureResolver<
      string | null,
      any,
      Context
    > /** Computed for chats */;
    allTimeMembers?: AllTimeMembersResolver<
      User[],
      any,
      Context
    > /** All members, current and past ones. */;
    listingMembers?: ListingMembersResolver<
      User[],
      any,
      Context
    > /** Whoever gets the chat listed. For groups includes past members who still didn't delete the group. */;
    actualGroupMembers?: ActualGroupMembersResolver<
      User[],
      any,
      Context
    > /** Actual members of the group (they are not the only ones who get the group listed). Null for chats. */;
    admins?: AdminsResolver<User[] | null, any, Context> /** Null for chats */;
    owner?: OwnerResolver<
      User | null,
      any,
      Context
    > /** If null the group is read-only. Null for chats. */;
    messages?: MessagesResolver<(Message | null)[], any, Context>;
    unreadMessages?: UnreadMessagesResolver<
      number,
      any,
      Context
    > /** Computed property */;
    isGroup?: IsGroupResolver<boolean, any, Context> /** Computed property */;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type NameResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type PictureResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type AllTimeMembersResolver<
    R = User[],
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type ListingMembersResolver<
    R = User[],
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type ActualGroupMembersResolver<
    R = User[],
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type AdminsResolver<
    R = User[] | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type OwnerResolver<
    R = User | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type MessagesResolver<
    R = (Message | null)[],
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, MessagesArgs>;
  export interface MessagesArgs {
    amount?: number | null;
  }

  export type UnreadMessagesResolver<
    R = number,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type IsGroupResolver<
    R = boolean,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
}

export namespace MessageResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context>;
    sender?: SenderResolver<User, any, Context>;
    chat?: ChatResolver<Chat, any, Context>;
    content?: ContentResolver<string, any, Context>;
    createdAt?: CreatedAtResolver<string, any, Context>;
    type?: TypeResolver<
      number,
      any,
      Context
    > /** FIXME: should return MessageType */;
    recipients?: RecipientsResolver<
      Recipient[],
      any,
      Context
    > /** Whoever received the message */;
    holders?: HoldersResolver<
      User[],
      any,
      Context
    > /** Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */;
    ownership?: OwnershipResolver<
      boolean,
      any,
      Context
    > /** Computed property */;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type SenderResolver<R = User, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type ChatResolver<R = Chat, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type ContentResolver<
    R = string,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type CreatedAtResolver<
    R = string,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type TypeResolver<R = number, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type RecipientsResolver<
    R = Recipient[],
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type HoldersResolver<
    R = User[],
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type OwnershipResolver<
    R = boolean,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
}

export namespace RecipientResolvers {
  export interface Resolvers<Context = any> {
    user?: UserResolver<User, any, Context>;
    message?: MessageResolver<Message, any, Context>;
    chat?: ChatResolver<Chat, any, Context>;
    receivedAt?: ReceivedAtResolver<string | null, any, Context>;
    readAt?: ReadAtResolver<string | null, any, Context>;
  }

  export type UserResolver<R = User, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type MessageResolver<
    R = Message,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type ChatResolver<R = Chat, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type ReceivedAtResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type ReadAtResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
}

export namespace MutationResolvers {
  export interface Resolvers<Context = any> {
    addChat?: AddChatResolver<Chat | null, any, Context>;
    addGroup?: AddGroupResolver<Chat | null, any, Context>;
    removeChat?: RemoveChatResolver<string | null, any, Context>;
    addMessage?: AddMessageResolver<Message | null, any, Context>;
    removeMessages?: RemoveMessagesResolver<
      (string | null)[] | null,
      any,
      Context
    >;
    addMembers?: AddMembersResolver<(string | null)[] | null, any, Context>;
    removeMembers?: RemoveMembersResolver<
      (string | null)[] | null,
      any,
      Context
    >;
    addAdmins?: AddAdminsResolver<(string | null)[] | null, any, Context>;
    removeAdmins?: RemoveAdminsResolver<(string | null)[] | null, any, Context>;
    setGroupName?: SetGroupNameResolver<string | null, any, Context>;
    setGroupPicture?: SetGroupPictureResolver<string | null, any, Context>;
    markAsReceived?: MarkAsReceivedResolver<boolean | null, any, Context>;
    markAsRead?: MarkAsReadResolver<boolean | null, any, Context>;
  }

  export type AddChatResolver<
    R = Chat | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, AddChatArgs>;
  export interface AddChatArgs {
    recipientId: string;
  }

  export type AddGroupResolver<
    R = Chat | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, AddGroupArgs>;
  export interface AddGroupArgs {
    recipientIds: string[];
    groupName: string;
  }

  export type RemoveChatResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, RemoveChatArgs>;
  export interface RemoveChatArgs {
    chatId: string;
  }

  export type AddMessageResolver<
    R = Message | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, AddMessageArgs>;
  export interface AddMessageArgs {
    chatId: string;
    content: string;
  }

  export type RemoveMessagesResolver<
    R = (string | null)[] | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, RemoveMessagesArgs>;
  export interface RemoveMessagesArgs {
    chatId: string;
    messageIds?: (string | null)[] | null;
    all?: boolean | null;
  }

  export type AddMembersResolver<
    R = (string | null)[] | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, AddMembersArgs>;
  export interface AddMembersArgs {
    groupId: string;
    userIds: string[];
  }

  export type RemoveMembersResolver<
    R = (string | null)[] | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, RemoveMembersArgs>;
  export interface RemoveMembersArgs {
    groupId: string;
    userIds: string[];
  }

  export type AddAdminsResolver<
    R = (string | null)[] | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, AddAdminsArgs>;
  export interface AddAdminsArgs {
    groupId: string;
    userIds: string[];
  }

  export type RemoveAdminsResolver<
    R = (string | null)[] | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, RemoveAdminsArgs>;
  export interface RemoveAdminsArgs {
    groupId: string;
    userIds: string[];
  }

  export type SetGroupNameResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, SetGroupNameArgs>;
  export interface SetGroupNameArgs {
    groupId: string;
  }

  export type SetGroupPictureResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, SetGroupPictureArgs>;
  export interface SetGroupPictureArgs {
    groupId: string;
  }

  export type MarkAsReceivedResolver<
    R = boolean | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, MarkAsReceivedArgs>;
  export interface MarkAsReceivedArgs {
    chatId: string;
  }

  export type MarkAsReadResolver<
    R = boolean | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, MarkAsReadArgs>;
  export interface MarkAsReadArgs {
    chatId: string;
  }
}

export namespace SubscriptionResolvers {
  export interface Resolvers<Context = any> {
    messageAdded?: MessageAddedResolver<Message | null, any, Context>;
    chatAdded?: ChatAddedResolver<Chat | null, any, Context>;
  }

  export type MessageAddedResolver<
    R = Message | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, MessageAddedArgs>;
  export interface MessageAddedArgs {
    chatId?: string | null;
  }

  export type ChatAddedResolver<
    R = Chat | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
}

export namespace AddMessage {
  export type Variables = {
    chatId: string;
    content: string;
  };

  export type Mutation = {
    __typename?: "Mutation";
    addMessage?: AddMessage | null;
  };

  export type AddMessage = Message.Fragment;
}

export namespace GetChat {
  export type Variables = {
    chatId: string;
  };

  export type Query = {
    __typename?: "Query";
    chat?: Chat | null;
  };

  export type Chat = {
    __typename?: "Chat";
    messages: (Messages | null)[];
  } & ChatWithoutMessages.Fragment;

  export type Messages = Message.Fragment;
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

import { Injectable } from "@angular/core";

import * as Apollo from "apollo-angular";

import gql from "graphql-tag";

const ChatWithoutMessagesFragment = gql`
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

const MessageFragment = gql`
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
