import { ObjectId } from 'mongodb';

export async function getAll(req, res) {
  // #swagger.summary = 'Get all warehouses'
  const warehouses = await req.app.locals.warehouses.find().toArray();
  res.status(200).json(warehouses);
}

export async function getSingle(req, res) {
  // #swagger.summary = 'Get a warehouse by id'
  const warehouse = await req.app.locals.warehouses.findOne({ _id: res.locals.warehouseId });
  if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });

  res.status(200).json(warehouse);
}

export async function create(req, res) {
  // #swagger.summary = 'Create a warehouse'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Warehouse' } }
  const { insertedId } = await req.app.locals.warehouses.insertOne(res.locals.warehouse);
  res.location(`/warehouses/by-id?id=${insertedId}`).status(201).json({ id: insertedId });
}

export async function update(req, res) {
  // #swagger.summary = 'Update a warehouse'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Warehouse' } }
  const result = await req.app.locals.warehouses.updateOne(
    { _id: res.locals.warehouseId },
    { $set: res.locals.warehouse },
  );
  if (!result.matchedCount) return res.status(404).json({ error: 'Warehouse not found' });

  res.status(204).end();
}

export async function remove(req, res) {
  // #swagger.summary = 'Delete a warehouse'
  const result = await req.app.locals.warehouses.deleteOne({ _id: res.locals.warehouseId });
  if (!result.deletedCount) return res.status(404).json({ error: 'Warehouse not found' });

  res.status(200).json({ message: 'Warehouse deleted' });
}

export function validateWarehouseId(id, res, next) {
  if (typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'A valid warehouse ID is required' });
  }

  res.locals.warehouseId = new ObjectId(id);
  next();
}

export function validateWarehouse(req, res, next) {
  const { name, address, employees } = req.body ?? {};
  const fields = {};

  if (typeof name !== 'string' || !name.trim()) fields.name = 'Enter a non-empty name';
  if (typeof address !== 'string' || !address.trim()) fields.address = 'Enter a non-empty address';
  if (!Array.isArray(employees) || employees.some(
    (id) => typeof id !== 'string' || !ObjectId.isValid(id),
  )) {
    fields.employees = 'Provide an array of employee IDs';
  }

  if (Object.keys(fields).length) {
    return res.status(400).json({ error: 'Invalid warehouse data', fields });
  }

  res.locals.warehouse = {
    name: name.trim(),
    address: address.trim(),
    employees: employees.map((id) => new ObjectId(id)),
  };
  next();
}
