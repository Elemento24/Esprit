const	User = require('../models/user'),
	    Comment = require('../models/comment'),
    	Blog = require("../models/blog"),
	    Notification = require("../models/notification");
	    
const util = require('util');
	    
	    
module.exports = {
    
    // User Index Route
    async getUsers(req, res, next){
        let users = await User.find({});
        res.render('users/index',{users});
    },
    
    // User Profile Route
    async getProfile(req, res, next){
       let user = await User.findById(req.params.id);
       let blogs = await Blog.find().where('author.id').equals(user._id);
       let comments = await Comment.find().where('author.id').equals(user._id);
       res.render('users/profile', {user, blogs, comments});
    },
    
    // Edit User Profile
    async editProfile(req, res, next){
        let user = await User.findById(req.params.id);
        res.render('users/edit',{user});
    },
    
    // Update User Profile
    async updateProfile(req,res,next){
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
    	const updatedUser = await user.save();
    	
    	let blogs = await Blog.find().where('author.id').equals(updatedUser._id);
    	for(const blog of blogs){
    	    blog.author = author;
    	    await blog.save();
    	}
    	
    	let comments = await Comment.find().where('author.id').equals(updatedUser._id);
    	for(const comment of comments){
    	    comment.author = author;
    	    await comment.save();
    	}
    	
        const login = util.promisify(req.login.bind(req));
        await login(user);
        req.session.success = 'Profile Updated Successfully!';
        res.redirect('/users/' + user._id);
    },

    // Follows a User
    async getFollow(req, res, next){
        let user = await User.findById(req.params.id);
		user.followers.push(req.user.id);
		user.save();
		req.flash('success','Successfully followed ' + user.username + '!');
		res.redirect('/users/' + req.params.id);
    },
    
    
    // Views All Notifications
    async getNotifications(req, res, next){
        let user = await User.findById(req.user._id).populate({
			path: 'notifications',
			options: { sort: {"_id":-1} }
		}).exec();
		let allNotifications =  user.notifications;
		res.render('notifications/index',{ allNotifications});
    },
    
    
    // Handle the Notifications
    async handleNotification(req, res, next){
        let notification = await Notification.findById(req.params.id);
		notification.isRead = true;
		notification.save();
		res.redirect('/blogs/' + notification.blogId);
    },
    
    
    // Show all the Blogs of a User
    async showUserBlogs(req, res, next){
        let user = await User.findById(req.params.id);
        let blogs = await Blog.find().where('author.id').equals(user._id).exec();
        res.render('users/blogs', {user, blogs});
    }
}