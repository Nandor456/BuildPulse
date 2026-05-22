import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  workPointAPI,
  type WorkPointInput,
  type WorkPointUpdate,
} from "../services/api/workPointApi";
import { QUERY_KEYS } from "../services/queryClient";

export const useWorkPoints = () =>
  useQuery({
    queryKey: QUERY_KEYS.workPoints.all,
    queryFn: () => workPointAPI.list(),
  });

export const useMyAssignedWorkPoints = () =>
  useQuery({
    queryKey: QUERY_KEYS.workPoints.assignedToMe,
    queryFn: () => workPointAPI.listAssignedToMe(),
  });

export const useWorkPoint = (workPointId: string | null) =>
  useQuery({
    queryKey: workPointId
      ? QUERY_KEYS.workPoints.detail(workPointId)
      : ["workpoints", "__disabled__"],
    queryFn: () => workPointAPI.get(workPointId!),
    enabled: Boolean(workPointId),
  });

export const useCreateWorkPoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WorkPointInput) => workPointAPI.create(data),
    onSuccess: (workPoint) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workPoints.all });
      queryClient.setQueryData(QUERY_KEYS.workPoints.detail(workPoint.id), workPoint);
    },
  });
};

export const useUpdateWorkPoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkPointUpdate }) =>
      workPointAPI.update(id, data),
    onSuccess: (workPoint) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workPoints.all });
      queryClient.setQueryData(QUERY_KEYS.workPoints.detail(workPoint.id), workPoint);
    },
  });
};

export const useDeleteWorkPoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workPointAPI.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workPoints.all });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.workPoints.detail(id) });
    },
  });
};
