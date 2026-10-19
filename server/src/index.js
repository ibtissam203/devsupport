import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`🚀 API sur http://localhost:${env.PORT}`);
  });
}

start();