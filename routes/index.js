import { Router } from 'express';

import employeeRoutes from './employee.js';
import swaggerRoutes from './swagger.js';

const router = Router();

router.use('/employees', employeeRoutes);
router.use('/api-docs', swaggerRoutes);

export default router;
