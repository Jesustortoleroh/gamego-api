import { MongoClient } from 'mongodb';

let db;

export const initDb = async () => {
  if (db) return db;

  if (!process.env.MONGODB_CONNECTION_STRING) {
    throw new Error(
      'MONGODB_CONNECTION_STRING is not set. Add it to .env or the Render environment variables.'
    );
  }

  const client = await MongoClient.connect(process.env.MONGODB_CONNECTION_STRING);
  db = client.db(process.env.MONGODB_DB_NAME || 'GameGo');
  return db;
};

export const getDb = () => {
  if (!db) throw new Error('Database has not been initialized');
  return db;
};
