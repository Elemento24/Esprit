var express = require('express'),
	router = express.Router(),
	multer = require('multer'),
	{storage} = require('../cloudinary'),
	upload = multer({storage}),
	{asyncErrorHandler} = require('../middleware'),
	{landingPage, 
	getRegister,
	postRegister,
	getLogin,
	postLogin,
	getLogout,
	getForgot,
	putForgot,
	getReset,
	putReset } = require('../controllers');

// Landing Page Route
router.get('/', landingPage);


// Show the Register Form
router.get('/register', getRegister);


// Handling the Register Logic
router.post('/register', upload.single('avatar') ,asyncErrorHandler(postRegister));


// Show Login Form
router.get('/login', getLogin);


// Handling the Login Logic
router.post('/login', asyncErrorHandler(postLogin));


// Logout Route
router.get('/logout', asyncErrorHandler(getLogout));


// Forgot Password Route
router.get('/forgot', getForgot);


// Handles the Logic for forgot password
router.put('/forgot',asyncErrorHandler(putForgot));


// Route for Token
router.get('/reset/:token', asyncErrorHandler(getReset));


// Handles the Logic for Reset Password
router.put("/reset/:token",  asyncErrorHandler(putReset));


module.exports = router;