const express = require('express');
const {
  getAuctions,
  getAuction,
  createAuction,
  updateAuction,
  cancelAuction
} = require('../controllers/auction');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .get(getAuctions)
  .post(protect, authorize('seller', 'admin'), createAuction);

router.route('/:id')
  .get(getAuction)
  .put(protect, updateAuction);

router.route('/:id/cancel')
  .put(protect, cancelAuction);

module.exports = router; 