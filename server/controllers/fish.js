const Fish = require('../models/Fish');
const path = require('path');
const fs = require('fs');

// @desc    Get all fish
// @route   GET /api/fish
// @access  Public
exports.getAllFish = async (req, res) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Fish.find(JSON.parse(queryStr)).populate({
      path: 'seller',
      select: 'name profileImage rating'
    });

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Fish.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const fish = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: fish.length,
      pagination,
      data: fish
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single fish
// @route   GET /api/fish/:id
// @access  Public
exports.getFish = async (req, res) => {
  try {
    const fish = await Fish.findById(req.params.id).populate({
      path: 'seller',
      select: 'name profileImage rating'
    });

    if (!fish) {
      return res.status(404).json({
        success: false,
        message: 'Fish not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fish
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new fish
// @route   POST /api/fish
// @access  Private
exports.createFish = async (req, res) => {
  try {
    // Add seller to req.body
    req.body.seller = req.user.id;

    // Validate images
    if (!req.files || !req.files.length) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const fish = await Fish.create(req.body);

    // Add image paths to fish
    const images = req.files.map(file => file.filename);
    fish.images = images;
    await fish.save();

    res.status(201).json({
      success: true,
      data: fish
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update fish
// @route   PUT /api/fish/:id
// @access  Private
exports.updateFish = async (req, res) => {
  try {
    let fish = await Fish.findById(req.params.id);

    if (!fish) {
      return res.status(404).json({
        success: false,
        message: 'Fish not found'
      });
    }

    // Make sure user is the seller
    if (fish.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this fish'
      });
    }

    // Cannot update if already in auction
    if (fish.isAuctioned) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update fish that is already in auction'
      });
    }

    fish = await Fish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: fish
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete fish
// @route   DELETE /api/fish/:id
// @access  Private
exports.deleteFish = async (req, res) => {
  try {
    const fish = await Fish.findById(req.params.id);

    if (!fish) {
      return res.status(404).json({
        success: false,
        message: 'Fish not found'
      });
    }

    // Make sure user is the seller
    if (fish.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this fish'
      });
    }

    // Cannot delete if already in auction
    if (fish.isAuctioned) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete fish that is already in auction'
      });
    }

    // Delete images
    fish.images.forEach(image => {
      const imagePath = path.join(__dirname, '../uploads', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await fish.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 