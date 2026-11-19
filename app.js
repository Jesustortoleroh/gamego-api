import express from 'express';
import warehouseRoutes from './routes/warehouses.js';
import itemRoutes from './routes/items.js';
import employeeRoutes from './routes/employees.js';
import swaggerRoutes from './routes/swagger.js';

export function createApp(warehouses, items, employees) {
  const app = express();
  app.locals.warehouses = warehouses;
  app.locals.items = items;
  app.locals.employees = employees;

  app.use('/warehouses', warehouseRoutes);
  app.use('/items', itemRoutes);
  app.use('/employees', employeeRoutes);
  app.use('/api-docs', swaggerRoutes);
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'GameGo API is running!' });
  });

  return app;
}