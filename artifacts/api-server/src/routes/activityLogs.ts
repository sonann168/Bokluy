import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { activityLogsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { ListActivityLogsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/activity-logs", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListActivityLogsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { page = 1, limit = 50 } = parsed.data;
  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db.select().from(activityLogsTable).orderBy(desc(activityLogsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(activityLogsTable),
  ]);

  res.json({ data, total: Number(countResult[0].count), page, limit });
});

export default router;
