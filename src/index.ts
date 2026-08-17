import express from 'express';
import bodyParser from 'body-parser';
import paymentsWebhook from './webhooks/payments';
import adminProducts from './admin/products';

const app = express();
app.use(bodyParser.json());

// Attach routers
app.use('/webhooks', paymentsWebhook);
app.use('/admin', adminProducts);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
