import bcrypt from "bcryptjs";
import { prisma } from "../../database/prisma.js";
import {
  createUser,
  findByUsername,
  type CreateUserInput,
} from "./userService.js";
import { consumeInvitationToken } from "./invitationService.js";

type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
};

export async function register(
  username: string,
  email: string,
  password: string,
  token?: string,
): Promise<User> {
  const existing = await findByUsername(username);
  if (existing) throw new Error("Username already taken");

  const userCount = await prisma.user.count();
  let role: string;

  if (userCount === 0) {
    // First registered user bootstraps the system as ADMIN.
    role = "ADMIN";
  } else {
    if (!token) {
      throw new Error("An invitation token is required to register");
    }
    const consumed = await consumeInvitationToken({ token, email });
    if (!consumed) {
      throw new Error("Invitation is invalid, expired, or does not match this email");
    }
    role = consumed.role;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: CreateUserInput = { username, email, passwordHash, role };
  return createUser(user);
}

export async function validateCredentials(
  username: string,
  password: string,
): Promise<User | null> {
  const user = await findByUsername(username);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  return ok ? user : null;
}
