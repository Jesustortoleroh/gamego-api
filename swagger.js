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
  tags: [
    { name: 'Items', description: 'The video games, consoles and accessories GameGo sells' },
    { name: 'Warehouses', description: 'The warehouses that store the inventory' },
    { name: 'Employees', description: 'The people who work at the warehouses' },
    { name: 'Customers', description: 'The people who purchase the products' },
    { name: 'OAuth', description: 'Log in with GitHub (planned, not built yet)' },
  ],
  '@definitions': {
    Item: {
      type: 'object',
      required: ['name', 'price', 'inStock'],
      properties: {
        _id: { type: 'string', readOnly: true, example: '6af5ea6063f99c7e6388b827' },
        name: { type: 'string', example: 'Super Mario Bros.' },
        price: { type: 'number', example: 59.99 },
        inStock: { type: 'integer', description: 'How many are in stock', example: 10 },
      },
    },
    Warehouse: {
      type: 'object',
      required: ['name', 'address', 'employees'],
      properties: {
        _id: { type: 'string', readOnly: true, example: '6af5eaea63f99c7e6388b82c' },
        name: { type: 'string', example: 'Boise warehouse' },
        address: { type: 'string', example: '100 Main St, Boise, ID 83702' },
        employees: {
          type: 'array',
          description: 'The _ids of the employees who work here',
          items: { type: 'string' },
          example: ['6af5eb6a63f99c7e6388b832'],
        },
      },
    },
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
    Customer: {
      type: 'object',
      required: [
        'first_name',
        'last_name',
        'email',
        'address',
        'phone_number',
        'favorite_console',
        'shopping_cart',
      ],
      properties: {
        _id: { type: 'string', readOnly: true, example: '6af5eb6a63f99c7e6388b833' },
        first_name: { type: 'string', example: 'Ada' },
        last_name: { type: 'string', example: 'Obi' },
        email: {
          type: 'string',
          format: 'email',
          example: 'ada.obi@example.com',
        },
        address: {
          type: 'string',
          description: 'The shipping and billing address of the customer',
          example: '742 Evergreen Terrace, Springfield, IL 62704',
        },
        phone_number: {
          type: 'string',
          example: '555-019-2834',
        },
        favorite_console: {
          type: 'string',
          enum: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'PC'],
          example: 'PlayStation 5',
        },
        shopping_cart: {
          type: 'array',
          description: 'List of product _ids currently in the customer’s cart',
          items: {
            type: 'string',
          },
          example: ['6af5eaea63f99c7e6388b82c', '6af5eaea63f99c7e6388b82d'],
        },
      },
    },
  },
};

const outputFile = './swagger.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
