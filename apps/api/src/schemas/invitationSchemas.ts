import { z } from "zod";

export const INVITABLE_ROLES = [
  "WORKER",
  "LEADER",
] as const;

export const createInvitationSchema = z.object({
  body: z.object({
    email: z.string().email().max(254),
    role: z.enum(INVITABLE_ROLES),
  }),
});

export const revokeInvitationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
