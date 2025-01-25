const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");

const whitelist = ["http://localhost:3000", "http://localhost:4200", "https://futursite.com", "http://localhost:5173"];

const app = express();

mongoose.connect("mongodb+srv://moelbib:iunMFKXyRcnlIKtM@cluster0.c4fxnz1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("Connexion à MongoDB réussie !"))
.catch((error) => console.error("Erreur lors de la connexion à MongoDB :", error.message));

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Category Management API",
      version: "1.0.0",
      description: "API pour gérer les catégories et les utilisateurs",
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Serveur de développement"
      }
    ],
  },
  apis: ["./routes/category.js"], // Fichiers où Swagger recherche les annotations
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
//console.log(swaggerDocs);

// Middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Ajout de Swagger
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true); // Permet les requêtes depuis les origines dans la liste blanche ou sans origine
    } else {
      callback(new Error('Not allowed by CORS')); // Bloque les requêtes des origines non autorisées
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
  credentials: true, // Permet l'envoi des cookies ou des informations d'authentification
}));

app.use((err, req, res, next) => {
  if (err.name === 'Error' && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Access Denied by CORS' });
  }
  next(err);
});

app.use(morgan('dev'))
    .use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
