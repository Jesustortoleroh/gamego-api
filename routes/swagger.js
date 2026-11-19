import { readFileSync } from 'node:fs';

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = JSON.parse(readFileSync(new URL('../swagger.json', import.meta.url)));

const router = Router();

router.use('/', swaggerUi.serve);
router.get('/', /* #swagger.ignore = true */ swaggerUi.setup(swaggerDocument));

export default router;
