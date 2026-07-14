import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { donationsTable, notificationsTable } from "@workspace/db";
import { eq, desc, ilike, and, gte, lte, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import {
  ListDonationsQueryParams,
  CreateDonationBody,
  UpdateDonationBody,
  GetDonationParams,
  UpdateDonationParams,
  DeleteDonationParams,
} from "@workspace/api-zod";
import { emitNewDonation } from "../lib/socket";

const router: IRouter = Router();

router.get("/donations", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListDonationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { page = 1, limit = 20, status, search, startDate, endDate } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(donationsTable.status, status));
  if (search) conditions.push(ilike(donationsTable.donorName, `%${search}%`));
  if (startDate) conditions.push(gte(donationsTable.createdAt, new Date(startDate)));
  if (endDate) conditions.push(lte(donationsTable.createdAt, new Date(endDate)));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db.select().from(donationsTable).where(where).orderBy(desc(donationsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(donationsTable).where(where),
  ]);

  res.json({ data, total: Number(countResult[0].count), page, limit });
});

router.post("/donations", async (req, res): Promise<void> => {
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [donation] = await db.insert(donationsTable).values({
    donorName: parsed.data.donorName,
    isAnonymous: parsed.data.isAnonymous ?? false,
    amount: String(parsed.data.amount),
    currency: parsed.data.currency,
    message: parsed.data.message,
    status: "pending",
    paymentMethod: "aba_payway",
  }).returning();

  const origin = req.headers.origin || `https://${req.headers.host}`;
  const paymentUrl = `${origin}/donate/success?donation_id=${donation.id}`;

  res.status(201).json({ donation, paymentUrl });
});

router.get("/donations/recent", async (req, res): Promise<void> => {
  const limit = Number(req.query.limit) || 10;
  const donations = await db.select().from(donationsTable)
    .where(eq(donationsTable.status, "paid"))
    .orderBy(desc(donationsTable.createdAt))
    .limit(limit);
  res.json(donations);
});

router.get("/donations/top", async (req, res): Promise<void> => {
  const limit = Number(req.query.limit) || 10;
  const period = req.query.period as string || "all";

  let dateFilter = undefined;
  if (period === "week") {
    dateFilter = gte(donationsTable.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  } else if (period === "month") {
    dateFilter = gte(donationsTable.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  }

  const conditions = [eq(donationsTable.status, "paid")];
  if (dateFilter) conditions.push(dateFilter);

  const result = await db
    .select({
      donorName: sql<string>`CASE WHEN ${donationsTable.isAnonymous} = true THEN 'Anonymous' ELSE ${donationsTable.donorName} END`,
      totalAmount: sql<number>`SUM(CAST(${donationsTable.amount} AS DECIMAL))`,
      donationCount: sql<number>`COUNT(*)`,
      lastDonationAt: sql<string>`MAX(${donationsTable.createdAt})`,
    })
    .from(donationsTable)
    .where(and(...conditions))
    .groupBy(donationsTable.donorName, donationsTable.isAnonymous)
    .orderBy(sql`SUM(CAST(${donationsTable.amount} AS DECIMAL)) DESC`)
    .limit(limit);

  res.json(result);
});

router.get("/donations/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetDonationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [donation] = await db.select().from(donationsTable).where(eq(donationsTable.id, params.data.id));
  if (!donation) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }

  res.json(donation);
});

router.patch("/donations/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateDonationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [donation] = await db.update(donationsTable).set(parsed.data).where(eq(donationsTable.id, params.data.id)).returning();
  if (!donation) {
    res.status(404).json({ error: "Donation not found" });
    return;
  }

  res.json(donation);
});

router.delete("/donations/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteDonationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(donationsTable).where(eq(donationsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
