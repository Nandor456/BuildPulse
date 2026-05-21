import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "../types/UserTypes";
import {
  AuthContext,
  type AuthContextValue,
  type MeResponse,
} from "../context/auth-context";
import { resetUserScopedQueries } from "../services/queryClient";
import { api, UNAUTHORIZED_EVENT_NAME } from "../services/api/axios";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<MeResponse>("/auth/user");
      if ("user" in data) setUser(data.user);
      else setUser(null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await refreshUser();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      void (async () => {
        await resetUserScopedQueries(queryClient);
        setUser(null);
        setIsLoading(false);
      })();
    };

    window.addEventListener(UNAUTHORIZED_EVENT_NAME, handleUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT_NAME, handleUnauthorized);
    };
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      await resetUserScopedQueries(queryClient);
      setUser(null);
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      refreshUser,
      logout,
    };
  }, [user, isLoading, refreshUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
