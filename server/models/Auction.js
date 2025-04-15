const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  fish: {
    type: mongoose.Schema.ObjectId,
    ref: 'Fish',
    required: true
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  startingPrice: {
    type: Number,
    required: [true, 'Please add a starting price']
  },
  currentPrice: {
    type: Number,
    default: function() {
      return this.startingPrice;
    }
  },
  minBidIncrement: {
    type: Number,
    required: [true, 'Please specify the minimum bid increment']
  },
  buyNowPrice: {
    type: Number
  },
  reservePrice: {
    type: Number
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  winner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  bids: [
    {
      bidder: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      time: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update auction status based on time
AuctionSchema.pre('save', function(next) {
  const now = new Date();
  
  if (now >= this.startTime && now < this.endTime && this.status !== 'cancelled') {
    this.status = 'active';
  } else if (now >= this.endTime && this.status !== 'cancelled') {
    this.status = 'completed';
  }
  
  next();
});

// Add a bid to the auction
AuctionSchema.methods.addBid = function(userId, amount) {
  if (amount < this.currentPrice + this.minBidIncrement) {
    throw new Error('Bid amount must be at least the current price plus the minimum increment');
  }
  
  this.bids.push({ bidder: userId, amount });
  this.currentPrice = amount;
  
  // If bid equals or exceeds buyNowPrice, end auction
  if (this.buyNowPrice && amount >= this.buyNowPrice) {
    this.winner = userId;
    this.status = 'completed';
    this.endTime = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('Auction', AuctionSchema); 