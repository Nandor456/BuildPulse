import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../database/prisma.js";
import { log } from "console";

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.session?.userId) return next();
  log("Unauthorized access attempt. No userId in session.");
  return res.status(401).json({ error: "Unauthorized" });
}

export function ensureRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
