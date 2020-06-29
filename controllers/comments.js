const   Comment  =  require('../models/comment'),
	    Blog = require('../models/blog');
	   
	   
module.exports = {
    
    // Comment Create
    async commentCreate(req, res, next){
        let blog = await Blog.findById(req.params.id);
        let comment = await Comment.create(req.body.comment);
        
        comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		comment.save();
		blog.comments.push(comment);
		blog.save();
		req.flash('success','Comment successfully added!')
		res.redirect(`/blogs/${blog.id}`);
        
    },
    
    // Comments Update
    async commentUpdate(req,res,next){
        await Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment);
		req.flash('success','Comment successfully updated!');
		res.redirect('/blogs/' + req.params.id);
    },
    
    // Comments Destroy
    async commentDestroy(req, res, next){
        await Comment.findByIdAndRemove(req.params.comment_id);
        res.redirect('/blogs/' + req.params.id);
    },

    // Comments Like
    async commentLike(req,res,next){
        let comment = await Comment.findById(req.params.comment_id);
        
        // Check if req.user._id exists in found comment likes
        var foundUserLike = comment.comLikes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // User already liked, removing like
            await comment.comLikes.pull(req.user._id);
        } else {
            // Adding the new user like
            await comment.comLikes.push(req.user);
        }
        
        await comment.save();
        return res.redirect('/blogs/' + req.params.id);
    }
}