import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './sockets/socket.js'; // <-- Nouvel import

async function start() {
  await connectDB();

  const app = createApp();
  
  // On crée le serveur HTTP manuellement pour y attacher Socket.IO
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 API sur http://localhost:${env.PORT}`);
  });

  // Initialiser Socket.IO avec le serveur HTTP
  initSocket(server);
  console.log(`⚡ Socket.IO prêt`);
}

start();