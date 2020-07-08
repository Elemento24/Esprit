var express = require('express'),
	router = express.Router(),
	multer = require('multer'),
	{storage} = require('../cloudinary'),
	upload = multer({storage}),
	{
		isProfileOwner,
		isLoggedIn,
		asyncErrorHandler,
		isValidPassword,
		changePassword	} = require('../middleware'),
	
	{	getUsers,
		getProfile,
		editProfile,
		updateProfile,
		deleteProfile,
		getFollow,
		unfollowUser,
		getNotifications,
		handleNotification,
		showUserBlogs,
		showFollowers } = require('../controllers/users.js');

// User Index Route
router.get('/users', asyncErrorHandler(getUsers));


// User Profile Route
router.get('/users/:id', asyncErrorHandler(getProfile));


// Edit User Profile
router.get('/users/:id/edit', isProfileOwner, asyncErrorHandler(editProfile));


// Update User Profile
router.put('/users/:id',
	isProfileOwner,
	upload.single('avatar'),
	asyncErrorHandler(isValidPassword),
	asyncErrorHandler(changePassword),
	asyncErrorHandler(updateProfile));
	
	
// Delete User Profile
router.delete('/users/:id',isProfileOwner, asyncErrorHandler(deleteProfile));


// Follows or Unfollows a User from his profile
router.get('/follow/:id', isLoggedIn, asyncErrorHandler(getFollow));


// Unfollows a User from your profile
// router.put('/users/:id/unfollow/:unfollow_id', isProfileOwner, asyncErrorHandler(unfollowUser));


// Views All Notifications
router.get('/notifications', isLoggedIn, asyncErrorHandler(getNotifications));


// Handle the Notifications
router.get('/notifications/:id',isLoggedIn, asyncErrorHandler(handleNotification));


// Show all the Blogs of a User
router.get('/users/:id/blogs', asyncErrorHandler(showUserBlogs));


// Show all the Followers & Following of the User
router.get('/users/:id/followers',asyncErrorHandler(showFollowers));


module.exports = router;
