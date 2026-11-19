import express from 'express';
import {
  create, getAll, getSingle, remove, update, validateWarehouse, validateWarehouseId,
} from '../controllers/warehouse.js';

const router = express.Router();

router.use(express.json());
router.param('id', (req, res, next, id) => validateWarehouseId(id, res, next));

router.get('/', getAll);
router.get('/by-id', (req, res, next) => validateWarehouseId(req.query.id, res, next), getSingle);
router.post('/', validateWarehouse, create);
router.put('/:id', validateWarehouse, update);
router.delete('/:id', remove);

router.use((req, res) => res.status(404).json({ error: 'Warehouse endpoint not found' }));

router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.status === 400) {
    return res.status(400).json({ error: 'Invalid warehouse request' });
  }
  if (error.status === 413) {
    return res.status(413).json({ error: 'Warehouse request body is too large' });
  }
  if (error.status === 415) {
    return res.status(415).json({ error: 'Unsupported request body encoding or charset' });
  }

  console.error('Warehouse request failed');
  res.status(500).json({ error: 'Could not process warehouse request' });
});

export default router;
