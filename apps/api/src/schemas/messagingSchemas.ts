import { z } from "zod";

const uuidSchema = z.string().uuid("Must be a valid UUID");

export const sendMessageSchema = z.object({
  params: z.object({ chatId: uuidSchema }),
  body: z.object({
    body: z.string().max(4000),
    replyToId: uuidSchema.optional(),
    attachmentUrl: z.string().optional(),
    attachmentName: z.string().optional(),
    attachmentType: z.string().optional(),
    clientNonce: z.string().optional(),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({ chatId: uuidSchema }),
  query: z.object({
    cursor: z.string().datetime().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const createDirectChatSchema = z.object({
  body: z.object({
    userId: uuidSchema,
  }),
});

export const markReadSchema = z.object({
  params: z.object({ chatId: uuidSchema }),
});
