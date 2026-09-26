const express = require('express');
const router = express.Router();
const {
  createOperation,
  getOperations,
  getOperationById,
  validateOperationController,
  getStock,
  getLedger,
  getStockAging,
  getValuation,
  getForecast,
  approveOperation,
  rejectOperation
} = require('../controllers/inventory.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/operations')
  .post(createOperation)
  .get(getOperations);

router.route('/operations/:id')
  .get(getOperationById);

router.route('/operations/:id/validate')
  .post(validateOperationController);

router.route('/operations/:id/approve')
  .put(authorize('ADMIN', 'MANAGER'), approveOperation);

router.route('/operations/:id/reject')
  .put(authorize('ADMIN', 'MANAGER'), rejectOperation);

router.route('/stock')
  .get(getStock);

router.route('/ledger')
  .get(authorize('ADMIN', 'MANAGER'), getLedger);

router.route('/aging')
  .get(authorize('ADMIN', 'MANAGER'), getStockAging);

router.route('/valuation')
  .get(authorize('ADMIN', 'MANAGER'), getValuation);

router.route('/forecast')
  .get(authorize('ADMIN', 'MANAGER'), getForecast);

module.exports = router;
