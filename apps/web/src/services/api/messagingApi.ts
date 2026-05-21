import { api } from "./axios";
import type {
  ChatListItem,
  MessagesPage,
  Message,
  ChatUser,
  UploadedAttachment,
} from "../../types/messaging";

export const messagingApi = {
  listChats: async (): Promise<ChatListItem[]> => {
    const res = await api.get<ChatListItem[]>("/messaging/chats");
    return res.data;
  },

  createDirectChat: async (userId: string): Promise<{ chatId: string }> => {
    const res = await api.post<{ chatId: string }>("/messaging/chats/direct", { userId });
    return res.data;
  },

  getMessages: async (
    chatId: string,
    cursor?: string,
    limit?: number
  ): Promise<MessagesPage> => {
    const res = await api.get<MessagesPage>(`/messaging/chats/${chatId}/messages`, {
      params: { cursor, limit },
    });
    return res.data;
  },

  sendMessage: async (
    chatId: string,
    body: string,
    opts: {
      replyToId?: string;
      attachmentUrl?: string;
      attachmentName?: string;
      attachmentType?: string;
      clientNonce?: string;
    } = {}
  ): Promise<Message> => {
    const res = await api.post<Message>(`/messaging/chats/${chatId}/messages`, {
      body,
      ...opts,
    });
    return res.data;
  },

  markRead: async (chatId: string): Promise<void> => {
    await api.post(`/messaging/chats/${chatId}/read`);
  },

  uploadAttachment: async (chatId: string, file: File): Promise<UploadedAttachment> => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<UploadedAttachment>(
      `/messaging/chats/${chatId}/attachment`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  listUsers: async (): Promise<ChatUser[]> => {
    const res = await api.get<ChatUser[]>("/messaging/users");
    return res.data;
  },
};
