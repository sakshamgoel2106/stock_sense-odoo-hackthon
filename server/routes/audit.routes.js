const express = require('express');
const router = express.Router();
const {
  createAudit,
  updateAuditCounts,
  submitAudit,
  getAudits,
  getAuditById,
  approveAudit,
  rejectAudit,
  recountAudit
} = require('../controllers/audit.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .post(createAudit)
  .get(getAudits);

router.route('/:id')
  .get(getAuditById);

router.route('/:id/count')
  .put(updateAuditCounts);

router.route('/:id/submit')
  .post(submitAudit);

router.route('/:id/recount')
  .post(recountAudit);

// Manager only routes
router.use(authorize('ADMIN', 'MANAGER'));

router.route('/:id/approve')
  .post(approveAudit);

router.route('/:id/reject')
  .post(rejectAudit);

module.exports = router;
