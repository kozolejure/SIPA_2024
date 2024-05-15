const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://admin:admin@localhost:27018/userservice?authSource=admin', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Swagger setup
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service Expiry API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'], // Files containing Swagger annotations
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const expiryRoutes = require('./routes/expiry');
app.use('/', expiryRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
