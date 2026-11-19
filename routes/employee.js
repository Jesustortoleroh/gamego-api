import { Router } from 'express';

import * as controller from '../controller/employee.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getSingle);
router.post('/', controller.createEmployee);
router.put('/:id', controller.updateEmployee);
router.delete('/:id', controller.deleteEmployee);

export default router;
