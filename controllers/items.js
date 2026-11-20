import { ObjectId } from 'mongodb';

/**
 * Retrieves all items from the database.
 */
export async function getAll(req, res, next) {
  // #swagger.summary = 'Get all items'
  try {
    const items = await req.app.locals.items.find().toArray();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a single item by its ID.
 * The ID is expected to be in res.locals.itemId, validated by the middleware.
 */
export async function getSingle(req, res, next) {
  // #swagger.summary = 'Get an item by id'
  try {
    const item = await req.app.locals.items.findOne({ _id: res.locals.itemId });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a new item in the database.
 * The data is expected to be in res.locals.item, validated by the middleware.
 */
export async function create(req, res, next) {
  // #swagger.summary = 'Create an item'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Item' } }
  try {
    const { insertedId } = await req.app.locals.items.insertOne(res.locals.item);
    res.location(`/items/by-id?id=${insertedId}`).status(201).json({ id: insertedId });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates an existing item by its ID.
 * Uses $set to only update the provided fields.
 */
export async function update(req, res, next) {
  // #swagger.summary = 'Update an item'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Item' } }
  try {
    const result = await req.app.locals.items.updateOne(
      { _id: res.locals.itemId },
      { $set: res.locals.item }
    );
    if (!result.matchedCount) return res.status(404).json({ error: 'Item not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes an item by its ID.
 */
export async function remove(req, res, next) {
  // #swagger.summary = 'Delete an item'
  try {
    const result = await req.app.locals.items.deleteOne({ _id: res.locals.itemId });
    if (!result.deletedCount) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to validate that the provided ID is a valid MongoDB ObjectId.
 * Saves the parsed ObjectId in res.locals.itemId for the next middleware.
 */
export function validateItemId(id, res, next) {
  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'A valid item ID is required' });
  }
  res.locals.itemId = new ObjectId(id);
  next();
}

/**
 * Middleware to validate the request body for creating or updating an item.
 * Ensures all required fields are present and have the correct data types.
 * Saves the sanitized data in res.locals.item.
 */
export function validateItem(req, res, next) {
  const { name, price, inStock } = req.body ?? {};
  const fields = {};

  if (typeof name !== 'string' || !name.trim()) {
    fields.name = 'Enter a non-empty name';
  }
  if (typeof price !== 'number' || price <= 0) {
    fields.price = 'Price must be a number greater than 0';
  }
  if (!Number.isInteger(inStock) || inStock < 0) {
    fields.inStock = 'InStock must be a positive integer';
  }

  if (Object.keys(fields).length) {
    return res.status(400).json({ error: 'Invalid item data', fields });
  }

  res.locals.item = {
    name: name.trim(),
    price,
    inStock,
  };
  next();
}