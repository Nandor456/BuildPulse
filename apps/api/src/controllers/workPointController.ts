import type { Response } from "express";
import type { SessionRequest } from "../types/SessionRequest.js";
import {
  createWorkPoint,
  deleteWorkPoint,
  getWorkPointById,
  listWorkPoints,
  updateWorkPoint,
  type UpdateWorkPointInput,
  type WorkPointInput,
} from "../services/workPointService.js";

function statusForError(error: unknown) {
  if (!(error instanceof Error)) return 500;
  if (error.message === "Work point not found") return 404;
  return 400;
}

function messageForError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function listWorkPointsController(
  _req: SessionRequest,
  res: Response,
) {
  try {
    const workPoints = await listWorkPoints();
    res.json({ workPoints });
  } catch (error) {
    res.status(500).json({
      error: messageForError(error, "Failed to list work points"),
    });
  }
}

export async function getWorkPointController(
  req: SessionRequest<{ id: string }>,
  res: Response,
) {
  const { id } = req.params;

  try {
    const workPoint = await getWorkPointById(id);
    if (!workPoint) {
      return res.status(404).json({ error: "Work point not found" });
    }

    res.json({ workPoint });
  } catch (error) {
    res.status(statusForError(error)).json({
      error: messageForError(error, "Failed to load work point"),
    });
  }
}

export async function createWorkPointController(
  req: SessionRequest,
  res: Response,
) {
  try {
    const workPoint = await createWorkPoint(
      req.body as WorkPointInput,
      req.session.userId,
    );
    res.status(201).json({ workPoint });
  } catch (error) {
    res.status(statusForError(error)).json({
      error: messageForError(error, "Failed to create work point"),
    });
  }
}

export async function updateWorkPointController(
  req: SessionRequest<{ id: string }>,
  res: Response,
) {
  const { id } = req.params;

  try {
    const workPoint = await updateWorkPoint(id, req.body as UpdateWorkPointInput);
    res.json({ workPoint });
  } catch (error) {
    res.status(statusForError(error)).json({
      error: messageForError(error, "Failed to update work point"),
    });
  }
}

export async function deleteWorkPointController(
  req: SessionRequest<{ id: string }>,
  res: Response,
) {
  const { id } = req.params;

  try {
    await deleteWorkPoint(id);
    res.status(204).send();
  } catch (error) {
    res.status(statusForError(error)).json({
      error: messageForError(error, "Failed to delete work point"),
    });
  }
}
