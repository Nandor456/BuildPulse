import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/services/api/messagingApi";
import { QUERY_KEYS } from "@/services/queryClient";
import type { ChatListItem, Message } from "@/types/messaging";

export function useChats() {
  return useQuery({
    queryKey: QUERY_KEYS.messaging.chats,
    queryFn: () => messagingApi.listChats(),
  });
}

export function useCreateDirectChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => messagingApi.createDirectChat(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.messaging.chats });
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => messagingApi.markRead(chatId),
    onSuccess: (_data, chatId) => {
      qc.setQueryData<ChatListItem[]>(QUERY_KEYS.messaging.chats, (old) =>
        old?.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
      );
    },
  });
}

export function useSendMessage(chatId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: {
      body: string;
      replyToId?: string;
      attachmentUrl?: string;
      attachmentName?: string;
      attachmentType?: string;
      clientNonce?: string;
    }) => messagingApi.sendMessage(chatId, opts.body, opts),
    onSuccess: (message: Message) => {
      qc.setQueryData<ChatListItem[]>(QUERY_KEYS.messaging.chats, (old) =>
        old?.map((c) =>
          c.id === chatId
            ? {
                ...c,
                lastMessage: {
                  id: message.id,
                  body: message.body,
                  senderId: message.senderId,
                  senderUsername: message.senderUsername,
                  createdAt: message.createdAt,
                  attachmentName: message.attachmentName,
                },
                lastMessageAt: message.createdAt,
                unreadCount: 0,
              }
            : c
        )
      );
    },
  });
}

export function useUploadAttachment(chatId: string) {
  return useMutation({
    mutationFn: (file: File) => messagingApi.uploadAttachment(chatId, file),
  });
}

export function useMessagingUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.messaging.users,
    queryFn: () => messagingApi.listUsers(),
    staleTime: 60_000,
  });
}
