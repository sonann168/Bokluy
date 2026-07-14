import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureSettings() {
  const [existing] = await db.select().from(settingsTable).limit(1);
  if (!existing) {
    const [created] = await db.insert(settingsTable).values({}).returning();
    return created;
  }
  return existing;
}

router.get("/settings", requireAuth, async (_req, res): Promise<void> => {
  const settings = await ensureSettings();
  res.json({
    ...settings,
    minDonationAmount: Number(settings.minDonationAmount),
  });
});

router.patch("/settings", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const current = await ensureSettings();
  const updates: Record<string, unknown> = {};
  const d = parsed.data;

  if (d.streamerName !== undefined) updates.streamerName = d.streamerName;
  if (d.streamerBio !== undefined) updates.streamerBio = d.streamerBio;
  if (d.currency !== undefined) updates.currency = d.currency;
  if (d.minDonationAmount !== undefined) updates.minDonationAmount = String(d.minDonationAmount);
  if (d.alertDuration !== undefined) updates.alertDuration = d.alertDuration;
  if (d.theme !== undefined) updates.theme = d.theme;
  if (d.overlayAlertEnabled !== undefined) updates.overlayAlertEnabled = d.overlayAlertEnabled;
  if (d.soundEnabled !== undefined) updates.soundEnabled = d.soundEnabled;
  if (d.activeSoundId !== undefined) updates.activeSoundId = d.activeSoundId;

  const [updated] = await db
    .update(settingsTable)
    .set(updates)
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Settings not found" });
    return;
  }

  res.json({ ...updated, minDonationAmount: Number(updated.minDonationAmount) });
});

export default router;
