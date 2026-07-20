require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require('./routes/authRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const servicesRoutes = require('./routes/servicesRoutes');

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://fj-backend-mu.vercel.app',
    'https://fj-frontend.vercel.app',
    'https://fj-frontend-ebon.vercel.app',
  'https://fjservices.co.za',
  'https://www.fjservices.co.za',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain (covers all preview + production deployments)
    if (origin.endsWith('.vercel.app') || ALLOWED_ORIGINS.includes(origin))
      return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', uploadRoutes);
app.use('/api', authRoutes);
app.use('/api', quoteRoutes);
app.use('/api/admin', invoiceRoutes);
app.use('/api', galleryRoutes);
app.use('/api', servicesRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Something went wrong!' });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => console.log(`FJ Backend running on port ${PORT}`));
}
