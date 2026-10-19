import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Le reste de vos imports existants...
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