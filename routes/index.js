var express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	middleware = require('../middleware'),
	async = require('async'),
	nodemailer = require('nodemailer'),
	crypto = require('crypto'),
	User = require('../models/user'),
	Comment = require('../models/comment'),
	Blog = require("../models/blog"),
	Notification = require("../models/notification");

// Landing Page Route
router.get('/',function(req,res){
	res.render('landing');
});


// Show the Register Form
router.get('/register',function(req,res){
	res.render('register');
});


// Handling the Register Logic
router.post('/register',function(req,res){
	var newUser = new User({
		username: req.body.username,
		firstName : req.body.firstName,
		lastName : req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar,
		about: req.body.about,
		facebook: req.body.facebook,
		instagram: req.body.instagram,
		twitter: req.body.twitter
	});
	if(req.body.adminCode === process.env.ADMIN_CODE){
		newUser.isAdmin = true;
	}
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			req.flash('error', err.message);
			return res.render('register');
		}
		passport.authenticate('local')(req,res,function(){
			req.flash('success', 'Welcome to Medium, ' + user.username + '!')
			res.redirect('blogs');
		});
	});
});


// Show Login Form
router.get('/login',function(req,res){
	res.render('login');
});


// Handling the Login Logic
router.post('/login',function(req,res,next){
	passport.authenticate('local',function(err,user,info){
		if(err){
			req.flash('error',err.message);
			return res.redirect('/login');
		}
		// User is set to false if auth fails
		if(!user){
			req.flash('error',info.message);
			return res.redirect('/login');
		}
		// Establish a Session manually with req.logIn
		req.logIn(user,function(err){
			if(err){
				req.flash('error',err.message);
				return res.redirect('/login');
			}
			req.flash('success','Welcome back ' + user.username + '!');
			res.redirect('/blogs');
		});
	})(req,res,next);
});


// Logout Route
router.get('/logout',function(req,res){
	req.logout();
	req.flash('success' , 'Bye, will see you soon :)');
	res.redirect('/blogs');
});


// Forgot Password Route
router.get('/forgot',function(req,res){
	res.render('forgot');
});


// Handles the Logic for forgot password
router.post('/forgot',function(req,res,next){
	async.waterfall([
		function(done){
			crypto.randomBytes(20,function(err,buf){
				var token = buf.toString('hex');
				done(err,token);
			});
		},
		function(token,done){
			User.findOne({
				email: req.body.email
			}, function(err,user){
				if(!user){
					req.flash('error','No Account with the given Email Address exists!');
					return res.redirect('/forgot');
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000;
				
				user.save(function(err){
					done(err,token,user);
				});
			});
		},
		function(token,user,done){
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'mittalvishesh266@gmail.com',
					pass: process.env.GMAIL_PW
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'mittalvishesh266@gmail.com',
				subject: 'Medium Password Reset!',
				text: 'You are receiving this because you (or someone else) have requested to reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions,function(err){
				if(err){
					console.log(err);
				} else {
					req.flash('success',"An E-Mail has been sent to " + user.email + " for further instructions");
					done(err,'done');
				}
			});
		}
	], function(err){
		if (err) return next(err);
		res.redirect('/forgot');
	});	
});


// Route for Token
router.get('/reset/:token',function(req,res){
	User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	},function(err,user){
		if(!user){
			req.flash('error','Password Reset Token is invalid or has expired!');
			return res.redirect('/forgot');
		}
		res.render('reset',{
			token: req.params.token
		});
	});
});


// Handles the Logic for Reset Password
router.post("/reset/:token", function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({
                    resetPasswordToken: req.params.token,
                    resetPasswordExpires: {
                        $gt: Date.now()
                    }
                },
                function(err, user) {
                    if (!user) {
                        req.flash("error", "Password reset token is invalid or has expired!");
                        return res.redirect("back");
                    }
                    if (req.body.password === req.body.confirm) {
                        user.setPassword(req.body.password, function(err) {
                            user.resetPasswordToken = undefined;
                            user.resetPasswordExpires = undefined;

                            user.save(function(err) {
                                req.logIn(user, function(err) {
                                    done(err, user);
                                });
                            });

                        });
                    } else {
                        req.flash("error", "Passwords do not match!");
                        return res.redirect("back");
                    }
                });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "mittalvishesh266@gmail.com",
                    pass: process.env.GMAIL_PW
                }
            });
            var mailOptions = {
                to: user.email,
                from: "mittalvishesh266@gmail.com",
                subject: "Your password has been changed",
                text: "Hello,\n\n" +
                    "This is a confirmation that the password for your account " + user.email + " has just been changed.\n"
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash("success", "Success! Your password has been changed.");
                done(err);
            });
        }
    ], function(err) {
        res.redirect("/blogs");
    });
});


module.exports = router;