const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration de Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Documentation de l\'API pour le projet de gestion des catégories',
    contact: {
      name: 'Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:8080/api',
      description: 'API locale',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Chemin vers vos fichiers de route contenant des commentaires Swagger
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger disponible sur http://localhost:8080/api-docs');
};

module.exports = setupSwagger;
