import { useMessagingSocketContext } from "@/hooks/useMessagingSocketContext";

export function useMessagingSocket() {
  const { socket, isConnected } = useMessagingSocketContext();

  function sendMessage(opts: {
    chatId: string;
    body: string;
    replyToId?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentType?: string;
    clientNonce?: string;
  }) {
    socket?.emit("message:send", opts);
  }

  function sendTyping(chatId: string, isTyping: boolean) {
    socket?.emit("message:typing", { chatId, isTyping });
  }

  function markRead(chatId: string) {
    socket?.emit("chat:read", { chatId });
  }

  function joinChat(chatId: string) {
    socket?.emit("chat:join", { chatId });
  }

  function onTyping(
    handler: (data: { chatId: string; userId: string; isTyping: boolean }) => void
  ) {
    socket?.on("typing", handler);
    return () => {
      socket?.off("typing", handler);
    };
  }

  function onMessageRead(
    handler: (data: { chatId: string; userId: string; lastReadAt: string }) => void
  ) {
    socket?.on("message:read", handler);
    return () => {
      socket?.off("message:read", handler);
    };
  }

  return { isConnected, sendMessage, sendTyping, markRead, joinChat, onTyping, onMessageRead };
}
