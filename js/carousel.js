function changeImage(element) {
    // Change the main image to match the thumbnail
    document.getElementById('main-image').src = element.src;

    // Update the 'active' class on the clicked thumbnail
    var thumbnails = document.getElementsByClassName('thumbnail');
    for (var i = 0; i < thumbnails.length; i++) {
        thumbnails[i].classList.remove('active');
    }
    element.classList.add('active');
}

var slideIndex = 0; // Keeps track of the current slide
var images = document.getElementsByClassName('thumbnail');

function changeSlide(step) {
    // Find the index of the 'active' class
    var currentIndex = [...images].findIndex(img => img.classList.contains('active'));
    var nextIndex = currentIndex + step;

    // Check for bounds and loop around if necessary
    if (nextIndex >= images.length) {
        nextIndex = 0;
    } else if (nextIndex < 0) {
        nextIndex = images.length - 1;
    }

    // Simulate a click on the next thumbnail
    images[nextIndex].click();
}

function changeImage(element) {
    document.getElementById('main-image').src = element.src;
    var thumbnails = document.getElementsByClassName('thumbnail');
    for (var i = 0; i < thumbnails.length; i++) {
        thumbnails[i].classList.remove('active');
    }
    element.classList.add('active');
}

// Initialize the first image as active
if(images.length > 0) {
    changeImage(images[0]);
}
