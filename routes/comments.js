var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	middleware = require('../middleware'),
	Comment  =  require('../models/comment'),
	Blog = require('../models/blog');

// Create Comment
router.post('/', middleware.isLoggedIn ,function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			console.log(err);
			res.redirect('/blogs');
		} else {
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					req.flash('error','Something went wrong!')
					console.log(err);
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					foundBlog.comments.push(comment);
					foundBlog.save();
					req.flash('success','Comment successfully added!')
					res.redirect('/blogs/' + foundBlog._id);
				}
			});
		}  
	});
});

// Update Route
router.put('/:comment_id', middleware.checkCommentOwnership ,function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect('back');
		} else {
			req.flash('success','Comment successfully updated!')
			res.redirect('/blogs/' + req.params.id);
		}
	});
});


// Destroy Comment
router.delete('/:comment_id', middleware.checkCommentOwnership ,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			res.redirect('back')
		} else {
			req.flash('success','Comment successfully deleted!')
			res.redirect('/blogs/' + req.params.id)
		}
	});
});

// Comment Like Route
router.post("/:comment_id/like", middleware.isLoggedIn, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            console.log(err);
            return res.redirect("/blogs");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundComment.comLikes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundComment.comLikes.pull(req.user._id);
        } else {
            // adding the new user like
            foundComment.comLikes.push(req.user);
        }

        foundComment.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/blogs");
            }
            return res.redirect("/blogs/" + req.params.id);
        });
    });
});

module.exports = router;




