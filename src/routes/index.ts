import { Router } from "express";
import authRoutes from "./authRoutes";
import emailVerifyRoutes from "./emailVerifyRoutes";
import passwordResetRoutes from "./passwordResetRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/user", emailVerifyRoutes);
router.use("/password-reset", passwordResetRoutes);

export default router;
