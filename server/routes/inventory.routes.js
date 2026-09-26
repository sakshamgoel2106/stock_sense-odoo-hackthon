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

// Since we are Member 1 and Member 4 handles auth, we'll assume a 'protect' middleware exists.
// For now, we'll implement a dummy protect or skip it to test our logic.
// const { protect } = require('../middleware/auth.middleware');

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
