// Album Grid Component - Handles the dynamic album display and filtering
class AlbumGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.albums = [];
        this.filteredAlbums = [];
        this.currentFilter = 'all';
        this.isLoaded = false;
    }

    async loadAlbums() {
        if (this.isLoaded) return; // Don't reload if already loaded
        
        try {
            const response = await fetch('./content/albums.json');
            this.albums = await response.json();
            this.filteredAlbums = [...this.albums];
            this.render();
            this.isLoaded = true;
        } catch (error) {
            console.error('Error loading albums:', error);
        }
    }

    categorizeAlbum(album) {
        const role = album.role;
        const year = album.year;
        const type = album.type || [];
        
        // Use explicit type field from JSON
        const format = type.find(t => ['album', 'ep', 'single'].includes(t)) || 'album';
        
        // Determine if featured from type field or role
        const featured = type.includes('featured');
        
        // Determine if recent (2024+)
        const recent = year >= 2024;
        
        return { format, featured, recent };
    }

    filterAlbums(filterType) {
        this.currentFilter = filterType;
        
        switch (filterType) {
            case 'all':
                this.filteredAlbums = [...this.albums];
                break;
            case 'albums':
                this.filteredAlbums = this.albums.filter(album => 
                    this.categorizeAlbum(album).format === 'album'
                );
                break;
            case 'eps':
                this.filteredAlbums = this.albums.filter(album => 
                    this.categorizeAlbum(album).format === 'ep'
                );
                break;
            case 'singles':
                this.filteredAlbums = this.albums.filter(album => 
                    this.categorizeAlbum(album).format === 'single'
                );
                break;
            case 'featured':
                this.filteredAlbums = this.albums.filter(album => 
                    this.categorizeAlbum(album).featured
                );
                break;
            case 'recent':
                this.filteredAlbums = this.albums.filter(album => 
                    this.categorizeAlbum(album).recent
                );
                break;
            default:
                this.filteredAlbums = [...this.albums];
        }
        
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        this.filteredAlbums.forEach(album => {
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
            this.container.appendChild(albumItem);
        });
    }
}

// Audio Page Component - Manages the audio page functionality
class AudioPage {
    constructor() {
        this.albumGrid = new AlbumGrid('album-grid');
        this.currentPage = null;
    }

    async show() {
        await this.albumGrid.loadAlbums();
    }

    filterAlbums(filterType, buttonElement) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        buttonElement.classList.add('active');

        this.albumGrid.filterAlbums(filterType);
    }
}

// Music Page Component - Simple page for music content
class MusicPage {
    show() {
        // Music page is static for now - just showing it is enough
    }
}

// Software Page Component - Simple page for software content
class SoftwarePage {
    show() {
        // Software page is static for now - just showing it is enough
    }
}

// Page Manager - Handles navigation between pages
class PageManager {
    constructor() {
        this.pages = {
            audio: new AudioPage(),
            music: new MusicPage(),
            software: new SoftwarePage()
        };
        this.currentPage = 'home';
        this.currentPageColors = {
            audio: '#ff5733',
            music: '#33f039',
            software: '#5733ff'
        };
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('hidden');
            page.style.display = 'none';
        });

        if (pageName === 'home') {
            // Show homepage
            const homepage = document.getElementById('homepage');
            homepage.classList.remove('hidden');
            homepage.style.display = 'block';
            document.body.style.backgroundColor = '#121212';
            
            // Restore proper overflow behavior based on screen size
            if (window.innerWidth <= 700) {
                document.body.style.overflow = 'auto'; // Enable scrolling on mobile
            } else {
                document.body.style.overflow = 'hidden'; // Keep hidden on desktop
            }
        } else {
            // Show specific page using expandedContent style
            const pageElement = document.getElementById(`${pageName}-page`);
            if (pageElement) {
                pageElement.classList.remove('hidden');
                pageElement.style.display = 'flex';
                
                // Set background color based on page
                const color = this.currentPageColors[pageName];
                if (color) {
                    pageElement.style.backgroundColor = color;
                    
                    // Set back button color to match page color with transparency
                    const backButton = pageElement.querySelector('#backButton');
                    if (backButton) {
                        const rgb = this.hexToRgb(color);
                        const rgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
                        backButton.style.backgroundColor = rgbaColor;
                    }
                }
                
                document.body.style.overflow = 'hidden';
                
                // Initialize page component
                if (this.pages[pageName]) {
                    this.pages[pageName].show();
                }
            }
        }
        
        this.currentPage = pageName;
    }

    // Helper function to convert hex to rgb
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instances
    window.pageManager = new PageManager();
    window.audioPage = pageManager.pages.audio;
    
    // Add CSS for the new architecture that matches the original expandedContent styling
    const style = document.createElement('style');
    style.textContent = `
        .page-content {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            justify-content: center;
            align-items: center;
            background-color: rgba(0, 0, 0, 0.9);
        }
        
        .page-content.hidden {
            display: none !important;
        }
        
        #homepage {
            position: static;
            height: calc(100vh - 10vh - 4rem); /* Account for title bar height and intro text space */
            display: block;
            background-color: transparent;
        }
        
        #homepage .category-wrapper {
            height: 100%;
            display: flex;
            justify-content: space-around;
            align-items: center;
            user-select: none;
        }
        
        /* Mobile responsive behavior */
        @media (max-width: 700px) {
            #homepage {
                height: auto; /* Remove fixed height on mobile */
                min-height: calc(100vh - 10vh - 4rem); /* Minimum height but allow scrolling */
            }
            
            #homepage .category-wrapper {
                height: auto; /* Remove fixed height on mobile */
                flex-direction: column;
                padding: 2rem 0; /* Add some padding for spacing */
            }
        }
        
        /* Use the original backButton styling from index.css */
        .page-content #backButton {
            position: absolute;
            text-align: center;
            top: calc(2.5rem);
            left: 20px;
            width: 36px;
            font-size: 36px;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 5px;
            cursor: pointer;
            color: #fff;
            user-select: none;
        }
        
        /* Wrap content pages in a content div to match original styling */
        .audio-content,
        .music-content, 
        .software-content {
            display: flex;
            margin-left: 1.5rem;
            margin-right: 1.5rem;
            margin-top: 1rem;
            margin-bottom: 1rem;
            flex-direction: column;
            height: calc(100% - 2rem);
            text-align: center;
            overflow-y: auto;
            width: calc(100% - 3rem);
        }
        
        .content-header {
            margin-left: 3rem;
        }
    `;
    document.head.appendChild(style);
});