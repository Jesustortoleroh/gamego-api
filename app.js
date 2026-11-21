import express from 'express';
import warehouseRoutes from './routes/warehouses.js';
import itemRoutes from './routes/items.js';
import employeeRoutes from './routes/employees.js';
import customerRoutes from "./routes/customer.js"
import authRoutes from './routes/auth.js';
import swaggerRoutes from './routes/swagger.js';

export function createApp(warehouses, items, employees, customers) {
  const app = express();
  app.locals.warehouses = warehouses;
  app.locals.items = items;
  app.locals.employees = employees;
  app.locals.customers = customers;

  app.use('/warehouses', /* #swagger.tags = ['Warehouses'] */ warehouseRoutes);
  app.use('/items', /* #swagger.tags = ['Items'] */ itemRoutes);
  app.use('/employees', /* #swagger.tags = ['Employees'] */ employeeRoutes);
  app.use('/customers', /* #swagger.tags = ['Customers'] */ customerRoutes);
  app.use('/', /* #swagger.tags = ['OAuth'] */ authRoutes);
  app.use('/api-docs', swaggerRoutes);
  app.get('/', /* #swagger.ignore = true */ (req, res) => {
    res.status(200).json({ message: 'GameGo API is running!' });
  });

  return app;
}