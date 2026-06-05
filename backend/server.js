const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const seedDatabase = require('./seed');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dineflow';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    try {
      const result = await seedDatabase();
      if (!result.skipped) console.log('Auto-seed completed on empty database');
    } catch (err) {
      console.error('Auto-seed failed:', err.message);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`DineFlow Express server running on port ${PORT}`);
});
