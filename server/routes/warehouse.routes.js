const express = require('express');
const router = express.Router();
const {
  getWarehouses,
  createWarehouse,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse
} = require('../controllers/warehouse.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(getWarehouses)
  .post(createWarehouse);

router.route('/:id')
  .get(getWarehouseById)
  .put(updateWarehouse)
  .delete(deleteWarehouse);

module.exports = router;
