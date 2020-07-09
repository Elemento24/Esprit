const { cloudinary } = require("../cloudinary");
const Blog = require('../models/blog.js');
const User = require('../models/user.js');
const Notification = require('../models/notification.js');

module.exports = {
    
    // Blogs Index
    async blogsIndex(req,res,next){
        const { dbQuery } = res.locals;
        delete res.locals.dbQuery;
        let blogs = await Blog.paginate(dbQuery,{
    		page: req.query.page || 1,
    		limit: 6,
    		sort: "-_id"
        });
        blogs.page = Number(blogs.page);
//         if (!blogs.docs.length && res.locals.query) {
// 			req.flash("error","No Blog Matched Your Query");
//         }
        res.render('blogs/index', {blogs});
    },
    
    // Blogs New
    blogNew(req,res,next){
        res.render('blogs/new',{
            title: 'Esprit | New Blog'
        });
    },
    
    // Blogs Create
    async blogCreate(req,res,next){
    	var author = {
    		id: req.user._id,
    		username: req.user.username
    	};
    	
    	req.body.blog.author = author;
    	req.body.blog.images = [];
    	for(const file of req.files){
    		req.body.blog.images.push({
    			url: file.secure_url,
    			public_id: file.public_id
    		});
    	}
    	
    	let blog = new Blog(req.body.blog);
    	await blog.save();
    	let user = await User.findById(req.user._id).populate('followers');
    	let newNotification = {
    	    username: req.user.username,
    	    blogId: blog.id,
    	    blogTitle: blog.title
    	};
    	for (const follower of user.followers){
			var notification = await Notification.create(newNotification);
			follower.notifications.push(notification);
			follower.save();
		}
		req.flash('success','Blog successfully added!');
		res.redirect('/blogs/'+ blog.id);
    },

    // Blogs Show
    async blogShow(req, res, next){
        if(req.params.id.length === 24){
            let blog = await Blog.findById(req.params.id).populate('comments likes').populate('comLikes');
            if(blog){
                return res.render('blogs/show', {
        		    blog,
        		    title: `Esprit | ${blog.title}`
        		});
            } 
        }  
        req.flash("error", "No blog matched your query");
        return res.redirect("/blogs");
    },
    
    // Blogs Like
    async blogLike(req,res,next){
        let blog = await Blog.findById(req.params.id);
        
        // Check if req.user._id exists in found blog likes
        var foundUserLike = blog.likes.some(function (like) {
            return like.equals(req.user._id);
        });
        
        if (foundUserLike) {
            // User already liked, removing like
            await blog.likes.pull(req.user._id);
        } else {
            // Adding the new user like
            await blog.likes.push(req.user);
        }
        
        await blog.save();
        res.redirect('/blogs/' + blog._id);
    },
    
    // Blogs Edit
    async blogEdit(req, res, next){
        let blog = await Blog.findById(req.params.id);
        res.render('blogs/edit', {
            blog,
            title: 'Esprit | Edit Blog'
        });
    },

    // Blogs Update
    async blogUpdate(req,res,next){
        let blog = await Blog.findById(req.params.id);
        
        // Check if there are any iamges for Deletion	
		if(req.body.deleteImages && req.body.deleteImages.length) {
			let deleteImages = req.body.deleteImages;
			for(const public_id of deleteImages){
				// Delete images from cloudinary
				await cloudinary.v2.uploader.destroy(public_id);
				for(const image of blog.images){
					if(image.public_id === public_id){
						let index = blog.images.indexOf(image);
						blog.images.splice(index, 1);
					}
				}
			}
		}
		
		// Check if there are any new Images for Upload
		if(req.files) {
			// Upload Images
			for(const file of req.files) {
				// Add images to post.images array
				blog.images.push({
					url: file.secure_url,
					public_id: file.public_id
				});
			}
		}
		
		blog.title = req.body.title;
		blog.content = req.body.content;
		blog.summary = req.body.summary;
		await blog.save();
		req.flash('success', "Blog successfully updated!");
		res.redirect('/blogs/' + req.params.id);
    },

    // Blogs Destroy
    async blogDestroy(req, res, next){
        let blog = await Blog.findById(req.params.id);
    	for(const image of blog.images){
    		await cloudinary.v2.uploader.destroy(image.public_id);
    	}
    	await blog.remove();
    	req.flash('success', 'Blog successfully deleted!');
        res.redirect('/blogs');
    }

}


