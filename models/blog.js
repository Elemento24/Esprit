var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

var BlogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	images: [{
		url: String,
		public_id: String
	}],
	content: {
		type: String
	},
	createdAt:{
		type: Date,
		default: Date.now
	},
	summary: String,
	author:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username : String
	},
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Comment'
	}],
	likes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}]
});

BlogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Blog',BlogSchema);