import type { Request, Response } from "express";
import { register, validateCredentials } from "../services/authService.js";
import { log } from "node:console";
import { getUserById } from "../services/userService.js";

export async function registerController(req: Request, res: Response) {
  const { username, email, password, token } = req.body as {
    username: string;
    email: string;
    password: string;
    token?: string;
  };
  try {
    const user = await register(username, email, password, token);
    req.session.userId = user.id;
    res.status(201).json({ id: user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    res.status(400).json({ error: message });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    log("Login attempt for username:", req.body.username);
    const { username, password } = req.body as {
      username: string;
      password: string;
    };
    const user = await validateCredentials(username, password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    req.session.userId = user.id;
    log("Login successful for user:", user.id);

    res.json({ id: user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    res.status(500).json({ error: message });
  }
}

export function logoutController(req: Request, res: Response) {
  req.session.destroy((err: Error | null) => {
    if (err) return res.status(500).json({ error: "Logout failed" });

    res.clearCookie("connect.sid");
    res.status(204).send();
  });
}

export async function meController(req: Request, res: Response) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Unauthorized" });

  const user = await getUserById(req.session.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
}
