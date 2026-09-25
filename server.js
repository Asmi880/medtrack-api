/**
 * server.js — MedTrack API entry point.
 *
 * A small Express + SQLite REST API for tracking patient medication
 * schedules. Built as the target application for a Jenkins CI/CD/DevSecOps
 * pipeline (SIT223/SIT753 7.3HD) — the app itself is intentionally simple;
 * the pipeline built around it is the graded artefact.
 */

const express = require('express');
const medicationsRouter = require('./routes/medications');

const app = express();
app.use(express.json());

// Health check — useful later for the Monitoring stage / load balancer checks.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/medications', medicationsRouter);

// Basic root route.
app.get('/', (req, res) => {
  res.json({ service: 'medtrack-api', version: process.env.APP_VERSION || 'dev' });
});

const PORT = process.env.PORT || 3000;

// Only start listening when run directly (not when required by tests).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MedTrack API listening on port ${PORT}`);
  });
}

module.exports = app;
