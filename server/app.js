const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const inventoryRoutes = require('./routes/inventory.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/inventory', inventoryRoutes);

app.get('/', (req, res) => {
  res.send('StockSense API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
