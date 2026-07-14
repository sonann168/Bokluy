import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { donationsTable, goalsTable } from "@workspace/db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/analytics/summary", requireAuth, async (_req, res): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const paid = eq(donationsTable.status, "paid");

  const [totals, todayRev, weekRev, monthRev] = await Promise.all([
    db.select({
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${donationsTable.amount} AS DECIMAL)), 0)`,
      totalDonations: sql<number>`COUNT(*)`,
      averageDonation: sql<number>`COALESCE(AVG(CAST(${donationsTable.amount} AS DECIMAL)), 0)`,
      highestDonation: sql<number>`COALESCE(MAX(CAST(${donationsTable.amount} AS DECIMAL)), 0)`,
    }).from(donationsTable).where(paid),
    db.select({ revenue: sql<number>`COALESCE(SUM(CAST(${donationsTable.amount} AS DECIMAL)), 0)` })
      .from(donationsTable).where(and(paid, gte(donationsTable.createdAt, todayStart))),
    db.select({ revenue: sql<number>`COALESCE(SUM(CAST(${donationsTable.amount} AS DECIMAL)), 0)` })
      .from(donationsTable).where(and(paid, gte(donationsTable.createdAt, weekStart))),
    db.select({ revenue: sql<number>`COALESCE(SUM(CAST(${donationsTable.amount} AS DECIMAL)), 0)` })
      .from(donationsTable).where(and(paid, gte(donationsTable.createdAt, monthStart))),
  ]);

  res.json({
    todayRevenue: Number(todayRev[0].revenue),
    weekRevenue: Number(weekRev[0].revenue),
    monthRevenue: Number(monthRev[0].revenue),
    totalRevenue: Number(totals[0].totalRevenue),
    totalDonations: Number(totals[0].totalDonations),
    averageDonation: Number(totals[0].averageDonation),
    highestDonation: Number(totals[0].highestDonation),
  });
});

router.get("/analytics/revenue", requireAuth, async (req, res): Promise<void> => {
  const period = req.query.period as string;
  let groupExpr: ReturnType<typeof sql>;
  let labelExpr: ReturnType<typeof sql>;
  let startDate: Date;

  const now = new Date();

  if (period === "daily") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    groupExpr = sql`DATE(${donationsTable.createdAt})`;
    labelExpr = sql`TO_CHAR(DATE(${donationsTable.createdAt}), 'Mon DD')`;
  } else if (period === "weekly") {
    startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    groupExpr = sql`DATE_TRUNC('week', ${donationsTable.createdAt})`;
    labelExpr = sql`TO_CHAR(DATE_TRUNC('week', ${donationsTable.createdAt}), 'Mon DD')`;
  } else if (period === "monthly") {
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    groupExpr = sql`DATE_TRUNC('month', ${donationsTable.createdAt})`;
    labelExpr = sql`TO_CHAR(DATE_TRUNC('month', ${donationsTable.createdAt}), 'Mon YYYY')`;
  } else {
    // yearly
    startDate = new Date(now.getFullYear() - 5, 0, 1);
    groupExpr = sql`DATE_TRUNC('year', ${donationsTable.createdAt})`;
    labelExpr = sql`TO_CHAR(DATE_TRUNC('year', ${donationsTable.createdAt}), 'YYYY')`;
  }

  const data = await db.select({
    label: labelExpr,
    revenue: sql<number>`COALESCE(SUM(CAST(${donationsTable.amount} AS DECIMAL)), 0)`,
    count: sql<number>`COUNT(*)`,
  })
    .from(donationsTable)
    .where(and(eq(donationsTable.status, "paid"), gte(donationsTable.createdAt, startDate)))
    .groupBy(groupExpr)
    .orderBy(groupExpr);

  res.json(data.map(d => ({ label: String(d.label), revenue: Number(d.revenue), count: Number(d.count) })));
});

router.get("/dashboard/summary", requireAuth, async (_req, res): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const paid = eq(donationsTable.status, "paid");

  const [totals, todayRev, weekRev, monthRev, recentDonations, topDonors, activeGoal] = await Promise.all([
    db.select({
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${donationsTable.amount} AS DECIMAL)), 0)`,
      totalDonations: sql<number>`COUNT(*)`,
      averageDonation: sql<number>`COALESCE(AVG(CAST(${donationsTable.amount} AS DECIMAL)), 0)`,
      highestDonation: sql<number>`COALESCE(MAX(CAST(${donationsTable.amount} AS DECIMAL)), 0)`,
    }).from(donationsTable).where(paid),
    db.select({ revenue: sql<number>`COALESCE(SUM(CAST(${donationsTable.amount} AS DECIMAL)), 0)` })
      .from(donationsTable).where(and(paid, gte(donationsTable.createdAt, todayStart))),
    db.select({ revenue: sql<number>`COALESCE(SUM(CAST(${donationsTable.amount} AS DECIMAL)), 0)` })
      .from(donationsTable).where(and(paid, gte(donationsTable.createdAt, weekStart))),
    db.select({ revenue: sql<number>`COALESCE(SUM(CAST(${donationsTable.amount} AS DECIMAL)), 0)` })
      .from(donationsTable).where(and(paid, gte(donationsTable.createdAt, monthStart))),
    db.select().from(donationsTable).where(paid).orderBy(desc(donationsTable.createdAt)).limit(5),
    db.select({
      donorName: sql<string>`CASE WHEN ${donationsTable.isAnonymous} = true THEN 'Anonymous' ELSE ${donationsTable.donorName} END`,
      totalAmount: sql<number>`SUM(CAST(${donationsTable.amount} AS DECIMAL))`,
      donationCount: sql<number>`COUNT(*)`,
      lastDonationAt: sql<string>`MAX(${donationsTable.createdAt})`,
    }).from(donationsTable).where(paid)
      .groupBy(donationsTable.donorName, donationsTable.isAnonymous)
      .orderBy(sql`SUM(CAST(${donationsTable.amount} AS DECIMAL)) DESC`)
      .limit(5),
    db.select().from(goalsTable).where(eq(goalsTable.isActive, true)).orderBy(desc(goalsTable.createdAt)).limit(1),
  ]);

  res.json({
    analytics: {
      todayRevenue: Number(todayRev[0].revenue),
      weekRevenue: Number(weekRev[0].revenue),
      monthRevenue: Number(monthRev[0].revenue),
      totalRevenue: Number(totals[0].totalRevenue),
      totalDonations: Number(totals[0].totalDonations),
      averageDonation: Number(totals[0].averageDonation),
      highestDonation: Number(totals[0].highestDonation),
    },
    recentDonations,
    topDonors,
    activeGoal: activeGoal[0] ?? null,
  });
});

export default router;
