var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	Comment  =  require('../models/comment'),
	Blog = require('../models/blog'),
	{asyncErrorHandler, isLoggedIn, isCommentOwner} = require('../middleware'),
	{commentCreate, commentUpdate, commentDestroy, commentLike} = require('../controllers/comments');
	

// Create Comment
router.post('/', isLoggedIn , asyncErrorHandler(commentCreate));


// Update Route
router.put('/:comment_id', asyncErrorHandler(isCommentOwner) , asyncErrorHandler(commentUpdate));


// Destroy Comment
router.delete('/:comment_id', asyncErrorHandler(isCommentOwner), asyncErrorHandler(commentDestroy));


// Comment Like Route
router.post("/:comment_id/like", isLoggedIn, asyncErrorHandler(commentLike)); 


module.exports = router;




