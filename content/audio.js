// var carouselImages = document.querySelector('.carousel-images');
// var prevButton = document.getElementById('prev');
// var nextButton = document.getElementById('next');
// var imageWidth = 200; // Adjust as needed
// var currentImage = 0;

document.addEventListener('DOMContentLoaded', () => {
    const albumGrid = document.getElementById('album-grid');
    const sortBySelect = document.getElementById('sort-by');

    if (!sortBySelect) {
        console.error('Element with id "sort-by" not found.');
    }
    else
    {
        console.log('Element with id "sort-by" found.');
    }

    // Fetch albums.json data
    fetch('albums.json')
        .then(response => response.json())
        .then(albums => {
            // Initial render
            renderAlbums(albums);
            // Sort and render albums on sort option change
            sortBySelect.addEventListener('input', (e) => {
                console.log(sortBySelect.value);

                if (Math.random() < 0.5) {
                    albumGrid.style.backgroundColor = 'blue';
                } else {
                    albumGrid.style.backgroundColor = 'red';
                }

                // const sortedAlbums = sortAlbums(albums, 'artist');
                // renderAlbums(sortedAlbums);
            });
        });

    function renderAlbums(albums) {
        albumGrid.innerHTML = ''; // Clear existing items
        albums.forEach(album => {
            const albumItem = document.createElement('a');
            albumItem.target = '_blank';
            albumItem.className = 'grid-item';
            albumItem.href = album.url;
            albumItem.innerHTML = `
                <img src="${album.img}" alt="${album.title}">
                <div class="item-info">
                    <span class="title"><i>${album.title}</i> (${album.year})</span>
                    <span class="artist">${album.artist}</span>
                    <span class="role">${album.role.join(', ')}</span>
                </div>
            `;
            albumGrid.appendChild(albumItem);
        });
    }

    // function sortAlbums(albums, criteria) {
    //     return albums.slice().sort((a, b) => {
    //         if (criteria === 'title') {
    //             return a.title.localeCompare(b.title);
    //         } else if (criteria === 'release-date') {
    //             return new Date(a.year, a.month - 1, a.day) - new Date(b.year, b.month - 1, b.day);
    //         } else if (criteria === 'artist') {
    //             return a.artist.localeCompare(b.artist);
    //         }
    //     });
    // }
});

document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', event => {
        window.location.href = event.currentTarget.getAttribute('data-link');
    });
});