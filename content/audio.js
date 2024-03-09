// var carouselImages = document.querySelector('.carousel-images');
// var prevButton = document.getElementById('prev');
// var nextButton = document.getElementById('next');
// var imageWidth = 200; // Adjust as needed
// var currentImage = 0;

document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', event => {
        window.location.href = event.currentTarget.getAttribute('data-link');
    });
});