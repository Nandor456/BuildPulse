import { MessagingContext } from "@/context/MessagingSocketContext";
import { useContext } from "react";

export function useMessagingSocketContext() {
    return useContext(MessagingContext);
}