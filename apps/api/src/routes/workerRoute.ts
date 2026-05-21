import { Router } from "express";
import {
  ensureAuthenticated,
  ensureRole,
} from "../middlewares/authMiddleware.js";
import {
  assignWorkerController,
  deleteWorkerController,
  listWorkPointWorkersController,
  listWorkersController,
  removeWorkerController,
  updateWorkerController,
} from "../controllers/workerController.js";

const router = Router();

const workPointAccess = [ensureAuthenticated, ensureRole("ADMIN", "LEADER")];
const adminAccess = [ensureAuthenticated, ensureRole("ADMIN")];

router.get("/workers", workPointAccess, listWorkersController);
router.get("/workpoints/:id/workers", workPointAccess, listWorkPointWorkersController);
router.post("/workpoints/:id/workers", workPointAccess, assignWorkerController);
router.delete("/workpoints/:id/workers/:workerId", workPointAccess, removeWorkerController);
router.put("/workers/:workerId", adminAccess, updateWorkerController);
router.delete("/workers/:workerId", adminAccess, deleteWorkerController);

export default router;
