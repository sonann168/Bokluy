import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { donationsTable, goalsTable, settingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { emitNewDonation } from "../lib/socket";

const router: IRouter = Router();

router.get("/overlay/data", async (_req, res): Promise<void> => {
  const [latestDonation, topDonation, activeGoal, settings] = await Promise.all([
    db.select().from(donationsTable).where(eq(donationsTable.status, "paid")).orderBy(desc(donationsTable.createdAt)).limit(1),
    db.select().from(donationsTable).where(eq(donationsTable.status, "paid")).orderBy(desc(donationsTable.amount)).limit(1),
    db.select().from(goalsTable).where(eq(goalsTable.isActive, true)).orderBy(desc(goalsTable.createdAt)).limit(1),
    db.select().from(settingsTable).limit(1),
  ]);

  const s = settings[0];
  res.json({
    latestDonation: latestDonation[0] ?? null,
    topDonation: topDonation[0] ?? null,
    activeGoal: activeGoal[0] ?? null,
    settings: {
      alertDuration: s?.alertDuration ?? 8,
      soundEnabled: s?.soundEnabled ?? true,
      streamerName: s?.streamerName ?? "IMUZAKI",
    },
  });
});

router.post("/overlay/test-alert", requireAuth, async (_req, res): Promise<void> => {
  const testDonation = {
    id: 0,
    donorName: "TestUser",
    isAnonymous: false,
    amount: "10.00",
    currency: "USD",
    message: "This is a test alert! Your overlay is working correctly.",
    status: "paid",
    paymentMethod: "aba_payway",
    transactionId: "TEST-ALERT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
  };

  emitNewDonation(testDonation);
  res.json({ success: true, message: "Test alert sent" });
});

export default router;
