var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	middleware = require('../middleware'),
	multer = require('multer'),
	{ cloudinary, storage } = require("../cloudinary"),
	upload = multer({storage}),
	Blog  =  require('../models/blog'),
	User  =  require('../models/user'),
	Comment = require('../models/comment'),
	Notification = require('../models/notification');

// Index Route
router.get("/", function(req, res){
	Blog.paginate({}, {
		page: req.query.page || 1,
		limit: 6,
		sort: "-_id"
	} ,function(err, blogs){
		if(err){
			console.log("there is an error")
		} else {
			blogs.page = Number(blogs.page);
			res.render('blogs/index', {blogs: blogs});
		}
	});	
});


// New Route
router.get("/new", middleware.isLoggedIn ,function(req, res){
	res.render("blogs/new");
});

// Create Route
router.post("/", middleware.isLoggedIn, upload.array('images', 4) ,function(req,res){
	
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	
	req.body.blog.author = author;
	req.body.blog.images = [];
	for(const file of req.files){
		req.body.blog.images.push({
			url: file.secure_url,
			public_id: file.public_id
		});
	}
	
	Blog.create(req.body.blog, function(err, blog){
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		User.findById(req.user._id).populate('followers').exec(async function(err,user){
			if (err){
				console.log(err);
				return res.redirect('back');
			}

			let newNotification = {
				username: req.user.username,
				blogId: blog.id
			}
			
			for (const follower of user.followers){
				var notification = await Notification.create(newNotification);
				follower.notifications.push(notification);
				follower.save();
			}
		});
			
		req.flash('success','Blog successfully added!');
		res.redirect('/blogs/'+ blog.id);
	});
});

// Show Route
router.get("/:id", function(req, res){
	Blog.findById(req.params.id).populate('comments likes').populate('comLikes').exec(function(err, blog){
		if(err){
			console.log(err);
		} else {
			res.render('blogs/show', {blog: blog});
		}
	});
});

// Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            console.log(err);
            return res.redirect("/blogs");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundBlog.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundBlog.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundBlog.likes.push(req.user);
        }

        foundBlog.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/blogs");
            }
            return res.redirect("/blogs/" + foundBlog._id);
        });
    });
});

// Edit Route
router.get('/:id/edit',middleware.checkBlogOwnership ,function(req, res){
	Blog.findById(req.params.id, function(err,foundBlog){
		if(err){
			console.log(err);
		} else {
			res.render('blogs/edit', {blog: foundBlog});
		}
		
	});
});

// Update Route
router.put('/:id', middleware.checkBlogOwnership, upload.array('images',4),function(req,res){
	Blog.findById(req.params.id,async function(err, blog){
		if(err){
			console.log(err.message);
			return res.redirect('/blogs');
		} 
		
		if(req.body.deleteImages && req.body.deleteImages.length) {
			let deleteImages = req.body.deleteImages;
			for(const public_id of deleteImages){
				// delete images from cloudinary
				await cloudinary.v2.uploader.destroy(public_id);
				for(const image of blog.images){
					if(image.public_id === public_id){
						let index = blog.images.indexOf(image);
						blog.images.splice(index, 1);
					}
				}
			}
		}
		
		// if there are new files to upload
		if(req.files) {
			// upload images
			for(const file of req.files) {
				// add images to post.images array
				blog.images.push({
					url: file.secure_url,
					public_id: file.public_id
				});
			}
		}
		
		blog.title = req.body.title;
		blog.content = req.body.content;
		blog.summary = req.body.summary;
		await blog.save();
		req.flash('success', "Blog successfully updated!")
		res.redirect('/blogs/' + req.params.id);
		
	});
});

// Destroy Route
router.delete('/:id', middleware.checkBlogOwnership , function(req, res){
	Blog.findById(req.params.id, async function(err,blog){
		if(err){
			console.log(err);
			return res.redirect('/blogs');
		}
		for(const image of blog.images){
			await cloudinary.v2.uploader.destroy(image.public_id);
		}
		await blog.remove();
		req.flash('success', 'Blog successfully deleted!');
		res.redirect('/blogs');
	});
});


module.exports = router;