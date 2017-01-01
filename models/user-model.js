var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    findOrCreate = require('mongoose-findorcreate');

var UserSchema = new Schema({
    twitterId: {
        type: String,
        required: true,
        index: { unique: true }
    },
    username: {
        type: String,
        required: true
    }},
    {
        collection: 'users'
    }
);

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', UserSchema);
