const mongoose = require('mongoose');
const MongooseDummy = require('@videsk/mongoose-dummy');

const dummy = new MongooseDummy(mongoose);
const output = await dummy.model('').generate();