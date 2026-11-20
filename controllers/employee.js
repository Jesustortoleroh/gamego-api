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
  // #swagger.summary = 'Get all employees'
  const employees = await req.app.locals.employees.find().toArray();
  res.status(200).json(employees);
};

export const getSingle = async (req, res) => {
  // #swagger.summary = 'Get an employee by id'
  const { id } = req.params;

  const employee = await req.app.locals.employees.findOne({ _id: new ObjectId(id) });
  if (!employee) return notFound(res, id);

  res.status(200).json(employee);
};

export const createEmployee = async (req, res) => {
  // #swagger.summary = 'Create an employee'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Employee' } }
  const result = await req.app.locals.employees.insertOne(employeeFromBody(req.body));

  res
    .status(201)
    .location(`${req.baseUrl}/${result.insertedId}`)
    .json({ id: result.insertedId });
};

export const updateEmployee = async (req, res) => {
  // #swagger.summary = 'Update an employee'
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/Employee' } }
  const { id } = req.params;

  const result = await req.app.locals.employees.replaceOne(
    { _id: new ObjectId(id) },
    employeeFromBody(req.body)
  );
  if (result.matchedCount === 0) return notFound(res, id);

  res.status(204).send();
};

export const deleteEmployee = async (req, res) => {
  // #swagger.summary = 'Delete an employee'
  const { id } = req.params;

  const employee = await req.app.locals.employees.findOneAndDelete({ _id: new ObjectId(id) });
  if (!employee) return notFound(res, id);

  res.status(200).json(employee);
};
