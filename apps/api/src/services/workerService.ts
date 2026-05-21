import { prisma } from "../../database/prisma.js";
import {
  getOrCreateWorkPointChat,
  addParticipantToChat,
  removeParticipantFromChat,
} from "./messagingService.js";

export type WorkerSummary = {
  id: string;
  username: string;
  email: string;
  role: string;
  assignedWorkPointCount: number;
  hourlyWage: number | null;
};

export type WorkerStats = WorkerSummary;


export async function listWorkers(): Promise<WorkerSummary[]> {
  const workers = await prisma.user.findMany({
    where: { role: "WORKER" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      hourlyWage: true,
      _count: { select: { assignedWorkPoints: true } },
    },
    orderBy: { username: "asc" },
  });

  return workers.map((w) => ({
    id: w.id,
    username: w.username,
    email: w.email,
    role: w.role,
    hourlyWage: w.hourlyWage,
    assignedWorkPointCount: w._count.assignedWorkPoints,
  }));
}

export async function listWorkersForWorkPoint(
  workPointId: string,
): Promise<WorkerStats[]> {
  const workPoint = await prisma.workPoint.findUnique({
    where: { id: workPointId },
    select: {
      workers: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          hourlyWage: true,
          _count: { select: { assignedWorkPoints: true } },
        },
        orderBy: { username: "asc" },
      },
    },
  });

  if (!workPoint) return [];

  return workPoint.workers.map((w) => ({
    id: w.id,
    username: w.username,
    email: w.email,
    role: w.role,
    hourlyWage: w.hourlyWage,
    assignedWorkPointCount: w._count.assignedWorkPoints,
  }));
}

export async function assignWorkerToWorkPoint(
  workPointId: string,
  workerId: string,
  assignedByUserId?: string,
): Promise<void> {
  const worker = await prisma.user.findUnique({
    where: { id: workerId },
    select: { role: true },
  });
  if (!worker) {
    throw new Error("User not found");
  }
  if (worker.role !== "WORKER") {
    throw new Error("Only users with the WORKER role can be assigned");
  }

  await prisma.workPoint.update({
    where: { id: workPointId },
    data: { workers: { connect: { id: workerId } } },
  });

  const chatId = await getOrCreateWorkPointChat(workPointId);
  await addParticipantToChat(chatId, workerId);
  if (assignedByUserId) {
    await addParticipantToChat(chatId, assignedByUserId);
  }
}

export async function removeWorkerFromWorkPoint(
  workPointId: string,
  workerId: string,
): Promise<void> {
  await prisma.workPoint.update({
    where: { id: workPointId },
    data: {
      workers: { disconnect: { id: workerId } },
    },
  });

  const existingChat = await prisma.chat.findUnique({
    where: { workPointId },
    select: { id: true },
  });
  if (existingChat) {
    await removeParticipantFromChat(existingChat.id, workerId);
  }
}

export async function updateWorker(
  workerId: string,
  data: { username?: string; email?: string; role?: string; hourlyWage?: number | null },
): Promise<WorkerSummary> {
  const worker = await prisma.user.update({
    where: { id: workerId },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      hourlyWage: true,
      _count: { select: { assignedWorkPoints: true } },
    },
  });
  return {
    id: worker.id,
    username: worker.username,
    email: worker.email,
    role: worker.role,
    hourlyWage: worker.hourlyWage,
    assignedWorkPointCount: worker._count.assignedWorkPoints,
  };
}

export async function deleteWorker(workerId: string): Promise<void> {
  await prisma.user.delete({ where: { id: workerId } });
}
