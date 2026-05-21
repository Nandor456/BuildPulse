import { createContext } from "react";
import type { User } from "../types/UserTypes";

export type MeResponse = { user: User } | { error: string };

export type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
