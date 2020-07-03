var mongoose = require("mongoose");
var validator = require("mongoose-unique-validator");
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    username: {
        type:String,
        unique : true,
        required: true
    },
    avatar: {
        secure_url: {
            type: String,
            default: '/images/default-profile.jpeg'
        },
        public_id: String
    },
    about : String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    adminCode: String,
    firstName: {
        type: String,
        required:true
    },
    lastName :{
        type:String,
        required:true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        uniqueCaseInsensitive: true
    },
    facebook:{
        type: String,
    },
    instagram:{
        type: String,
    },
    twitter:{
        type: String,
    },
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});
    
UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(validator);
module.exports = mongoose.model('User',UserSchema);