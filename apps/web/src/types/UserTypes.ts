type UserRole =
  | "ADMIN"
  | "LEADER"
  | "WORKER";

type User = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
};

export type { User, UserRole };
