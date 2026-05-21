export type ChatType = "DIRECT" | "GROUP" | "WORKPOINT";

export interface ChatParticipant {
  id: string;
  username: string;
}

export interface LastMessage {
  id: string;
  body: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
  attachmentName?: string;
}

export interface ChatListItem {
  id: string;
  type: ChatType;
  name: string;
  workPointId?: string;
  lastMessage?: LastMessage;
  lastMessageAt?: string;
  unreadCount: number;
  participants: ChatParticipant[];
  otherUserId?: string;
}

export interface ReplyTo {
  id: string;
  body: string;
  senderUsername: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  body: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  replyToId?: string;
  replyTo?: ReplyTo;
  createdAt: string;
  editedAt?: string;
  clientNonce?: string;
  pending?: boolean;
}

export interface MessagesPage {
  messages: Message[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface ChatUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface UploadedAttachment {
  attachmentUrl: string;
  attachmentName: string;
  attachmentType: string;
}
