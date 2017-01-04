var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// define location Schema
var LocationSchema = new Schema({
    id: {
        type: String,
        required: true,
        index: {unique: true}
    },
    going: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    url: {
        type: String,
        required: true
    }},
    {
        collection: 'locations'
    }
);

module.exports = mongoose.model('Location', LocationSchema);
