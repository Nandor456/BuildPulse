import { api } from "./axios";

export type InvitationRole = "LEADER" | "WORKER";

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export interface Invitation {
  id: string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  inviteUrl: string;
}

export const invitationAPI = {
  async list(): Promise<Invitation[]> {
    const res = await api.get<{ invitations: Invitation[] }>("/invitations");
    return res.data.invitations;
  },

  async create(input: {
    email: string;
    role: InvitationRole;
  }): Promise<Invitation> {
    const res = await api.post<{ invitation: Invitation }>(
      "/invitations",
      input,
    );
    return res.data.invitation;
  },

  async revoke(id: string): Promise<Invitation> {
    const res = await api.delete<{ invitation: Invitation }>(
      `/invitations/${id}`,
    );
    return res.data.invitation;
  },
};
