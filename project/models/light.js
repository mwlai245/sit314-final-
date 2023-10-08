const mongoose = require('mongoose');

module.exports = mongoose.model('lights', new mongoose.Schema({
    light_id: Number,
    room: Number,
    light_intensity: Number,
    timestamp: Date
}));
