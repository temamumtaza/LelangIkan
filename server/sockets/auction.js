const Auction = require('../models/Auction');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Socket.io authentication middleware
  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
    } else {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.decoded.id}`);

    // Join auction room
    socket.on('join-auction', async (auctionId) => {
      try {
        const auction = await Auction.findById(auctionId)
          .populate('fish', 'name images')
          .populate('seller', 'name');

        if (!auction) {
          socket.emit('auction-error', { message: 'Auction not found' });
          return;
        }

        socket.join(auctionId);
        socket.emit('auction-joined', { auction });
        io.to(auctionId).emit('user-joined', { 
          message: `User ${socket.decoded.id} joined the auction` 
        });

      } catch (error) {
        socket.emit('auction-error', { message: error.message });
      }
    });

    // Leave auction room
    socket.on('leave-auction', (auctionId) => {
      socket.leave(auctionId);
      io.to(auctionId).emit('user-left', { 
        message: `User ${socket.decoded.id} left the auction` 
      });
    });

    // Place bid
    socket.on('place-bid', async ({ auctionId, bidAmount }) => {
      try {
        const userId = socket.decoded.id;
        const auction = await Auction.findById(auctionId);

        if (!auction) {
          socket.emit('bid-error', { message: 'Auction not found' });
          return;
        }

        if (auction.status !== 'active') {
          socket.emit('bid-error', { message: 'This auction is not active' });
          return;
        }

        if (auction.seller.toString() === userId) {
          socket.emit('bid-error', { message: 'You cannot bid on your own auction' });
          return;
        }

        // Get user
        const user = await User.findById(userId);
        if (!user) {
          socket.emit('bid-error', { message: 'User not found' });
          return;
        }

        // Validate bid amount
        if (bidAmount < auction.currentPrice + auction.minBidIncrement) {
          socket.emit('bid-error', { 
            message: `Bid must be at least ${auction.currentPrice + auction.minBidIncrement}` 
          });
          return;
        }

        // Add bid
        auction.bids.push({ bidder: userId, amount: bidAmount });
        auction.currentPrice = bidAmount;

        // Check if buy now price is met
        if (auction.buyNowPrice && bidAmount >= auction.buyNowPrice) {
          auction.winner = userId;
          auction.status = 'completed';
          auction.endTime = new Date();
        }

        await auction.save();

        // Emit to all clients in the auction room
        io.to(auctionId).emit('new-bid', {
          bidder: {
            id: user._id,
            name: user.name
          },
          amount: bidAmount,
          time: new Date(),
          currentPrice: auction.currentPrice,
          auctionStatus: auction.status
        });

        // If auction completed due to buy now
        if (auction.status === 'completed') {
          io.to(auctionId).emit('auction-completed', {
            winner: {
              id: user._id,
              name: user.name
            },
            finalPrice: bidAmount
          });
        }

      } catch (error) {
        socket.emit('bid-error', { message: error.message });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.decoded.id}`);
    });
  });
}; 