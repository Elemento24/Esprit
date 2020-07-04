const Blog = require('../models/blog');
const Comment = require('../models/comment');
const User = require("../models/user");
const { cloudinary } = require('../cloudinary');
// const { query } = require('express');

function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const middleware = {
	
	// Async Error Handler Middleware
	asyncErrorHandler: (fn) =>
		(req, res, next) => {
		    Promise.resolve(fn(req, res, next)).catch(next);
		},
	
	// To delete the profile image
	deleteProfileImage: async req => {
	    if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
	},
	
	// To check whether the user is Logged in or not
	isLoggedIn: (req,res,next) => {
		if(req.isAuthenticated()) return next();
		req.flash('error',"You need to be Logged in!");
		res.redirect("/login");
	},
	
	// Checking if the user owns the profile
	isProfileOwner: (req,res,next) => {
		if(req.isAuthenticated()){
			if(req.params.id === req.user.id || req.user.isAdmin) return next();
			return res.redirect('back');
		} 
		res.redirect('back');
	},
	
	// To check if the current user is the owner of the Blog
	isBlogOwner: async (req,res,next) => {
		if(req.isAuthenticated()){
			let blog = await Blog.findById(req.params.id);
		    if(blog.author.id.equals(req.user._id) || req.user.isAdmin) return next();
	    	return res.redirect('back');
		}
		return res.redirect('back');
	},

	// To check if the user is comment owner
	isCommentOwner: async (req,res,next) => {
		if (req.isAuthenticated()){
			let comment = await Comment.findById(req.params.comment_id);
			if (comment.author.id.equals(req.user._id) || req.user.adminCode === process.env.ADMIN_CODE) return next();
			return res.redirect("back");
		} 
		return res.redirect('back');
	},
	
	// Is current password of user is correct when user is trying to update profile
	isValidPassword: async (req, res, next) => {
		const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
		if(user){
			// add user to res.locals
			res.locals.user = user;
			next();
		} else {
			middleware.deleteProfileImage(req);
			req.flash("error", "Incorrect Current Password");
			res.redirect("/users/" + req.user._id + "/edit");
		}
	},
	
	// Is new password and confirmation password matches
	changePassword: async ( req, res, next ) => {
		const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);	
		const {
			newPassword,
			passwordConfirmation
		} = req.body;
		if(newPassword && !passwordConfirmation){
			middleware.deleteProfileImage(req);
			req.flash("error", "Missing Password Confirmation");
			return res.redirect("/users/" + user._id + "/edit");
		}else if(newPassword && passwordConfirmation){
			const { user } = res.locals;
			if(newPassword === passwordConfirmation){
				await user.setPassword(newPassword);
				next();
			} else {
				middleware.deleteProfileImage(req);
				req.flash("error", "Password Mismatched!");
				return res.redirect("/users/" + user._id + "/edit");
			}
		} else {
			next();
		}
	},
	
	// Search & Filter Middleware
	async searchAndFilterBlogs(req, res, next) {
        const queryKeys = Object.keys(req.query);

        if (queryKeys.length) {
            const dbQueries = [];
            let { search } = req.query;

            if (search) {
                search = new RegExp(escapeRegExp(search), 'gi');
                dbQueries.push({
                    $or: [{
                            title: search
                		}]
                });
            }

            res.locals.dbQuery = dbQueries.length ? {
                $and: dbQueries
            } : {};
        }

        res.locals.query = req.query;
        if(queryKeys.indexOf("page") > 0)
        	queryKeys.splice(queryKeys.indexOf('page'), 1);
        const delimiter = queryKeys.length ? '&' : '?';
        res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${delimiter}page=`;
        next();
    }
	
};

module.exports = middleware;