type UserRole =
  | "ADMIN"
  | "LEADER"
  | "WORKER";

type User = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  companyId: string;
  company: {
    id: string;
    name: string;
    billingStatus: string;
  };
};

export type { User, UserRole };
