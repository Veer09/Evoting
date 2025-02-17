const mongoose = require('mongoose');

const Voter = new mongoose.Schema({
  voterId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  phoneNumber:{
    type: String,
    required: true,
    unique: true
  },
  area:{
    type: String,
    required: true
  },
  city:{
    type: String,
    required: true
  },
  state:{
    type: String,
    required: true
  },
  country:{
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Voter', Voter,'Voter');