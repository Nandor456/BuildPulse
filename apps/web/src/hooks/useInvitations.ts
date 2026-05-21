import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  invitationAPI,
  type InvitationRole,
} from "../services/api/invitationApi";
import { QUERY_KEYS } from "../services/queryClient";

export const useInvitations = () => {
  return useQuery({
    queryKey: QUERY_KEYS.invitations.all,
    queryFn: () => invitationAPI.list(),
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; role: InvitationRole }) =>
      invitationAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invitations.all });
    },
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationAPI.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invitations.all });
    },
  });
};
