const mongoose = require('mongoose');

const Candidate = new mongoose.Schema({
    name:{
        type: String,
        required: true
    }, 
    party:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: String,
        required: true
    },
    area:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    state : {
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    electionId:{
        ref: 'Election',
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('Candidate', Candidate,'Candidate');