// Entry point for the Express backend.
// On Render the build step runs: npm install && npx prisma generate
// The start step runs: node server.js
require('tsx/cjs');
require('./server/index.ts');
