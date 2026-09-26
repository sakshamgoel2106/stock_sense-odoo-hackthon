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

const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/operations')
  .post(createOperation)
  .get(getOperations);

router.route('/operations/:id')
  .get(getOperationById);

router.route('/operations/:id/validate')
  .post(validateOperationController);

router.route('/operations/:id/approve')
  .put(approveOperation);

router.route('/operations/:id/reject')
  .put(rejectOperation);

router.route('/stock')
  .get(getStock);

router.route('/ledger')
  .get(getLedger);

router.route('/aging')
  .get(getStockAging);

router.route('/valuation')
  .get(getValuation);

router.route('/forecast')
  .get(getForecast);

module.exports = router;
