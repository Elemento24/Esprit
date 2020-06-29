var express = require("express"),
	router = express.Router({
		mergeParams: true
	}),
	multer = require('multer'),
	{ cloudinary, storage } = require("../cloudinary"),
	upload = multer({storage}),
	{ 
		blogsIndex,
		blogNew,
		blogCreate,
		blogShow,
		blogLike,
		blogEdit,
		blogUpdate,
		blogDestroy	}   = require("../controllers/blogs"),
	{ asyncErrorHandler, isLoggedIn, checkBlogOwnership } = require("../middleware");


// Index Route
router.get("/", asyncErrorHandler(blogsIndex));

// New Route
router.get("/new", isLoggedIn , blogNew );


// Create Route
router.post("/", isLoggedIn, upload.array('images', 4), asyncErrorHandler(blogCreate));


// Show Route
router.get("/:id", asyncErrorHandler(blogShow));


// Like Route
router.post("/:id/like", isLoggedIn, asyncErrorHandler(blogLike));


// Edit Route
router.get('/:id/edit', checkBlogOwnership, asyncErrorHandler(blogEdit));


// Update Route
router.put('/:id', checkBlogOwnership, upload.array('images',4), asyncErrorHandler(blogUpdate));


// Destroy Route
router.delete('/:id', checkBlogOwnership , asyncErrorHandler(blogDestroy));


module.exports = router;