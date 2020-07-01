var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    username: {
        type:String,
        unique : true,
        required: true
    },
    password: String,
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
    isAdmin: {
        type: Boolean,
        default: false
    },
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
        required: true
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

module.exports = mongoose.model('User',UserSchema);