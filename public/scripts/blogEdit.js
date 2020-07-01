// Find Post Edit Form
let blogEditForm = document.getElementById('blogEditForm');

// Add submit listener to Post Edit Form
blogEditForm.addEventListener('submit', function(event) {
    // Find length of Uploaded Images
    let imageUploads = document.getElementById('imageUpload').files.length;

    // Find Total number of Existing Images
    let existingImgs = document.querySelectorAll('.imageDeleteCheckbox').length;

    // Find total number of Potential Deletions
    let imgDeletions = document.querySelectorAll('.imageDeleteCheckbox:checked').length;

    // Figure out if the form can be submitted or not
    let newTotal = existingImgs - imgDeletions + imageUploads;
    let error = document.getElementById('error')
    if (newTotal > 4) {
        event.preventDefault();
        let removalAmt = newTotal - 4;
        $('#error').css('display','block');
        error.textContent = `You need to remove at least ${removalAmt} (more) image${removalAmt ===1 ? '':'s'}!`;
    } else if (newTotal === 0){
        event.preventDefault();
        $('#error').css('display','block');
        error.textContent = 'Minimum 1 Image is Required!';
    } else {
        $('#error').css('display','none');
    }
});