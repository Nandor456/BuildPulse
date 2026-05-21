import { Router } from "express";
import {
  ensureAuthenticated,
  ensureRole,
} from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  createWorkPointController,
  deleteWorkPointController,
  getWorkPointController,
  listWorkPointsController,
  updateWorkPointController,
} from "../controllers/workPointController.js";
import {
  createWorkPointSchema,
  updateWorkPointSchema,
  workPointIdSchema,
} from "../schemas/workPointSchemas.js";

const router = Router();

router.use(ensureAuthenticated, ensureRole("ADMIN", "LEADER"));

router.get("/", listWorkPointsController);
router.post("/", validate(createWorkPointSchema), createWorkPointController);
router.get("/:id", validate(workPointIdSchema), getWorkPointController);
router.put("/:id", validate(updateWorkPointSchema), updateWorkPointController);
router.delete("/:id", validate(workPointIdSchema), deleteWorkPointController);

export default router;
