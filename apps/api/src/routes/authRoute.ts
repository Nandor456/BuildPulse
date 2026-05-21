import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";
import { ensureAuthenticated } from "../middlewares/authMiddleware.js";
import {
  registerController,
  loginController,
  logoutController,
  meController,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/logout", ensureAuthenticated, logoutController);
router.get("/user", ensureAuthenticated, meController);

export default router;
