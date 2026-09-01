// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerJSDoc = require('swagger-jsdoc') as (options: object) => object;
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { env } from './env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const options: any = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node.js Starter Template API',
      version: '2.0.0',
      description:
        'Production-grade REST API starter with TypeScript, Prisma, and JWT authentication.',
      contact: {
        name: 'Subham Haldar',
        url: 'https://github.com/Subham07-t',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: {} },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Health', description: 'Server health & status' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/modules/**/*.ts'],
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API Docs — Starter Template',
    }),
  );

  // Serve raw JSON spec
  app.get('/docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });
}
