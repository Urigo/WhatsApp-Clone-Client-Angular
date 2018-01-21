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
  userIds: string[]; /* All members, current and past ones. */
  listingIds: string[]; /* Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group. */
  memberIds: string[]; /* Actual members of the group (they are not the only ones who get the group listed). Null for chats. */
  adminIds: string[]; /* Null for chats */
  ownerId: string; /* If null the group is read-only. Null for chats. */
  messages: Message[]; 
  lastMessage?: Message | null; /* Computed property */
  unreadMessages: number; /* Computed property */
  isGroup: boolean; /* Computed property */
}

export interface Message {
  id: string; 
  senderId: string; 
  sender: User; 
  content: string; 
  createdAt?: number | null; 
  type: number; /* FIXME: should return MessageType */
  recipients: Recipient[]; /* Whoever received the message */
  holderIds: string[]; /* Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */
  ownership: boolean; /* Computed property */
}

export interface Recipient {
  id: string; /* The user id */
  receivedAt?: number | null; 
  readAt?: number | null; 
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
export interface ChatQueryArgs {
  chatId: string; 
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

export type MessageType = "TEXT" | "LOCATION" | "PICTURE";

export namespace AddMessage {
  export type Variables = {
    chatId: string;
    content: string;
  }

  export type Mutation = {
    addMessage?: AddMessage | null; 
  } 

  export type AddMessage = {
    id: string; 
    senderId: string; 
    sender: Sender; 
    content: string; 
    createdAt?: number | null; 
    type: number; 
    recipients: Recipients[]; 
    ownership: boolean; 
  } 

  export type Sender = {
    id: string; 
    name?: string | null; 
  } 

  export type Recipients = {
    id: string; 
    receivedAt?: number | null; 
    readAt?: number | null; 
  } 
}
export namespace GetChat {
  export type Variables = {
    chatId: string;
  }

  export type Query = {
    chat?: Chat | null; 
  } 

  export type Chat = {
    id: string; 
    name?: string | null; 
    picture?: string | null; 
    isGroup: boolean; 
    messages: Messages[]; 
  } 

  export type Messages = {
    id: string; 
    senderId: string; 
    sender: Sender; 
    content: string; 
    createdAt?: number | null; 
    type: number; 
    recipients: Recipients[]; 
    ownership: boolean; 
  } 

  export type Sender = {
    id: string; 
    name?: string | null; 
  } 

  export type Recipients = {
    id: string; 
    receivedAt?: number | null; 
    readAt?: number | null; 
  } 
}
export namespace GetChats {
  export type Variables = {
  }

  export type Query = {
    chats: Chats[]; 
  } 

  export type Chats = {
    id: string; 
    name?: string | null; 
    picture?: string | null; 
    userIds: string[]; 
    unreadMessages: number; 
    lastMessage?: LastMessage | null; 
    isGroup: boolean; 
  } 

  export type LastMessage = {
    id: string; 
    senderId: string; 
    sender: Sender; 
    content: string; 
    createdAt?: number | null; 
    type: number; 
    recipients: Recipients[]; 
    ownership: boolean; 
  } 

  export type Sender = {
    id: string; 
    name?: string | null; 
  } 

  export type Recipients = {
    id: string; 
    receivedAt?: number | null; 
    readAt?: number | null; 
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
