require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var passport = require('passport');
var	LocalStrategy = require('passport-local');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var app = express();

app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));

// Requiring Schemas
var Blog = require('./models/blog'),
	User = require('./models/user'),
	Comment = require('./models/comment');

// Requiring Routes
var indexRoutes = require('./routes/index'),
	blogRoutes = require('./routes/blogs'),
	commentRoutes = require('./routes/comments'),
	userRoutes = require('./routes/users');

// MongoDB Setup
var url = process.env.URL || 'mongodb://localhost:27017/blog_app';
 mongoose.connect(url,{
 	useUnifiedTopology: true,
	useNewUrlParser: true,
 	useFindAndModify: false,
 	useCreateIndex: true
});

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(flash());

// Express-Session Configuration
app.use(
	require("express-session")({
		secret: 'Best Blog App Ever',
		resave: false,
		saveUninitialized: false
	})
);

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.locals.moment = require('moment');

// Using our own Middleware to pass req.user to every template
app.use(async function(req, res, next) {
    res.locals.currentUser = req.user;
    
    if(req.user){
    	try{
    		let user = await User.findById(req.user._id).populate('notifications', null,{
    			isRead: false
    		}).exec();
    		res.locals.notifications = user.notifications.reverse();
    	} catch(err){
    		console.log(err);
    	}
    }
    
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});


// Routing Configurations
app.use('/',indexRoutes);
app.use('/',userRoutes);
app.use('/blogs',blogRoutes);
app.use('/blogs/:id/comments',commentRoutes);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error Handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
