import { prisma } from "../../database/prisma.js";
import { todayInZone } from "../utils/dateHelpers.js";
import QRCode from "qrcode";

export type AttendanceRecord = {
  id: string;
  workerId: string;
  workPointId: string;
  date: Date;
  checkedInAt: Date;
  checkedOutAt: Date | null;
  source: string;
  worker: { id: string; username: string; email: string };
};

export type AttendanceSummary = {
  workerId: string;
  username: string;
  email: string;
  totalDays: number;
  completeDays: number;
  totalHours: number;
  totalEarnings: number | null;
  firstDate: Date | null;
  lastDate: Date | null;
};

export type ScanResult =
  | { event: "CHECK_IN"; workPointName: string; date: Date; checkedInAt: Date }
  | {
      event: "CHECK_OUT";
      workPointName: string;
      date: Date;
      checkedInAt: Date;
      checkedOutAt: Date;
      hours: number;
      earnings: number | null;
    };

export type DailyStatRow = {
  id: string;
  date: Date;
  workPoint: { id: string; name: string };
  checkedInAt: Date;
  checkedOutAt: Date | null;
  hours: number;
  earnings: number;
  complete: boolean;
};

export type MonthlySummary = {
  totalDays: number;
  completeDays: number;
  totalHours: number;
  totalEarnings: number;
  hourlyWage: number | null;
};

function computeHours(checkedInAt: Date, checkedOutAt: Date): number {
  const ms = checkedOutAt.getTime() - checkedInAt.getTime();
  return Math.max(0, ms / (1000 * 60 * 60));
}

export async function recordAttendance(params: {
  userId: string;
  qrToken: string;
  source: "QR" | "MANUAL";
}): Promise<ScanResult> {
  const workPoint = await prisma.workPoint.findUnique({
    where: { qrToken: params.qrToken },
    select: {
      id: true,
      name: true,
      workers: { where: { id: params.userId }, select: { id: true } },
    },
  });

  if (!workPoint) {
    const err = new Error("Invalid QR token");
    (err as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw err;
  }

  if (workPoint.workers.length === 0) {
    const err = new Error("You are not assigned to this workpoint");
    (err as NodeJS.ErrnoException).code = "FORBIDDEN";
    throw err;
  }

  const date = todayInZone();

  const existing = await prisma.attendance.findUnique({
    where: {
      workerId_workPointId_date: {
        workerId: params.userId,
        workPointId: workPoint.id,
        date,
      },
    },
    select: { id: true, checkedInAt: true, checkedOutAt: true },
  });

  if (!existing) {
    const record = await prisma.attendance.create({
      data: {
        workerId: params.userId,
        workPointId: workPoint.id,
        date,
        source: params.source,
      },
      select: { checkedInAt: true },
    });
    return {
      event: "CHECK_IN",
      workPointName: workPoint.name,
      date,
      checkedInAt: record.checkedInAt,
    };
  }

  if (existing.checkedOutAt !== null) {
    const err = new Error("Already completed today");
    (err as NodeJS.ErrnoException).code = "ALREADY_COMPLETED";
    throw err;
  }

  const checkedOutAt = new Date();
  const hours = computeHours(existing.checkedInAt, checkedOutAt);

  const worker = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { hourlyWage: true },
  });

  await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkedOutAt },
  });

  const earnings =
    worker?.hourlyWage != null ? hours * worker.hourlyWage : null;

  return {
    event: "CHECK_OUT",
    workPointName: workPoint.name,
    date,
    checkedInAt: existing.checkedInAt,
    checkedOutAt,
    hours,
    earnings,
  };
}

export async function listAttendance(params: {
  workPointId: string;
  from?: Date;
  to?: Date;
}): Promise<AttendanceRecord[]> {
  return prisma.attendance.findMany({
    where: {
      workPointId: params.workPointId,
      ...(params.from || params.to
        ? {
            date: {
              ...(params.from ? { gte: params.from } : {}),
              ...(params.to ? { lte: params.to } : {}),
            },
          }
        : {}),
    },
    select: {
      id: true,
      workerId: true,
      workPointId: true,
      date: true,
      checkedInAt: true,
      checkedOutAt: true,
      source: true,
      worker: { select: { id: true, username: true, email: true } },
    },
    orderBy: [{ date: "desc" }, { checkedInAt: "desc" }],
  });
}

export async function manualMark(params: {
  workerId: string;
  workPointId: string;
  date: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
}): Promise<AttendanceRecord> {
  const checkedInAt = params.checkedInAt ?? new Date();
  if (params.checkedOutAt && params.checkedOutAt <= checkedInAt) {
    const err = new Error("Check-out time must be after check-in time");
    (err as NodeJS.ErrnoException).code = "INVALID";
    throw err;
  }

  try {
    return await prisma.attendance.create({
      data: {
        workerId: params.workerId,
        workPointId: params.workPointId,
        date: params.date,
        checkedInAt,
        source: "MANUAL",
        ...(params.checkedOutAt ? { checkedOutAt: params.checkedOutAt } : {}),
      },
      select: {
        id: true,
        workerId: true,
        workPointId: true,
        date: true,
        checkedInAt: true,
        checkedOutAt: true,
        source: true,
        worker: { select: { id: true, username: true, email: true } },
      },
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      const conflict = new Error("Attendance already exists for this day");
      (conflict as NodeJS.ErrnoException).code = "DUPLICATE";
      throw conflict;
    }
    throw err;
  }
}

export async function setCheckoutTime(
  attendanceId: string,
  checkedOutAt: Date,
): Promise<AttendanceRecord> {
  const record = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    select: { checkedInAt: true },
  });

  if (!record) {
    const err = new Error("Attendance record not found");
    (err as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw err;
  }

  if (checkedOutAt <= record.checkedInAt) {
    const err = new Error("Check-out time must be after check-in time");
    (err as NodeJS.ErrnoException).code = "INVALID";
    throw err;
  }

  return prisma.attendance.update({
    where: { id: attendanceId },
    data: { checkedOutAt },
    select: {
      id: true,
      workerId: true,
      workPointId: true,
      date: true,
      checkedInAt: true,
      checkedOutAt: true,
      source: true,
      worker: { select: { id: true, username: true, email: true } },
    },
  });
}

