import { Router } from "express";
import healthRouter from "./health";
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

router.use(healthRouter);
router.use(authRouter);
router.use(donationsRouter);
router.use(goalsRouter);
router.use(analyticsRouter);
router.use(settingsRouter);
router.use(notificationsRouter);
router.use(activityLogsRouter);
router.use(paymentsRouter);
router.use(overlayRouter);
router.use(soundsRouter);

export default router;
