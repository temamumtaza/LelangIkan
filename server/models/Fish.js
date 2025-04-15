const mongoose = require('mongoose');

const FishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a fish name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weight: {
    type: Number,
    required: [true, 'Please specify the weight in kg']
  },
  category: {
    type: String,
    required: [true, 'Please specify fish category'],
    enum: ['freshwater', 'saltwater', 'shellfish', 'other']
  },
  condition: {
    type: String,
    required: [true, 'Please specify the condition'],
    enum: ['fresh', 'frozen', 'processed']
  },
  location: {
    type: String,
    required: [true, 'Please add the fishing location or source']
  },
  images: [{
    type: String,
    required: [true, 'Please add at least one image']
  }],
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isAuctioned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Fish', FishSchema); 