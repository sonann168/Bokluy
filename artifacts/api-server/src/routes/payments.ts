import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { donationsTable, notificationsTable, goalsTable, activityLogsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { createPaywayTransaction, verifyWebhookHash } from "../lib/payway";
import { emitNewDonation, emitGoalUpdate } from "../lib/socket";
import { CreatePaymentBody, HandlePaymentCallbackBody, GetPaymentStatusParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/payments/create", async (req, res): Promise<void> => {
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { donationId, amount, currency } = parsed.data;

  const origin = req.headers.origin || `https://${req.headers.host}`;
  const { paymentUrl, transactionId } = createPaywayTransaction({
    donationId,
    amount,
    currency,
    description: `Donation #${donationId} to IMUZAKI`,
    returnUrl: `${origin}/donate/success?donation_id=${donationId}`,
    cancelUrl: `${origin}/donate/failed?donation_id=${donationId}`,
  });

  await db.update(donationsTable).set({ transactionId }).where(eq(donationsTable.id, donationId));

  res.json({ paymentUrl, transactionId });
});

router.post("/payments/callback", async (req, res): Promise<void> => {
  const parsed = HandlePaymentCallbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tran_id, status, hash } = parsed.data;

  // Verify hash if provided
  if (hash) {
    const hashData: Record<string, string> = { tran_id, status };
    if (parsed.data.amount != null) hashData.amount = String(parsed.data.amount);
    if (parsed.data.currency != null) hashData.currency = parsed.data.currency;
    const isValid = verifyWebhookHash(hashData, hash);
    if (!isValid) {
      res.status(400).json({ error: "Invalid hash" });
      return;
    }
  }

  // Find donation by transaction ID
  const [donation] = await db.select().from(donationsTable).where(eq(donationsTable.transactionId, tran_id));
  if (!donation) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }

  const isPaid = status === "0" || status === "paid";
  const newStatus = isPaid ? "paid" : status === "cancel" ? "cancelled" : "failed";

  const [updated] = await db.update(donationsTable).set({
    status: newStatus,
    paidAt: isPaid ? new Date() : undefined,
  }).where(eq(donationsTable.id, donation.id)).returning();

  if (isPaid && updated) {
    // Create notification
    await db.insert(notificationsTable).values({
      type: "donation",
      title: "New Donation Received!",
      message: `${updated.isAnonymous ? "Anonymous" : updated.donorName} donated ${updated.currency} ${updated.amount}`,
      donationId: updated.id,
    });

    // Update active goal
    const [activeGoal] = await db.select().from(goalsTable).where(eq(goalsTable.isActive, true)).limit(1);
    if (activeGoal) {
      const [updatedGoal] = await db.update(goalsTable).set({
        currentAmount: sql`CAST(${goalsTable.currentAmount} AS DECIMAL) + CAST(${updated.amount} AS DECIMAL)`,
      }).where(eq(goalsTable.id, activeGoal.id)).returning();
      emitGoalUpdate(updatedGoal);
    }

    // Emit real-time event
    emitNewDonation(updated);

    // Log activity
    await db.insert(activityLogsTable).values({
      action: "donation_received",
      description: `Payment received from ${updated.isAnonymous ? "Anonymous" : updated.donorName}: ${updated.currency} ${updated.amount}`,
    });
  }

  res.json({ success: true, message: "Callback processed" });
});

router.get("/payments/:donationId/status", async (req, res): Promise<void> => {
  const params = GetPaymentStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [donation] = await db.select().from(donationsTable).where(eq(donationsTable.id, params.data.donationId));
  if (!donation) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }

  res.json({
    donationId: donation.id,
    status: donation.status,
    transactionId: donation.transactionId,
    paidAt: donation.paidAt,
  });
});

export default router;
