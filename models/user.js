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
        type: String,
        default: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80'
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