import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { decryptFromBuffer } from '../security/crypto';
import { uploadToS3, getSignedUrlForKey } from '../utils/s3';
import { sendEmail } from '../utils/email'; // implement sendEmail per your provider

const redis = new Redis(process.env.REDIS_URL);
const queue = new Queue('deliveries', { connection: redis });
const prisma = new PrismaClient();

new Worker('deliveries', async job => {
  const { purchaseId } = job.data;
  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId }, include: { product: { include: { files: true, licenseKeys: true } } } });
  if (!purchase) throw new Error('Purchase not found');

  const product = purchase.product;
  if (product.productType === 'license_key') {
    // pick one unassigned key (transactional)
    const knex = prisma.$executeRaw`SELECT id FROM license_keys WHERE product_id = ${product.id} AND assigned_to_purchase_id IS NULL LIMIT 1 FOR UPDATE SKIP LOCKED`;
    // Prisma raw locks differ by version; simpler: fetch candidate and try update in transaction
    const keyRow = await prisma.$transaction(async (tx) => {
      const candidate = await tx.licenseKey.findFirst({
        where: { productId: product.id, assignedToPurchaseId: null },
      });
      if (!candidate) return null;
      await tx.licenseKey.update({ where: { id: candidate.id }, data: { assignedToPurchaseId: purchase.id } });
      return candidate;
    });

    if (!keyRow) throw new Error('No license keys available');

    // decrypt key
    const keyPlain = decryptFromBuffer(Buffer.from(keyRow.keyCiphertext));
    const content = [
      `Product: ${product.name}`,
      `SKU: ${product.sku ?? ''}`,
      `Purchase ID: ${purchase.id}`,
      `License Key: ${keyPlain.toString('utf8')}`,
      `Issued: ${new Date().toISOString()}`,
      '',
      'Activation Instructions:',
      '1. ...',
      'Support: support@yourdomain.com'
    ].join('\n');

    const txtKey = `deliveries/${purchase.id}/${product.sku || product.id}.txt`;
    await uploadToS3(txtKey, Buffer.from(content, 'utf8'), 'text/plain');
    const url = await getSignedUrlForKey(txtKey);
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'delivered', deliveredAt: new Date(), downloadUrl: url } });
    await sendEmail({ to: 'buyer@example.com', subject: `Your ${product.name} license`, text: `Download: ${url}` });
    return;
  }

  // secret_file or downloadable
  if (product.files && product.files.length > 0) {
    const file = product.files[0]; // choose primary
    if (!file) throw new Error('No file attached');
    let raw: Buffer;
    if (file.content) {
      raw = decryptFromBuffer(file.content as Buffer);
    } else if (file.s3Key) {
      // if file already in S3 and private, just sign it
      const url = await getSignedUrlForKey(file.s3Key);
      await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'delivered', deliveredAt: new Date(), downloadUrl: url } });
      await sendEmail({ to: 'buyer@example.com', subject: `Your ${product.name} download`, text: `Download: ${url}` });
      return;
    } else {
      throw new Error('No stored content');
    }
    const txtKey = `deliveries/${purchase.id}/${file.fileName}`;
    await uploadToS3(txtKey, raw, 'text/plain');
    const url = await getSignedUrlForKey(txtKey);
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'delivered', deliveredAt: new Date(), downloadUrl: url } });
    await sendEmail({ to: 'buyer@example.com', subject: `Your ${product.name} download`, text: `Download: ${url}` });
  }
}, { connection: redis });
