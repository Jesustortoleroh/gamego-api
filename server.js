import dotenv from 'dotenv';
import express from 'express';

import { initDb } from './db/connect.js';
import routes from './routes/index.js';

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'GameGo API is running!' });
});

app.use('/', routes);

const start = async () => {
  const db = await initDb();
  console.log(`Connected to MongoDB database "${db.databaseName}"`);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
