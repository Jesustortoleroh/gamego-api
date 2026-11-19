import express from 'express';
import {
  create, getAll, getSingle, remove, update, validateItem, validateItemId,
} from '../controllers/items.js';

const router = express.Router();

// Parse JSON bodies for this router
router.use(express.json());

// Intercept the :id route parameter and validate it using validateItemId
router.param('id', (req, res, next, id) => validateItemId(id, res, next));

// GET all items
router.get('/', getAll);

// GET a single item by query string (?id=...)
router.get('/by-id', (req, res, next) => validateItemId(req.query.id, res, next), getSingle);

// POST a new item (validate body first)
router.post('/', validateItem, create);

// PUT (update) an item by ID (validate ID and body first)
router.put('/:id', validateItem, update);

// DELETE an item by ID (validate ID first via router.param)
router.delete('/:id', remove);

// Catch-all for undefined item routes
router.use((req, res) => res.status(404).json({ error: 'Item endpoint not found' }));

// Error handling middleware specific to this router
router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.status === 400) {
    return res.status(400).json({ error: 'Invalid item request' });
  }
  if (error.status === 413) {
    return res.status(413).json({ error: 'Item request body is too large' });
  }
  if (error.status === 415) {
    return res.status(415).json({ error: 'Unsupported request body encoding or charset' });
  }

  console.error('Item request failed');
  res.status(500).json({ error: 'Could not process item request' });
});

export default router;