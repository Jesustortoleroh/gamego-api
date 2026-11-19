import { ObjectId } from 'mongodb';

const notFound = (res, id) => res.status(404).json({ message: `No employee found with id ${id}` });

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
  const employees = await req.app.locals.employees.find().toArray();
  res.status(200).json(employees);
};

export const getSingle = async (req, res) => {
  // #swagger.tags = ['Employees']
  // #swagger.summary = 'Get an employee by id'
  // #swagger.responses[200] = { description: 'OK', schema: { $ref: '#/definitions/Employee' } }
  // #swagger.responses[400] = { description: 'Invalid id', schema: { $ref: '#/definitions/Error' } }
  // #swagger.responses[404] = { description: 'Employee not found', schema: { $ref: '#/definitions/Error' } }
  const { id } = req.params;

  const employee = await req.app.locals.employees.findOne({ _id: new ObjectId(id) });
  if (!employee) return notFound(res, id);

  res.status(200).json(employee);
};

export const createEmployee = async (req, res) => {
  // #swagger.tags = ['Employees']
  // #swagger.summary = 'Create an employee'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Employee' } }
  // #swagger.responses[201] = { description: 'Created', schema: { $ref: '#/definitions/EmployeeId' } }
  // #swagger.responses[400] = { description: 'Invalid warehouse_assigned id', schema: { $ref: '#/definitions/Error' } }
  const result = await req.app.locals.employees.insertOne(employeeFromBody(req.body));

  res
    .status(201)
    .location(`${req.baseUrl}/${result.insertedId}`)
    .json({ id: result.insertedId });
};

export const updateEmployee = async (req, res) => {
  // #swagger.tags = ['Employees']
  // #swagger.summary = 'Update an employee'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Employee' } }
  // #swagger.responses[204] = { description: 'Updated' }
  // #swagger.responses[400] = { description: 'Invalid id or warehouse_assigned id', schema: { $ref: '#/definitions/Error' } }
  // #swagger.responses[404] = { description: 'Employee not found', schema: { $ref: '#/definitions/Error' } }
  const { id } = req.params;

  const result = await req.app.locals.employees.replaceOne(
    { _id: new ObjectId(id) },
    employeeFromBody(req.body)
  );
  if (result.matchedCount === 0) return notFound(res, id);

  res.status(204).send();
};

export const deleteEmployee = async (req, res) => {
  // #swagger.tags = ['Employees']
  // #swagger.summary = 'Delete an employee'
  // #swagger.responses[200] = { description: 'Deleted', schema: { $ref: '#/definitions/Employee' } }
  // #swagger.responses[400] = { description: 'Invalid id', schema: { $ref: '#/definitions/Error' } }
  // #swagger.responses[404] = { description: 'Employee not found', schema: { $ref: '#/definitions/Error' } }
  const { id } = req.params;

  const employee = await req.app.locals.employees.findOneAndDelete({ _id: new ObjectId(id) });
  if (!employee) return notFound(res, id);

  res.status(200).json(employee);
};
