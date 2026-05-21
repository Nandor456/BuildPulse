import { useMessagingSocketContext } from "@/hooks/useMessagingSocketContext";

export function usePresence(userId?: string): boolean {
  const { onlineUsers } = useMessagingSocketContext();
  if (!userId) return false;
  return onlineUsers.has(userId);
}
