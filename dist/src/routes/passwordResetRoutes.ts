import { Router } from "express";
import {
  passwordResetRequestController,
  passwordResetController,
} from "../controllers/passwordChangeController";

const router = Router();

router.post("/reset-request", passwordResetRequestController);
router.post("/reset-confirm", passwordResetController);

export default router;
