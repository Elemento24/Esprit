const User = require("../models/user");
const passport = require('passport');
const util = require('util');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
	
	// Landing Page Route
	landingPage(req,res,next){
		res.render('landing');
	},
	
	// Show the Register Form
	getRegister(req,res,next){
		res.render('register');
	},

    // Handling the Register Logic
    async postRegister(req, res, next){
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
		
	    let user = await User.register(newUser, req.body.password);
	    passport.authenticate('local')(req,res,function(){
			req.flash('success', 'Welcome to Medium, ' + user.username + '!')
			res.redirect('/blogs');
		});
	},

	// Show Login Form
	getLogin(req,res,next){
		res.render('login');
	},
	
	// handling login logic
	async postLogin(req,res,next){
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
	},

    // Logout Route
    async getLogout(req, res, next){
        await req.logout();
        req.flash('success' , 'Bye, will see you soon :)');
	    res.redirect('/blogs');
    },
    
    // Forgot Password Route
    getForgot(req, res, next){
        res.render('forgot');
    },
    
    // Handles the logic for forgot password
    async putForgot(req, res, next) {
        const token = await crypto.randomBytes(20).toString('hex');
        const {
            email
        } = req.body;
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.redirect('/forgot-password');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const msg = {
            to: email,
            from: 'mittalvishesh021@gmail.com',
            subject: 'Medium - Forgot Password / Reset',
            text: `You are receiving this because you (or someone else)
		    have requested the reset of the password for your account.
			Please click on the following link, or copy and paste it
			into your browser to complete the process:
			http://${req.headers.host}/reset/${token}
			If you did not request this, please ignore this email and
			your password will remain unchanged.`.replace(/			/g, ''),
        };
        await sgMail.send(msg);

        req.flash('success',`An Email has been sent to ${email} with further instructions!`);
        res.redirect('/forgot');
    },
    
    // Route for Token
    async getReset(req, res, next) {
        const {
            token
        } = req.params;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        });
        if (!user) {
            req.flash('error', 'Password Reset Token is invalid or has expired!');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            token
        });
    },
    
    // Handles the Logic for Reset Password
    async putReset(req, res, next) {
        const {
            token
        } = req.params;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        });
        if (!user) {
            req.flash('error', 'Password Reset Token is invalid or has expired!');
            return res.redirect('/forgot');
        }
        if (req.body.password === req.body.confirm) {
            await user.setPassword(req.body.password);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            const login = util.promisify(req.login.bind(req));
            await login(user);
        } else {
            req.flash('error','Passwords do not match!');
            return res.redirect(`/reset/${token}`);
        }

        const msg = {
            to: user.email,
            from: 'mittalvishesh021@gmail.com',
            subject: 'Medium - Password Changed',
            text: `Hello,
	  	This email is to confirm that the password for your account has just been changed.
	  	If you did not make this change, please hit reply and notify us at once.`.replace(/	  	/g, '')
        };

        await sgMail.send(msg);

        req.flash('success', "Password Updated Successfully");
        res.redirect('/blogs');
    }
}
