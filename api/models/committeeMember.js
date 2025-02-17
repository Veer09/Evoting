const mongoose = require('mongoose');

const CommitteeMember = new mongoose.Schema({
    committeeMemberId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
});

module.exports = mongoose.model('CommitteeMember', CommitteeMember,'CommitteeMember');