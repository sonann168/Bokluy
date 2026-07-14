import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { MarkNotificationReadParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const unreadOnly = req.query.unreadOnly === "true";
  const query = db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt)).limit(100);

  if (unreadOnly) {
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.isRead, false))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(100);
    res.json(notifications);
    return;
  }

  const notifications = await query;
  res.json(notifications);
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [notification] = await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, params.data.id))
    .returning();

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json(notification);
});

router.patch("/notifications/read-all", requireAuth, async (_req, res): Promise<void> => {
  await db.update(notificationsTable).set({ isRead: true });
  res.json({ success: true, message: "All notifications marked as read" });
});

export default router;
