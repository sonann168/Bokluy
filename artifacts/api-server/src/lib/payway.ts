import crypto from "crypto";

const MERCHANT_ID = process.env.ABA_MERCHANT_ID || "";
const API_KEY = process.env.ABA_API_KEY || "";
const HASH_KEY = process.env.ABA_HASH_KEY || "";
const PAYWAY_BASE_URL = "https://checkout.payway.com.kh";

export interface PaywayPaymentRequest {
  donationId: number;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaywayPaymentResult {
  paymentUrl: string;
  transactionId: string;
}

export function createPaywayTransaction(req: PaywayPaymentRequest): PaywayPaymentResult {
  const transactionId = `IMUZAKI-${req.donationId}-${Date.now()}`;
  const amountFormatted = req.amount.toFixed(2);

  if (!MERCHANT_ID || !API_KEY || !HASH_KEY) {
    // Dev/sandbox mode: return a simulated payment URL
    const params = new URLSearchParams({
      tran_id: transactionId,
      merchant_id: MERCHANT_ID || "DEMO",
      amount: amountFormatted,
      currency: req.currency,
      return_url: req.returnUrl,
      cancel_url: req.cancelUrl,
    });
    return {
      paymentUrl: `${req.returnUrl}?tran_id=${transactionId}&status=paid`,
      transactionId,
    };
  }

  // Production: construct ABA PayWay Auto Pay URL
  const hashData = `${transactionId}${MERCHANT_ID}${amountFormatted}${req.currency}`;
  const hash = crypto.createHmac("sha512", HASH_KEY).update(hashData).digest("base64");

  const params = new URLSearchParams({
    tran_id: transactionId,
    merchant_id: MERCHANT_ID,
    amount: amountFormatted,
    currency: req.currency,
    type: "2",
    hash,
    return_param: String(req.donationId),
    return_url: req.returnUrl,
    cancel_url: req.cancelUrl,
  });

  return {
    paymentUrl: `${PAYWAY_BASE_URL}/api/pwtoken/request?${params.toString()}`,
    transactionId,
  };
}

export function verifyWebhookHash(data: Record<string, string>, receivedHash: string): boolean {
  if (!HASH_KEY) return true; // dev mode
  const hashData = Object.values(data).join("");
  const expectedHash = crypto.createHmac("sha512", HASH_KEY).update(hashData).digest("base64");
  return expectedHash === receivedHash;
}
