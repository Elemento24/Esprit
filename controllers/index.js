const User = require("../models/user");
const passport = require('passport');
const util = require('util');
const { deleteProfileImage } = require('../middleware');
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
		res.render('register',{
		    username: '',
		    firstName: '',
		    lastName: '',
		    email: '',
		    about: '',
		    facebook: '',
		    twitter: '',
		    instagram: '',
		    adminCode: '',
		    title: "Esprit | Sign Up"
		});
	},

    // Handling the Register Logic
    async postRegister(req, res, next){
        try{
            if(req.file){
                const {secure_url, public_id} = req.file;
                req.body.avatar = {secure_url, public_id};
            }
    	    let user = await User.register(new User(req.body), req.body.password);
		    req.login(user, function(err){
		        if(err) return next(err);
    			req.flash('success', 'Welcome to Medium, ' + user.username + '!')
    			res.redirect('/blogs');
		    });
        } catch (err){
            deleteProfileImage(req);
            const {
                username, firstName, lastName, email, about, facebook, twitter, instagram, adminCode
            } = req.body;
            let error = err.message;
            if(error.includes('validation failed') && error.includes('expected `email` to be unique')){
                error = 'A user with the given email is already registered!';
            }
            res.render('register',{
                username, firstName, lastName, email, about, facebook, twitter, instagram, adminCode, error
            });
        }
	},

	// Show Login Form
	getLogin(req,res,next){
	    if(req.isAuthenticated()) return res.redirect('/blogs');
	    if(req.query.returnTo) req.session.redirectTo = req.headers.referer;
		res.render('login',{
		    title: 'Esprit | Login'
		});
	},
	
	// Handling login logic
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
				const redirectUrl = req.session.redirectTo || "/blogs";
    			delete req.session.redirectTo;
    			req.flash('success','Welcome back ' + user.username + '!');
    			res.redirect(redirectUrl);
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
        res.render('forgot', {title: "Esprit | Forgot Password"});
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
            token, 
            title: "Esprit | Reset Password"
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
