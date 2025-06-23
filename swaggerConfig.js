import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 🔧 Re-create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  apis: [path.join(__dirname, "./routes/*.js")],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
