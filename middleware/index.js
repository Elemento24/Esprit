var Blog = require('../models/blog'),
	Comment = require('../models/comment');

var middlewareObj = {};

// To check if the user is Logged in or not
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash('error',"You need to be Logged in!");
	res.redirect("/login");
};


// Check Blog Ownership
middlewareObj.checkBlogOwnership = function(req, res, next){
	// is user logged in
	if(req.isAuthenticated()){
		Blog.findById(req.params.id , function(err, foundBlog){
			if(err){
				res.redirect('back');
			} else {
			    if(foundBlog.author.id.equals(req.user._id) || req.user.isAdmin){
			    	next();
			    } else {
			    	res.redirect('back');
			    }
			}
		});
	} else {
		res.redirect('back');
	}
}


// Check Comment Ownership
middlewareObj.checkCommentOwnership = function(req,res,next){
	if (req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,foundComment){
			if(err){
				res.redirect('back');
			} else {
				if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				} else {
					res.redirect('back');
				}
			}
		});
	} else {
		res.redirect('back');
	}
}

middlewareObj.checkProfileOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		// console.log(currentUser);
		if(req.params.id === req.user.id || req.user.isAdmin){
			next();
		} else {
			res.redirect('back');
		}
	} else {
		res.redirect('back');
	}
}

module.exports = middlewareObj;