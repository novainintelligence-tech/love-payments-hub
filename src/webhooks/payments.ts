import express from 'express';
import rawBody from 'raw-body';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL);
const deliveries = new Queue('deliveries', { connection: redis });

const router = express.Router();

// Middleware to get raw body for signature verification
router.post('/provider', async (req, res) => {
  const signature = req.headers['x-provider-signature'] as string | undefined;
  const secret = process.env.PAYMENT_PROVIDER_SECRET;
  const bodyBuffer = await rawBody(req);
  // verify signature - provider-specific: HMAC, RSA, etc.
  const expected = require('crypto').createHmac('sha256', secret).update(bodyBuffer).digest('hex');
  if (!signature || signature !== expected) return res.status(400).send('invalid signature');

  const payload = JSON.parse(bodyBuffer.toString());
  // map payload to purchase identifiers (payment reference)
  const paymentRef = payload.reference;
  const status = payload.status; // 'paid' etc.
  const amount = Math.round(payload.amount * 100); // example
  const purchase = await prisma.purchase.findFirst({ where: { paymentRef }});
  if (!purchase) return res.status(404).send('purchase not found');
  if (status === 'paid' && purchase.status === 'pending') {
    if (purchase.amountCents !== amount) {
      // possible mismatch - log and investigate
      return res.status(400).send('amount mismatch');
    }
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'paid' }});
    // enqueue delivery
    await deliveries.add('deliver', { purchaseId: purchase.id });
  }
  res.status(200).send({ ok: true });
});

export default router;
