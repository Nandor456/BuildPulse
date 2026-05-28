import { randomBytes, randomUUID } from "crypto";
import { prisma } from "../../database/prisma.js";
import { buildInvitationEmail, sendEmail } from "./emailService.js";

const INVITATION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export type InvitationDTO = {
  id: string;
  email: string;
  role: string;
  companyId: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  inviteUrl: string;
};

function getAppBaseUrl(): string {
  return process.env.APP_BASE_URL || "http://localhost:5173";
}

function buildInviteUrl(token: string, email: string): string {
  const base = getAppBaseUrl().replace(/\/$/, "");
  const params = new URLSearchParams({ token, email });
  return `${base}/register?${params.toString()}`;
}

function computeStatus(invitation: {
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
}): InvitationStatus {
  if (invitation.acceptedAt) return "accepted";
  if (invitation.revokedAt) return "revoked";
  if (invitation.expiresAt.getTime() < Date.now()) return "expired";
  return "pending";
}

function toDTO(invitation: {
  id: string;
  email: string;
  role: string;
  companyId: string;
  token: string;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}): InvitationDTO {
  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    companyId: invitation.companyId,
    status: computeStatus(invitation),
    expiresAt: invitation.expiresAt.toISOString(),
    acceptedAt: invitation.acceptedAt ? invitation.acceptedAt.toISOString() : null,
    revokedAt: invitation.revokedAt ? invitation.revokedAt.toISOString() : null,
    createdAt: invitation.createdAt.toISOString(),
    inviteUrl: buildInviteUrl(invitation.token, invitation.email),
  };
}

export async function listInvitations(companyId: string): Promise<InvitationDTO[]> {
  const rows = await prisma.invitation.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDTO);
}

export async function createInvitation(params: {
  email: string;
  role: string;
  invitedById: string;
  companyId: string;
}): Promise<InvitationDTO> {
  const email = params.email.trim().toLowerCase();
  if (params.role === "ADMIN") {
    throw new Error("A company can have only one admin");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const activePending = await prisma.invitation.findFirst({
    where: {
      email,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (activePending) {
    throw new Error("An active invitation already exists for this email");
  }

  const token = randomBytes(32).toString("hex");
  const invitation = await prisma.invitation.create({
    data: {
      id: randomUUID(),
      email,
      companyId: params.companyId,
      role: params.role,
      token,
      invitedById: params.invitedById,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    },
  });

  const inviteUrl = buildInviteUrl(token, email);
  await sendEmail(buildInvitationEmail({ email, role: params.role, inviteUrl }));

  return toDTO(invitation);
}

export async function revokeInvitation(
  id: string,
  companyId: string,
): Promise<InvitationDTO> {
  const invitation = await prisma.invitation.findFirst({
    where: { id, companyId },
  });
  if (!invitation) throw new Error("Invitation not found");
  if (invitation.acceptedAt) throw new Error("Invitation already accepted");
  if (invitation.revokedAt) return toDTO(invitation);

  const updated = await prisma.invitation.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  return toDTO(updated);
}

export async function consumeInvitationToken(params: {
  token: string;
  email: string;
}): Promise<{ role: string; companyId: string } | null> {
  const invitation = await prisma.invitation.findUnique({
    where: { token: params.token },
  });
  if (!invitation) return null;
  if (invitation.acceptedAt || invitation.revokedAt) return null;
  if (invitation.expiresAt.getTime() < Date.now()) return null;
  if (invitation.email.toLowerCase() !== params.email.trim().toLowerCase()) {
    return null;
  }

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date() },
  });

  return { role: invitation.role, companyId: invitation.companyId };
}
