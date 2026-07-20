require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const servicesRoutes = require('./routes/servicesRoutes');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://fj-backend-mu.vercel.app',
    'https://fj-frontend.vercel.app',
    'https://fjservices.co.za',
    'https://www.fjservices.co.za'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
