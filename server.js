import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { createApp } from './app.js';

async function start() {
  const { MONGODB_URI, MONGODB_DB_NAME = 'GameGO', PORT = 3000 } = process.env;
  if (!MONGODB_URI) {
    console.error('Set MONGODB_URI before starting GameGo.');
    process.exitCode = 1;
    return;
  }

  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    
    // Connect to the database and get both collections
    const db = client.db(MONGODB_DB_NAME);
    const warehouses = db.collection('warehouses');
    const items = db.collection('items'); 
    
    // Pass both collections to createApp
    const server = createApp(warehouses, items).listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', async () => {
      console.error('GameGo could not listen on the configured port.');
      process.exitCode = 1;
      await client.close();
    });

    // Graceful shutdown handling
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => {
        server.close(() => client.close());
      });
    }
  } catch (error) {
    await client.close();
    throw error;
  }
}

start().catch(() => {
  console.error('GameGo could not connect to MongoDB. Check the connection settings.');
  process.exitCode = 1;
});
