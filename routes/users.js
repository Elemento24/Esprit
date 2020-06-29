var express = require('express'),
	router = express.Router(),
	User = require('../models/user'),
	Comment = require('../models/comment'),
	Blog = require("../models/blog"),
	Notification = require("../models/notification"),
	{checkProfileOwnership,isLoggedIn,asyncErrorHandler} = require('../middleware'),
	{	getUsers,
		getProfile,
		editProfile,
		updateProfile,
		getFollow,
		getNotifications,
		handleNotification,
		showUserBlogs } = require('../controllers/users.js');

// User Index Route
router.get('/users', asyncErrorHandler(getUsers));


// User Profile Route
router.get('/users/:id', asyncErrorHandler(getProfile));


// Edit User Profile
router.get('/users/:id/edit', checkProfileOwnership, asyncErrorHandler(editProfile));


// Update User Profile
router.put('/users/:id', checkProfileOwnership, asyncErrorHandler(updateProfile));


// Follows a User
router.get('/follow/:id', isLoggedIn, asyncErrorHandler(getFollow));


// Views All Notifications
router.get('/notifications', isLoggedIn, asyncErrorHandler(getNotifications));


// Handle the Notifications
router.get('/notifications/:id',isLoggedIn, asyncErrorHandler(handleNotification));


// Show all the Blogs of a User
router.get('/users/:id/blogs', asyncErrorHandler(showUserBlogs));


module.exports = router;
