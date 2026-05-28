import { prisma } from "../../database/prisma.js";
import { randomUUID } from "crypto";

type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  companyId: string;
};

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    billingStatus: string;
  };
};

export type CreateUserInput = {
  username: string;
  email: string;
  passwordHash: string;
  companyId: string;
  role?: string;
};

export async function findByUsername(username: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { username },
  });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      id: randomUUID(),
      username: input.username,
      email: input.email,
      password: input.passwordHash,
      role: input.role ?? "WORKER",
      companyId: input.companyId,
    },
  });
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
          billingStatus: true,
        },
      },
    },
  });
  return user;
}
