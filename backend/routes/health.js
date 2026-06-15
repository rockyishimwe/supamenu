const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 timestamp: { type: string }
 *                 mongodb: { type: string }
 *       503:
 *         description: Service degraded
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const healthy = dbState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    mongodb: dbStatus[dbState] || 'unknown',
  });
});

module.exports = router;
