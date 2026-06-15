const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DineFlow API',
      version: '1.0.0',
      description: 'REST API for the DineFlow restaurant management ecosystem. Handles auth, restaurants, tables, orders, reservations, staff, and analytics.',
      contact: {
        name: 'DineFlow Team',
      },
    },
    servers: [
      { url: 'http://localhost:8000/api', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['customer', 'staff', 'owner'] },
            walletBalance: { type: 'number' },
            avatar: { type: 'string' },
            customerDetails: { type: 'object' },
            staffDetails: { type: 'object' },
            ownerDetails: { type: 'object' },
          },
        },
        Restaurant: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            coverImage: { type: 'string' },
            rating: { type: 'number' },
            cuisines: { type: 'array', items: { type: 'string' } },
            address: { type: 'string' },
            openingHours: { type: 'string' },
            inviteCode: { type: 'string' },
          },
        },
        Table: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            restaurantId: { type: 'string' },
            tableNumber: { type: 'integer' },
            capacity: { type: 'integer' },
            status: { type: 'string', enum: ['available', 'occupied', 'reserved', 'cleaning'] },
            location: { type: 'string' },
            x: { type: 'number' },
            y: { type: 'number' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            restaurantId: { type: 'string' },
            userId: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            total: { type: 'number' },
            status: { type: 'string', enum: ['new', 'preparing', 'ready', 'served', 'paid', 'cancelled'] },
            paymentMethod: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            menuItemId: { type: 'string' },
            name: { type: 'string' },
            quantity: { type: 'integer' },
            price: { type: 'number' },
          },
        },
        Reservation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            restaurantId: { type: 'string' },
            restaurantName: { type: 'string' },
            userId: { type: 'string' },
            guestsCount: { type: 'integer' },
            reservationDate: { type: 'string' },
            reservationTime: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
      },
    },
    responses: {
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Restaurants', description: 'Restaurant & menu operations' },
      { name: 'Tables', description: 'Table management' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Reservations', description: 'Reservation management' },
      { name: 'Staff', description: 'Staff management (owner only)' },
      { name: 'Analytics', description: 'Dashboard analytics' },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
