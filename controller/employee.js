import { ObjectId } from 'mongodb';

import { getDb } from '../db/connect.js';

const employeeCollection = () => getDb().collection('employee');

const DATABASE_DOWN = new Set([
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
  'MongoServerSelectionError',
  'MongoNotConnectedError',
  'MongoTopologyClosedError',
]);

const notFound = (res, id) => res.status(404).json({ message: `No employee found with id ${id}` });

const sendError = (req, res, err) => {
  if (err.name === 'BSONError') {
    return res
      .status(400)
      .json({ message: 'The id is not valid. An id must be a 24 character hex string.' });
  }

  console.error(`${req.method} ${req.originalUrl} failed:`, err);

  if (DATABASE_DOWN.has(err.name)) {
    return res
      .status(503)
      .json({ message: 'The database is not available right now. Please try again in a minute.' });
  }

  res.status(500).json({ message: 'Something went wrong on the server. Please try again later.' });
};

const employeeFromBody = (body) => ({
  job_title: body.job_title,
  first_name: body.first_name,
  last_name: body.last_name,
  warehouse_assigned: ObjectId.createFromHexString(body.warehouse_assigned),
  wage: body.wage,
  wage_type: body.wage_type,
  active: body.active,
});

export const getAll = async (req, res) => {
  // #swagger.tags = ['Employees']
  // #swagger.summary = 'Get all employees'
  // #swagger.responses[200] = { description: 'OK', schema: [{ $ref: '#/definitions/Employee' }] }
  try {
    const employees = await employeeCollection().find().toArray();
    res.status(200).json(employees);
  } catch (err) {
    sendError(req, res, err);
  }
};

export const getSingle = async (req, res) => {
  // #swagger.tags = ['Employees']
  // #swagger.summary = 'Get an employee by id'
  // #swagger.responses[200] = { description: 'OK', schema: { $ref: '#/definitions/Employee' } }
  // #swagger.responses[400] = { description: 'Invalid id', schema: { $ref: '#/definitions/Error' } }
  // #swagger.responses[404] = { description: 'Employee not found', schema: { $ref: '#/definitions/Error' } }
  const { id } = req.params;

  try {
    const employee = await employeeCollection().findOne({ _id: new ObjectId(id) });
    if (!employee) return notFound(res, id);

    res.status(200).json(employee);
  } catch (err) {
    sendError(req, res, err);
  }
};

export const createEmployee = async (req, res) => {
  // #swagger.tags = ['Employees']
  // #swagger.summary = 'Create an employee'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Employee' } }
  // #swagger.responses[201] = { description: 'Created', schema: { $ref: '#/definitions/EmployeeId' } }
  // #swagger.responses[400] = { description: 'Invalid warehouse_assigned id', schema: { $ref: '#/definitions/Error' } }
  try {
    const result = await employeeCollection().insertOne(employeeFromBody(req.body));

    res
      .status(201)
      .location(`${req.baseUrl}/${result.insertedId}`)
      .json({ id: result.insertedId });
  } catch (err) {
    sendError(req, res, err);
  }
};

export const updateEmployee = async (req, res) => {
  // #swagger.tags = ['Employees']
  // #swagger.summary = 'Update an employee'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Employee' } }
  // #swagger.responses[204] = { description: 'Updated' }
  // #swagger.responses[400] = { description: 'Invalid id or warehouse_assigned id', schema: { $ref: '#/definitions/Error' } }
  // #swagger.responses[404] = { description: 'Employee not found', schema: { $ref: '#/definitions/Error' } }
  const { id } = req.params;

  try {
    const result = await employeeCollection().replaceOne(
      { _id: new ObjectId(id) },
      employeeFromBody(req.body)
    );
    if (result.matchedCount === 0) return notFound(res, id);

    res.status(204).send();
  } catch (err) {
    sendError(req, res, err);
  }
};

export const deleteEmployee = async (req, res) => {
  // #swagger.tags = ['Employees']
  // #swagger.summary = 'Delete an employee'
  // #swagger.responses[200] = { description: 'Deleted', schema: { $ref: '#/definitions/Employee' } }
  // #swagger.responses[400] = { description: 'Invalid id', schema: { $ref: '#/definitions/Error' } }
  // #swagger.responses[404] = { description: 'Employee not found', schema: { $ref: '#/definitions/Error' } }
  const { id } = req.params;

  try {
    const employee = await employeeCollection().findOneAndDelete({ _id: new ObjectId(id) });
    if (!employee) return notFound(res, id);

    res.status(200).json(employee);
  } catch (err) {
    sendError(req, res, err);
  }
};
