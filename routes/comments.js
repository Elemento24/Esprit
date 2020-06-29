var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	Comment  =  require('../models/comment'),
	Blog = require('../models/blog'),
	{asyncErrorHandler, isLoggedIn, checkCommentOwnership} = require('../middleware'),
	{commentCreate, commentUpdate, commentDestroy, commentLike} = require('../controllers/comments');

// Create Comment
router.post('/', isLoggedIn , asyncErrorHandler(commentCreate));


// Update Route
router.put('/:comment_id', checkCommentOwnership , asyncErrorHandler(commentUpdate));


// Destroy Comment
router.delete('/:comment_id', checkCommentOwnership , asyncErrorHandler(commentDestroy));

// Comment Like Route
router.post("/:comment_id/like", isLoggedIn, asyncErrorHandler(commentLike)); 


module.exports = router;




