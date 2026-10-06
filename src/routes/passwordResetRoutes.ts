import { Router } from "express";
import { passwordResetRequestController } from "../controllers/passwordChangeController";
import { passwordResetController } from "../controllers/confirmPasswordChangeController";

const router = Router();

router.post("/request", passwordResetRequestController);
router.post("/confirm", passwordResetController);

export default router;
