import express from 'express';
import warehouseRoutes from './routes/warehouses.js';
import itemRoutes from './routes/items.js';

export function createApp(warehouses, items) {
  const app = express();
  app.locals.warehouses = warehouses;
  app.locals.items = items;

  app.use('/warehouses', warehouseRoutes);
  app.use('/items', itemRoutes);
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'GameGo API is running!' });
  });

  return app;
}