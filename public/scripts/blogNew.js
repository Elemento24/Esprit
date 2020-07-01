// selecting form
const newBlogForm = document.getElementById("newBlogForm");
newBlogForm.addEventListener('submit', e => {
	// number of images staged for uploading
	let newImages = document.getElementById("image").files.length;
	if(newImages > 4){
		e.preventDefault();
		let error = document.getElementById("error");
        $('#error').css('display','block');
        error.textContent = "You cannot upload more than 4 images!";
    } else {
        $('#error').css('display','none');
    }
});