export async function removeAttendance(id: string): Promise<void> {
  await prisma.attendance.delete({ where: { id } });
}

export async function getQrForWorkPoint(params: {
  workPointId: string;
  frontendBaseUrl: string;
}): Promise<{ qrToken: string; qrPng: string }> {
  const workPoint = await prisma.workPoint.findUnique({
    where: { id: params.workPointId },
    select: { qrToken: true },
  });

  if (!workPoint) {
    const err = new Error("Workpoint not found");
    (err as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw err;
  }

  const url = `${params.frontendBaseUrl}/checkin/${workPoint.qrToken}`;
  const qrPng = await QRCode.toDataURL(url, { width: 512, margin: 2 });

  return { qrToken: workPoint.qrToken, qrPng };
}

export async function rotateQrToken(workPointId: string): Promise<{
  qrToken: string;
  qrPng: string;
  frontendBaseUrl: string;
}> {
  const workPoint = await prisma.workPoint.findUnique({
    where: { id: workPointId },
    select: { id: true },
  });
  if (!workPoint) {
    const err = new Error("Workpoint not found");
    (err as NodeJS.ErrnoException).code = "NOT_FOUND";
    throw err;
  }

  const updated = await prisma.workPoint.update({
    where: { id: workPointId },
    data: { qrToken: crypto.randomUUID() },
    select: { qrToken: true },
  });

  return { qrToken: updated.qrToken, qrPng: "", frontendBaseUrl: "" };
}

export async function getAttendanceSummary(
  workPointId: string,
): Promise<AttendanceSummary[]> {
  const assignedWorkers = await prisma.workPoint.findUnique({
    where: { id: workPointId },
    select: {
      workers: {
        select: {
          id: true,
          username: true,
          email: true,
          hourlyWage: true,
        },
      },
    },
  });

  if (!assignedWorkers) return [];

  const records = await prisma.attendance.findMany({
    where: { workPointId },
    select: {
      workerId: true,
      date: true,
      checkedInAt: true,
      checkedOutAt: true,
    },
    orderBy: { date: "asc" },
  });

  const byWorker = new Map<
    string,
    { dates: Date[]; totalHours: number }
  >();

  for (const r of records) {
    if (!byWorker.has(r.workerId)) byWorker.set(r.workerId, { dates: [], totalHours: 0 });
    const entry = byWorker.get(r.workerId)!;
    entry.dates.push(r.date);
    if (r.checkedOutAt) {
      entry.totalHours += computeHours(r.checkedInAt, r.checkedOutAt);
    }
  }

  return assignedWorkers.workers.map((w) => {
    const entry = byWorker.get(w.id);
    const dates = entry?.dates ?? [];
    const totalHours = entry?.totalHours ?? 0;
    const completeDays = records.filter(
      (r) => r.workerId === w.id && r.checkedOutAt !== null,
    ).length;
    const totalEarnings =
      w.hourlyWage != null ? totalHours * w.hourlyWage : null;
    return {
      workerId: w.id,
      username: w.username,
      email: w.email,
      totalDays: dates.length,
      completeDays,
      totalHours,
      totalEarnings,
      firstDate: dates[0] ?? null,
      lastDate: dates[dates.length - 1] ?? null,
    };
  });
}

export async function getMyDailyStats(
  userId: string,
  year: number,
  month: number,
): Promise<DailyStatRow[]> {
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 0));

  const worker = await prisma.user.findUnique({
    where: { id: userId },
    select: { hourlyWage: true },
  });

  const records = await prisma.attendance.findMany({
    where: {
      workerId: userId,
      date: { gte: from, lte: to },
    },
    select: {
      id: true,
      date: true,
      checkedInAt: true,
      checkedOutAt: true,
      workPoint: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });

  return records.map((r) => {
    const complete = r.checkedOutAt !== null;
    const hours = complete ? computeHours(r.checkedInAt, r.checkedOutAt!) : 0;
    const earnings =
      complete && worker?.hourlyWage != null ? hours * worker.hourlyWage : 0;
    return {
      id: r.id,
      date: r.date,
      workPoint: r.workPoint,
      checkedInAt: r.checkedInAt,
      checkedOutAt: r.checkedOutAt,
      hours,
      earnings,
      complete,
    };
  });
}

export async function getMyMonthlySummary(
  userId: string,
  year: number,
  month: number,
): Promise<MonthlySummary> {
  const rows = await getMyDailyStats(userId, year, month);
  const worker = await prisma.user.findUnique({
    where: { id: userId },
    select: { hourlyWage: true },
  });

  const completeDays = rows.filter((r) => r.complete).length;
  const totalHours = rows.reduce((sum, r) => sum + r.hours, 0);
  const totalEarnings = rows.reduce((sum, r) => sum + r.earnings, 0);

  return {
    totalDays: rows.length,
    completeDays,
    totalHours,
    totalEarnings,
    hourlyWage: worker?.hourlyWage ?? null,
  };
}
