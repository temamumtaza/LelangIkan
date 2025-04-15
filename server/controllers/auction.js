const Auction = require('../models/Auction');
const Fish = require('../models/Fish');

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
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
    query = Auction.find(JSON.parse(queryStr))
      .populate({
        path: 'fish',
        select: 'name images weight category condition'
      })
      .populate({
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
    const total = await Auction.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const auctions = await query;

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
      count: auctions.length,
      pagination,
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
exports.getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate({
        path: 'fish',
        select: 'name description images weight category condition location'
      })
      .populate({
        path: 'seller',
        select: 'name profileImage rating'
      })
      .populate({
        path: 'bids.bidder',
        select: 'name profileImage'
      });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new auction
// @route   POST /api/auctions
// @access  Private
exports.createAuction = async (req, res) => {
  try {
    req.body.seller = req.user.id;

    // Check if fish exists and belongs to the seller
    const fish = await Fish.findById(req.body.fish);

    if (!fish) {
      return res.status(404).json({
        success: false,
        message: 'Fish not found'
      });
    }

    if (fish.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to create auction for this fish'
      });
    }

    // Check if fish is already in an auction
    if (fish.isAuctioned) {
      return res.status(400).json({
        success: false,
        message: 'Fish is already in an auction'
      });
    }

    // Validate auction details
    if (!req.body.startingPrice || req.body.startingPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid starting price'
      });
    }

    if (!req.body.minBidIncrement || req.body.minBidIncrement <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid minimum bid increment'
      });
    }

    if (!req.body.startTime || !req.body.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid start and end times'
      });
    }

    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    const now = new Date();

    if (startTime < now) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in the future'
      });
    }

    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Create auction
    const auction = await Auction.create(req.body);

    // Update fish as being in auction
    fish.isAuctioned = true;
    await fish.save();

    res.status(201).json({
      success: true,
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Private
exports.updateAuction = async (req, res) => {
  try {
    let auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Make sure user is the seller
    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this auction'
      });
    }

    // Cannot update an active or completed auction
    if (auction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update auction that is ${auction.status}`
      });
    }

    // Update auction
    auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel auction
// @route   PUT /api/auctions/:id/cancel
// @access  Private
exports.cancelAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Make sure user is the seller
    if (auction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this auction'
      });
    }

    // Cannot cancel completed auction
    if (auction.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed auction'
      });
    }

    // Update auction status
    auction.status = 'cancelled';
    await auction.save();

    // Update fish status
    const fish = await Fish.findById(auction.fish);
    if (fish) {
      fish.isAuctioned = false;
      await fish.save();
    }

    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 