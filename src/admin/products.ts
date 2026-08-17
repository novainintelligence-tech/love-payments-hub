import express from 'express';
import multer from 'multer';
import { uploadToS3 } from '../utils/s3';
import { PrismaClient } from '@prisma/client';
import { encryptToBuffer } from '../security/crypto';

const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

const router = express.Router();

// Protect this route with admin auth middleware in your app
router.post('/products', upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'secretFile', maxCount: 1 }]), async (req, res) => {
  const { subcategoryId, name, sku, description, productType, priceCents, currency } = req.body;
  const banner = req.files && (req.files as any).banner ? (req.files as any).banner[0] : null;
  const secretFile = req.files && (req.files as any).secretFile ? (req.files as any).secretFile[0] : null;

  let bannerUrl: string | null = null;
  if (banner) {
    const ext = banner.mimetype.split('/')[1] || 'png';
    const key = `banners/products/${sku || name}-${Date.now()}.${ext}`;
    await uploadToS3(key, banner.buffer, banner.mimetype);
    bannerUrl = key; // store key or full url if you prefer
  }

  const created = await prisma.product.create({
    data: {
      subcategoryId,
      name,
      sku,
      description,
      productType,
      priceCents: Number(priceCents || 0),
      currency: currency || 'USD',
      bannerUrl,
    }
  });

  if (secretFile) {
    const encrypted = encryptToBuffer(secretFile.buffer);
    await prisma.productFile.create({
      data: {
        productId: created.id,
        fileName: secretFile.originalname,
        content: encrypted,
        isHidden: true
      }
    });
  }

  res.json({ ok: true, product: created });
});

export default router;
