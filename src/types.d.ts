/* tslint:disable */

export interface Query {
  users: User[]; 
  chats: Chat[]; 
  chat?: Chat | null; 
}

export interface User {
  id: number; 
  name?: string | null; 
  picture?: string | null; 
  phone?: string | null; 
}

export interface Chat {
  id: number; /* May be a chat or a group */
  name?: string | null; /* Computed for chats */
  picture?: string | null; /* Computed for chats */
  userIds: number[]; /* All members, current and past ones. */
  listingIds: number[]; /* Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group. */
  memberIds: number[]; /* Actual members of the group (they are not the only ones who get the group listed). Null for chats. */
  adminIds: number[]; /* Null for chats */
  ownerId: number; /* If null the group is read-only. Null for chats. */
  messages: Message[]; 
  lastMessage?: Message | null; /* Computed property */
  unreadMessages: number; /* Computed property */
  isGroup: boolean; /* Computed property */
}

export interface Message {
  id: number; 
  senderId: number; 
  sender: User; 
  content: string; 
  createdAt?: number | null; 
  type: number; /* FIXME: should return MessageType */
  recipients: Recipient[]; /* Whoever received the message */
  holderIds: number[]; /* Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */
  ownership: boolean; /* Computed property */
}

export interface Recipient {
  id: number; /* The user id */
  receivedAt?: number | null; 
  readAt?: number | null; 
}

export interface Mutation {
  addChat?: Chat | null; 
  removeChat?: boolean | null; 
  addMessage?: Message | null; 
  removeMessages?: boolean | null; 
  addMembers?: boolean | null; 
  removeMembers?: boolean | null; 
  addAdmins?: boolean | null; 
  removeAdmins?: boolean | null; 
  setGroupName?: boolean | null; 
  setGroupPicture?: string | null; 
  markAsReceived?: boolean | null; 
  markAsRead?: boolean | null; 
}
export interface ChatQueryArgs {
  chatId: number; 
}
export interface AddChatMutationArgs {
  recipientIds: number[]; 
  groupName?: string | null; 
}
export interface RemoveChatMutationArgs {
  chatId: number; 
}
export interface AddMessageMutationArgs {
  chatId: number; 
  content: string; 
}
export interface RemoveMessagesMutationArgs {
  chatId: number; 
  messageIds: number[]; 
  all?: boolean | null; 
}
export interface AddMembersMutationArgs {
  groupId: number; 
  userIds: number[]; 
}
export interface RemoveMembersMutationArgs {
  groupId: number; 
  userIds: number[]; 
}
export interface AddAdminsMutationArgs {
  groupId: number; 
  userIds: number[]; 
}
export interface RemoveAdminsMutationArgs {
  groupId: number; 
  userIds: number[]; 
}
export interface SetGroupNameMutationArgs {
  groupId: number; 
}
export interface SetGroupPictureMutationArgs {
  groupId: number; 
}
export interface MarkAsReceivedMutationArgs {
  chatId: number; 
}
export interface MarkAsReadMutationArgs {
  chatId: number; 
}

export type MessageType = "TEXT" | "LOCATION" | "PICTURE";

export namespace AddChat {
  export type Variables = {
    recipientIds: number[];
    groupName?: string | null;
  }

  export type Mutation = {
    addChat?: AddChat | null; 
  } 

  export type AddChat = {
    id: number; 
  } 
}
export namespace AddMessage {
  export type Variables = {
    chatId: number;
    content: string;
  }

  export type Mutation = {
    addMessage?: AddMessage | null; 
  } 

  export type AddMessage = {
    id: number; 
  } 
}
export namespace GetChat {
  export type Variables = {
    chatId: number;
  }

  export type Query = {
    chat?: Chat | null; 
  } 

  export type Chat = {
    id: number; 
    name?: string | null; 
    picture?: string | null; 
    isGroup: boolean; 
    messages: Messages[]; 
  } 

  export type Messages = {
    id: number; 
    senderId: number; 
    sender: Sender; 
    content: string; 
    createdAt?: number | null; 
    type: number; 
    recipients: Recipients[]; 
    ownership: boolean; 
  } 

  export type Sender = {
    id: number; 
    name?: string | null; 
  } 

  export type Recipients = {
    id: number; 
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
    id: number; 
    name?: string | null; 
    picture?: string | null; 
    unreadMessages: number; 
    lastMessage?: LastMessage | null; 
  } 

  export type LastMessage = {
    content: string; 
  } 
}
export namespace GetUsers {
  export type Variables = {
  }

  export type Query = {
    users: Users[]; 
  } 

  export type Users = {
    id: number; 
    name?: string | null; 
    picture?: string | null; 
  } 
}
