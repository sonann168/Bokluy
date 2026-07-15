import { Router } from "express";
import authRouter from "./auth";
import donationsRouter from "./donations";
import goalsRouter from "./goals";
import analyticsRouter from "./analytics";
import settingsRouter from "./settings";
import notificationsRouter from "./notifications";
import activityLogsRouter from "./activityLogs";
import paymentsRouter from "./payments";
import overlayRouter from "./overlay";
import soundsRouter from "./sounds";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/auth", authRouter);
router.use("/donations", donationsRouter);
router.use("/goals", goalsRouter);
router.use("/analytics", analyticsRouter);
router.use("/settings", settingsRouter);
router.use("/notifications", notificationsRouter);
router.use("/activity-logs", activityLogsRouter);
router.use("/payments", paymentsRouter);
router.use("/overlay", overlayRouter);
router.use("/sounds", soundsRouter);

export default router;
