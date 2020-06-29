var express = require('express'),
	router = express.Router(),
	middleware = require('../middleware'),
	User = require('../models/user'),
	Comment = require('../models/comment'),
	Blog = require("../models/blog"),
	Notification = require("../models/notification");

// user index route
router.get('/users', function(req, res) {
	User.find({}, function(err, users){
		if(err){
			console.log(err);
		} else{
			 res.render('users/index',{users});
		}
	});
   
});



// User Profile Route
router.get('/users/:id', function(req, res) {
	User.findById(req.params.id, function(err, user){
		if(err){
			req.flash('error',err.message);
			return res.redirect('back');
		}
		Blog.find().where('author.id').equals(user._id).exec(function(err, blogs){
			if(err){
				req.flash('error', "Something Went Wrong!!");
				return res.redirect('/');
			}
			Comment.find().where('author.id').equals(user._id).exec(function(err, comments){
				if(err){
					console.log(err);
					return res.redirect('back');
				}
				res.render('users/profile', {user: user,blogs: blogs,comments: comments});
			});
		});
	});
});

// Edit User Profile
router.get('/users/:id/edit', middleware.checkProfileOwnership, function(req,res){
	User.findById(req.params.id,function(err,user){
		if(err){
			req.flash('error',err.message);
			return res.redirect('back');
		}
		res.render('users/edit',{user});
	});
});

// Update User Profile
router.put('/users/:id', middleware.checkProfileOwnership, function(req,res){
	const {username, email, avatar, firstName, lastName,
	facebook, twitter, instagram, 
	adminCode, about } = req.body; 
	const user = res.locals.currentUser;
	
	user.username = username;
	user.email = email;
	user.firstName = firstName;
	user.lastName = lastName;
	if(avatar) user.avatar = avatar;
	if(facebook) user.facebook = facebook;
	if(twitter) user.twitter = twitter;
	if(instagram) user.instagram = instagram;
	if(about) user.about = about;
	if(adminCode) user.adminCode = adminCode;
	
	if(user.adminCode === process.env.ADMIN_CODE){
		user.isAdmin = true;
	}
	
	var author = {
		id: user._id,
		username: user.username
	};
	
	
	user.save(function(err, user){
		if(err){
			req.flash('error',err.message);
			return res.redirect('back');
		} 
		Blog.find().where('author.id').equals(user._id).exec(function(err, blogs){
			if(err){
				req.flash('error', "Something Went Wrong!!");
				return res.redirect('/');
			}
			blogs.forEach(function(blog){
				blog.author = author;
				blog.save();
			});
			Comment.find().where('author.id').equals(user._id).exec(function(err, comments){
				if(err){
					console.log(err);
					return res.redirect('back');
				}
				comments.forEach(function(comment){
					comment.author = author;
					comment.save();
				});
				req.login(user,function(err){
					if(err){
						req.flash('error',err.message);
						return res.redirect('back');
					} 
					req.flash('success', "Profile Successfully Changed");
					res.redirect('/blogs');
				});
			});
		});
	});
});

// Follows a User
router.get('/follow/:id',middleware.isLoggedIn,async function(req,res){
	try {
		let user = await User.findById(req.params.id);
		user.followers.push(req.user.id);
		user.save();
		req.flash('success','Successfully followed ' + user.username + '!');
		res.redirect('/users/' + req.params.id);
	} catch(err){
		req.flash('error',err.message);
		res.redirect('back');
	}
});

// Views All Notifications
router.get('/notifications',middleware.isLoggedIn,async function(req,res){
	try {
		let user = await User.findById(req.user._id).populate({
			path: 'notifications',
			options: { sort: {"_id":-1} }
		}).exec();
		let allNotifications =  user.notifications;
		res.render('notifications/index',{
			allNotifications
		});
	} catch(err){
		req.flash('error',err.message);
		res.redirect('back');
	}
});

// Handle the Notifications
router.get('/notifications/:id',middleware.isLoggedIn,async function(req,res){
	try{
		let notification = await Notification.findById(req.params.id);
		notification.isRead = true;
		notification.save();
		res.redirect('/blogs/' + notification.blogId);
	} catch (err){
		req.flash('error',err.message);
		res.redirect('back');
	}	
});

// Show all the Blogs of a User
router.get('/users/:id/blogs', (req, res)=>{
    User.findById(req.params.id, function(err, user){
		if(err){
			req.flash('error',err.message);
			return res.redirect('back');
		}
		Blog.find().where('author.id').equals(user._id).exec(function(err, blogs){
			if(err){
				req.flash('error', "Something Went Wrong!!");
				return res.redirect('/blogs');
			}
				res.render('users/blogs', {user, blogs});
		});
	});
});

module.exports = router;
