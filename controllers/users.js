const	User = require('../models/user'),
	    Comment = require('../models/comment'),
    	Blog = require("../models/blog"),
    	{ cloudinary } = require("../cloudinary"),
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
        if(req.params.id.length === 24){
            let user = await User.findById(req.params.id);
            if(user){
                let blogs = await Blog.find().where('author.id').equals(user._id);
                let comments = await Comment.find().where('author.id').equals(user._id);
                return res.render('users/profile', {
                   user, blogs, comments, 
                   title:`Esprit | ${user.username}`
                });
            } 
        }
        req.flash("error", "No user matched your query");
        return res.redirect("/blogs");
    },
    
    // Edit User Profile
    async editProfile(req, res, next){
        if(req.params.id.length === 24){
            let user = await User.findById(req.params.id);
            if(user){
                return res.render('users/edit',{
                    user,
                    title: 'Esprit | Edit Profile'
                });
            }
        } 
        req.flash("error", "No user matched your query");
        return res.redirect("/blogs");
    },
    
    // Update User Profile
    async updateProfile(req,res,next){
        const {username, email, avatar, firstName, lastName,
    	facebook, twitter, instagram, 
    	adminCode, about } = req.body; 
    	const {user} = res.locals;
	    
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
    	
    	if(req.file){
			if(user.avatar.public_id) await cloudinary.v2.uploader.destroy(user.avatar.public_id);
			const { secure_url, public_id } = req.file;
			user.avatar = { secure_url, public_id };
		}
    	
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
    
    // Delete User Profile
    async deleteProfile(req,res,next){
        let user = await User.findById(req.params.id);
        if(user.avatar.secure_url !== '/images/default-profile.jpeg'){
		    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }
        
    	let blogs = await Blog.find().where('author.id').equals(req.params.id);
    	for(const blog of blogs){
            for(const image of blog.images){
    		    await cloudinary.v2.uploader.destroy(image.public_id);
        	}
        	await blog.remove();
    	}
    	
    	let comments = await Comment.find().where('author.id').equals(req.params.id);
    	for(const comment of comments){
    	    await comment.remove();
    	}
    	
    	await user.remove();
    	req.flash('success', 'Hope to see you soon!');
        res.redirect('/blogs');
    },
    	
    // Follows or Unfollows a User from his profile
    async getFollow(req, res, next){
        let user = await User.findById(req.params.id);
        let loggedUser  = res.locals.currentUser;
        
        var followedUser = user.followers.some(function(user){
            return user.equals(req.user._id);
        });
        
        if(followedUser){
            await user.followers.pull(req.user._id);
            await loggedUser.following.pull(user._id);
    		req.flash('success','Successfully unfollowed ' + user.username + '!');
        } else {
            await user.followers.push(req.user.id);
            await loggedUser.following.push(user._id);
    		req.flash('success','Successfully followed ' + user.username + '!');
        }
        
		await user.save();
		await loggedUser.save();
		res.redirect('/users/' + req.params.id);
    },
    
    // Unfollows a User from your profile
//     async unfollowUser(req,res,next){
//         let user = await User.findById(req.params.id);
//         let unfollowedUser  = await User.findById(req.params.unfollow_id);
//         await user.following.pull(req.user._id);
//         await unfollowedUser.followers.pull(req.user._id);
// 		req.flash('success','Successfully unfollowed ' + unfollowedUser.username + '!');
// 		await user.save();
// 		await unfollowedUser.save();
// 		res.redirect('/users/${req.params.id}/followers');
//     },
    
    // Views All Notifications
    async getNotifications(req, res, next){
        let user = await User.findById(req.user._id).populate({
			path: 'notifications',
			options: { sort: {"_id":-1} }
		}).exec();
		let allNotifications =  user.notifications;
		res.render('notifications/index',{ 
		    allNotifications,
		    title: 'Esprit | Notifications'
		});
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
    },
    
    // Show all the Followers & Following of the User
    async showFollowers(req,res,next){
        if(req.params.id.length === 24){
            let user = await User.findById(req.params.id).populate('followers following');
            if(user){
                return res.render('users/follow.ejs', {user, title:`Esprit | ${user.username}'s Followers`});
            }
        }   req.flash("error", "No user matched your query");
            res.redirect("/blogs");
    }
};