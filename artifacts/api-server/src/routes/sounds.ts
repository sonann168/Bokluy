import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { soundsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { CreateSoundBody, UpdateSoundBody, UpdateSoundParams, DeleteSoundParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sounds", requireAuth, async (_req, res): Promise<void> => {
  const sounds = await db.select().from(soundsTable).orderBy(desc(soundsTable.createdAt));
  res.json(sounds);
});

router.post("/sounds", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSoundBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [sound] = await db.insert(soundsTable).values({
    name: parsed.data.name,
    url: parsed.data.url,
    isActive: parsed.data.isActive ?? false,
    volume: parsed.data.volume ?? 80,
  }).returning();

  res.status(201).json(sound);
});

router.patch("/sounds/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateSoundParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSoundBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [sound] = await db.update(soundsTable).set(parsed.data).where(eq(soundsTable.id, params.data.id)).returning();
  if (!sound) {
    res.status(404).json({ error: "Sound not found" });
    return;
  }

  res.json(sound);
});

router.delete("/sounds/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteSoundParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(soundsTable).where(eq(soundsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
