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

export interface Mutation {
  addChat?: Chat | null; 
  addGroup?: Chat | null; 
  removeChat?: string | null; 
  addMessage?: Message | null; 
  removeMessages?: string[] | null; 
  addMembers?: string[] | null; 
  removeMembers?: string[] | null; 
  addAdmins?: string[] | null; 
  removeAdmins?: string[] | null; 
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
  messageIds?: string[] | null; 
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

export type MessageType = "LOCATION" | "TEXT" | "PICTURE";

export namespace AddChat {
  export type Variables = {
    recipientId: string;
  }

  export type Mutation = {
    addChat?: AddChat | null; 
  } 

  export type AddChat = {
    messages: Messages[]; 
  } & ChatWithoutMessages.Fragment

  export type Messages = Message.Fragment
}
export namespace AddGroup {
  export type Variables = {
    recipientIds: string[];
    groupName: string;
  }

  export type Mutation = {
    addGroup?: AddGroup | null; 
  } 

  export type AddGroup = {
    messages: Messages[]; 
  } & ChatWithoutMessages.Fragment

  export type Messages = Message.Fragment
}
export namespace AddMessage {
  export type Variables = {
    chatId: string;
    content: string;
  }

  export type Mutation = {
    addMessage?: AddMessage | null; 
  } 

  export type AddMessage = Message.Fragment
}
export namespace ChatAdded {
  export type Variables = {
  }

  export type Subscription = {
    chatAdded?: ChatAdded | null; 
  } 

  export type ChatAdded = {
    messages: Messages[]; 
  } & ChatWithoutMessages.Fragment

  export type Messages = Message.Fragment
}
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
export namespace GetUsers {
  export type Variables = {
  }

  export type Query = {
    users: Users[]; 
  } 

  export type Users = {
    id: string; 
    name?: string | null; 
    picture?: string | null; 
  } 
}
export namespace MessageAdded {
  export type Variables = {
    chatId?: string | null;
  }

  export type Subscription = {
    messageAdded?: MessageAdded | null; 
  } 

  export type MessageAdded = {
    chat: Chat; 
  } & Message.Fragment

  export type Chat = {
    id: string; 
  } 
}
export namespace RemoveAllMessages {
  export type Variables = {
    chatId: string;
    all?: boolean | null;
  }

  export type Mutation = {
    removeMessages?: string[] | null; 
  } 
}
export namespace RemoveChat {
  export type Variables = {
    chatId: string;
  }

  export type Mutation = {
    removeChat?: string | null; 
  } 
}
export namespace RemoveMessages {
  export type Variables = {
    chatId: string;
    messageIds?: string[] | null;
  }

  export type Mutation = {
    removeMessages?: string[] | null; 
  } 
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
