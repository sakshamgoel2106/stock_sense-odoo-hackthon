const express = require('express');
const router = express.Router();
const {
  createOperation,
  getOperations,
  getOperationById,
  validateOperationController,
  getStock,
  getLedger
} = require('../controllers/inventory.controller');

const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/operations')
  .post(createOperation)
  .get(getOperations);

router.route('/operations/:id')
  .get(getOperationById);

router.route('/operations/:id/validate')
  .post(validateOperationController);

router.route('/stock')
  .get(getStock);

router.route('/ledger')
  .get(getLedger);

module.exports = router;
