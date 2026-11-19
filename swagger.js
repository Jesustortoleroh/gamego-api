import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'GameGo API',
    description:
      "The API for GameGo, an online store that sells new and retro video games, consoles and video game accessories. It keeps track of the store's warehouses, inventory, customers and employees.",
  },
  host: null,
  schemes: null,
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [{ name: 'Employees', description: 'The people who work at the warehouses' }],
  '@definitions': {
    Employee: {
      type: 'object',
      required: [
        'job_title',
        'first_name',
        'last_name',
        'warehouse_assigned',
        'wage',
        'wage_type',
        'active',
      ],
      properties: {
        _id: { type: 'string', readOnly: true, example: '6af5eb6a63f99c7e6388b832' },
        job_title: {
          type: 'string',
          enum: ['Warehouse Worker', 'Warehouse Manager'],
          example: 'Warehouse Worker',
        },
        first_name: { type: 'string', example: 'Ada' },
        last_name: { type: 'string', example: 'Obi' },
        warehouse_assigned: {
          type: 'string',
          description: 'The _id of the warehouse the employee works at',
          example: '6af5eaea63f99c7e6388b82c',
        },
        wage: {
          type: 'number',
          description: 'Per hour when wage_type is Hourly, per year when it is Salary',
          example: 18.5,
        },
        wage_type: { type: 'string', enum: ['Hourly', 'Salary'], example: 'Hourly' },
        active: {
          type: 'boolean',
          description: 'false if the employee no longer works at GameGo',
          example: true,
        },
      },
    },
    EmployeeId: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '6af5eb6a63f99c7e6388b832' },
      },
    },
    Error: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'No employee found with id 6af5eb6a63f99c7e6388b832' },
      },
    },
  },
};

const outputFile = './swagger.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
