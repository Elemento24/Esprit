var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	text: String,
	createdAt:{
		type:Date,
		default: Date.now
	},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username : String
	},
	comLikes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}]
});

module.exports = mongoose.model('Comment',CommentSchema);