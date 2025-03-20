const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

electionSchema.pre('save', function(next) {
  if (this.startDate <= Date.now()) {
    this.status = 'active';
  }
  next();
}); 
const Election = mongoose.model('Election', electionSchema, 'Election');

module.exports = Election;