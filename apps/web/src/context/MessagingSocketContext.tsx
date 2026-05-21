import {
  createContext,
} from "react";
import { type Socket } from "socket.io-client";


interface MessagingSocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}


export const MessagingContext = createContext<MessagingSocketContextValue>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
});
