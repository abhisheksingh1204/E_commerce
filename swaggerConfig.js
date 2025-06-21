const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce app",
      version: "1.0.0",
      description: "API documentation of Ecommerce app",
    },
    servers: [
      {
        url: "http://localhost:3001", // local server
      },
    ],
  },
  apis: [path.join(__dirname, "./routes/*.js")], // ✅ This must be relative to swaggerConfig.js
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
