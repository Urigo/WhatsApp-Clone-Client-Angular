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

export type Date = any;

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
  id: string;
  name?: string | null;
  picture?: string | null;
  allTimeMembers: User[];
  listingMembers: User[];
  actualGroupMembers: User[];
  admins?: User[] | null;
  owner?: User | null;
  messages: (Message | null)[];
  messageFeed?: MessageFeed | null;
  unreadMessages: number;
  isGroup: boolean;
}

export interface Message {
  id: string;
  sender: User;
  chat: Chat;
  content: string;
  createdAt: Date;
  type: number;
  recipients: Recipient[];
  holders: User[];
  ownership: boolean;
}

export interface Recipient {
  user: User;
  message: Message;
  chat: Chat;
  receivedAt?: Date | null;
  readAt?: Date | null;
}

export interface MessageFeed {
  hasNextPage: boolean;
  cursor?: string | null;
  messages: (Message | null)[];
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
  before?: string | null;
}
export interface MessageFeedChatArgs {
  amount?: number | null;
  before?: string | null;
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
    id?: IdResolver<string, any, Context>;
    name?: NameResolver<string | null, any, Context>;
    picture?: PictureResolver<string | null, any, Context>;
    allTimeMembers?: AllTimeMembersResolver<User[], any, Context>;
    listingMembers?: ListingMembersResolver<User[], any, Context>;
    actualGroupMembers?: ActualGroupMembersResolver<User[], any, Context>;
    admins?: AdminsResolver<User[] | null, any, Context>;
    owner?: OwnerResolver<User | null, any, Context>;
    messages?: MessagesResolver<(Message | null)[], any, Context>;
    messageFeed?: MessageFeedResolver<MessageFeed | null, any, Context>;
    unreadMessages?: UnreadMessagesResolver<number, any, Context>;
    isGroup?: IsGroupResolver<boolean, any, Context>;
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
    before?: string | null;
  }

  export type MessageFeedResolver<
    R = MessageFeed | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context, MessageFeedArgs>;
  export interface MessageFeedArgs {
    amount?: number | null;
    before?: string | null;
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
    createdAt?: CreatedAtResolver<Date, any, Context>;
    type?: TypeResolver<number, any, Context>;
    recipients?: RecipientsResolver<Recipient[], any, Context>;
    holders?: HoldersResolver<User[], any, Context>;
    ownership?: OwnershipResolver<boolean, any, Context>;
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
    R = Date,
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
    receivedAt?: ReceivedAtResolver<Date | null, any, Context>;
    readAt?: ReadAtResolver<Date | null, any, Context>;
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
    R = Date | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type ReadAtResolver<
    R = Date | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
}

export namespace MessageFeedResolvers {
  export interface Resolvers<Context = any> {
    hasNextPage?: HasNextPageResolver<boolean, any, Context>;
    cursor?: CursorResolver<string | null, any, Context>;
    messages?: MessagesResolver<(Message | null)[], any, Context>;
  }

  export type HasNextPageResolver<
    R = boolean,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type CursorResolver<
    R = string | null,
    Parent = any,
    Context = any
  > = Resolver<R, Parent, Context>;
  export type MessagesResolver<
    R = (Message | null)[],
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
    createdAt: Date;
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
    receivedAt?: Date | null;
    readAt?: Date | null;
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
