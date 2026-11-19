import express from 'express';
import warehouseRoutes from './routes/warehouses.js';

export function createApp(warehouses) {
  const app = express();
  app.locals.warehouses = warehouses;

  app.use('/warehouses', warehouseRoutes);
  app.use(express.json());
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'GameGo API is running!' });
  });

  return app;
}
