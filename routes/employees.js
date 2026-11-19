import express from 'express';

import * as controller from '../controllers/employee.js';

const DATABASE_DOWN = new Set([
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoServerSelectionError',
  'MongoNotConnectedError',
  'MongoTopologyClosedError',
]);

const router = express.Router();

router.use(express.json());

router.get('/', controller.getAll);
router.get('/:id', controller.getSingle);
router.post('/', controller.createEmployee);
router.put('/:id', controller.updateEmployee);
router.delete('/:id', controller.deleteEmployee);

router.use((req, res) => {
  res.status(404).json({
    message: `${req.method} ${req.originalUrl} is not an employee route. See /api-docs for the routes.`,
  });
});

router.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.name === 'BSONError') {
    return res
      .status(400)
      .json({ message: 'The id is not valid. An id must be a 24 character hex string.' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: `The request body is not valid JSON. ${err.message}` });
  }

  const status = err.status ?? err.statusCode;
  if (status >= 400 && status < 500) {
    return res.status(status).json({ message: err.message });
  }

  console.error(`${req.method} ${req.originalUrl} failed:`, err);

  if (DATABASE_DOWN.has(err.name)) {
    return res
      .status(503)
      .json({ message: 'The database is not available right now. Please try again in a minute.' });
  }

  res.status(500).json({ message: 'Something went wrong on the server. Please try again later.' });
});

export default router;
