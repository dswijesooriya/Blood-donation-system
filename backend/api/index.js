// ============================================================
// VERCEL SERVERLESS ENTRY POINT
// ============================================================
// Vercel doesn't run `app.listen()`. Instead, it imports your
// Express app and wraps it in a serverless function.
//
// This file exports the Express app so Vercel can handle HTTP
// requests directly.
// ============================================================

const app = require('../server');

module.exports = app;