import { Router } from "express";
import { verifiedEmail, emailVerificationRequest } from "../controllers/emailVerificationController";

const router = Router();

// email verification routes
router.post("/verify-email", verifiedEmail);
router.post("/request-email-verification", emailVerificationRequest);

export default router;
