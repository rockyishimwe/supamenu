// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const seedDb = require('./seed'); // Import the seed function

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Check for required environment variables and exit if missing
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('FATAL ERROR: JWT_SECRET and MONGO_URI must be defined.');
  process.exit(1); // Exit with a non-zero code to indicate failure
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Seed database if it's empty (optional, consider making it an explicit command)
// For now, keeping it as an example, but it should be made more robust for production
// e.g., via a CLI command like `node backend/scripts/seed.js`
connectDB().then(() => {
  seedDb().catch(err => console.error('Database seeding failed:', err));
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
