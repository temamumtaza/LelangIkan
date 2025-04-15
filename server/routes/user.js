const express = require('express');
const {
  getUsers,
  getUser,
  uploadProfileImage,
  verifyUser
} = require('../controllers/user');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router
  .route('/')
  .get(protect, authorize('admin'), getUsers);

router
  .route('/:id')
  .get(protect, getUser);

router
  .route('/upload')
  .put(protect, upload.single('image'), uploadProfileImage);

router
  .route('/:id/verify')
  .put(protect, authorize('admin'), verifyUser);

module.exports = router; 