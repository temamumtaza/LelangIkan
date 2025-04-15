const express = require('express');
const {
  getAllFish,
  getFish,
  createFish,
  updateFish,
  deleteFish
} = require('../controllers/fish');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.route('/')
  .get(getAllFish)
  .post(protect, authorize('seller', 'admin'), upload.array('images', 5), createFish);

router.route('/:id')
  .get(getFish)
  .put(protect, updateFish)
  .delete(protect, deleteFish);

module.exports = router; 