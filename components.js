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
        this.stickyScrollHandler = null;
    }

    async show() {
        await this.albumGrid.loadAlbums();
        this.initStickyFilters();
    }

    initStickyFilters() {
        const filterControls = document.querySelector('.filter-controls');
        const audioContent = document.querySelector('.audio-content');
        
        if (!filterControls || !audioContent) return;
        
        // Store original position
        const originalTop = filterControls.offsetTop;
        
        // Remove existing handler if any
        if (this.stickyScrollHandler) {
            audioContent.removeEventListener('scroll', this.stickyScrollHandler);
        }
        
        this.stickyScrollHandler = () => {
            const scrollTop = audioContent.scrollTop;
            
            // Check if we've scrolled past the original position
            if (scrollTop >= originalTop) {
                filterControls.classList.add('sticky');
            } else {
                filterControls.classList.remove('sticky');
            }
        };
        
        audioContent.addEventListener('scroll', this.stickyScrollHandler);
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
        
        // Setup URL routing
        this.initRouting();
    }
    
    initRouting() {
        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        
        // Handle hash changes (for better hash routing support)
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
    }
    
    handleRoute() {
        const hash = window.location.hash.replace('#', '');
        const validPages = ['Audio', 'Music', 'Software'];
        
        // Convert hash to lowercase for internal routing
        const pageName = hash.toLowerCase();
        
        if (validPages.map(p => p.toLowerCase()).includes(pageName)) {
            this.showPage(pageName);
        } else {
            this.showPage('home');
        }
    }
    
    updateURL(pageName) {
        const currentHash = window.location.hash;
        let newHash;
        
        if (pageName === 'home') {
            newHash = '';
        } else {
            // Capitalize for Wikipedia-style URLs
            const capitalizedPage = pageName.charAt(0).toUpperCase() + pageName.slice(1);
            newHash = `#${capitalizedPage}`;
        }
        
        if (currentHash !== newHash) {
            if (newHash === '') {
                history.pushState(null, '', window.location.pathname);
            } else {
                history.pushState(null, '', newHash);
            }
        }
    }

    async showPage(pageName) {
        // Add loading state
        document.body.style.cursor = 'wait';
        
        // Reset all animations first
        document.querySelectorAll('.page-content, #homepage').forEach(page => {
            page.style.transition = '';
            page.style.opacity = '';
            page.style.transform = '';
        });
        
        // Fade out current content
        const currentPages = document.querySelectorAll('.page-content:not(.hidden)');
        currentPages.forEach(page => {
            page.style.transition = 'all 0.3s ease-out';
            page.style.opacity = '0';
            page.style.transform = 'scale(0.95)';
        });
        
        // Wait for fade out
        await this.delay(200);
        
        // Hide all pages and reset styles
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('hidden');
            page.style.display = 'none';
            page.style.transition = '';
            page.style.opacity = '';
            page.style.transform = '';
        });
        
        // Reset sticky filters when leaving audio page
        const filterControls = document.querySelector('.filter-controls');
        if (filterControls) {
            filterControls.classList.remove('sticky');
        }

        if (pageName === 'home') {
            // Show homepage
            const homepage = document.getElementById('homepage');
            homepage.classList.remove('hidden');
            homepage.style.display = 'block';
            homepage.style.opacity = '0';
            homepage.style.transform = 'scale(1.05)';
            
            document.body.style.backgroundColor = '#121212';
            
            // Restore proper overflow behavior based on screen size
            if (window.innerWidth <= 700) {
                document.body.style.overflow = 'auto';
            } else {
                document.body.style.overflow = 'hidden';
            }
            
            // Animate in homepage
            requestAnimationFrame(() => {
                homepage.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                homepage.style.opacity = '1';
                homepage.style.transform = 'scale(1)';
            });
            
        } else {
            // Show specific page
            const pageElement = document.getElementById(`${pageName}-page`);
            if (pageElement) {
                pageElement.classList.remove('hidden');
                pageElement.style.display = 'flex';
                pageElement.style.opacity = '0';
                pageElement.style.transform = 'translateY(30px)';
                
                // Set background color based on page
                const color = this.currentPageColors[pageName];
                if (color) {
                    pageElement.style.backgroundColor = color;
                    
                    // Set back button color
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
                    await this.pages[pageName].show();
                }
                
                // Animate in page
                requestAnimationFrame(() => {
                    pageElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    pageElement.style.opacity = '1';
                    pageElement.style.transform = 'translateY(0)';
                });
            }
        }
        
        // Reset cursor after transition
        setTimeout(() => {
            document.body.style.cursor = 'default';
        }, 500);
        
        // Update URL
        this.updateURL(pageName);
        
        this.currentPage = pageName;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
    
    // Handle initial route after components are ready
    pageManager.handleRoute();
    
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
        
        /* Navigation arrows */
        .nav-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            background-color: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            color: white;
            cursor: pointer;
            user-select: none;
            transition: all 0.3s ease;
            z-index: 100;
        }
        
        .nav-arrow:hover {
            background-color: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.6);
            transform: translateY(-50%) scale(1.1);
        }
        
        .nav-arrow-left {
            left: 30px;
        }
        
        .nav-arrow-right {
            right: 30px;
        }
        
        /* Mobile responsive arrows */
        @media (max-width: 700px) {
            .nav-arrow {
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
            
            .nav-arrow-left {
                left: 15px;
            }
            
            .nav-arrow-right {
                right: 15px;
            }
            
            /* Reduce padding on mobile */
            .audio-content,
            .music-content, 
            .software-content {
                padding-left: 70px;
                padding-right: 70px;
            }
            
            .audio-content {
                padding-left: 1rem;
                padding-right: 70px;
            }
            
            .software-content {
                padding-left: 70px;
                padding-right: 1rem;
            }
            
            /* Software grid - single column on mobile */
            .software-content .grid {
                grid-template-columns: 1fr;
                max-width: 300px;
                margin: 2rem auto;
                gap: 1.5rem;
            }
            
            .software-content .grid-item {
                max-width: 300px;
                width: 100%;
            }
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
            padding-left: 100px;
            padding-right: 100px;
        }
        
        /* Adjust padding for pages with different arrow configurations */
        .audio-content {
            padding-left: 1.5rem; /* No left arrow */
            padding-right: 100px; /* Right arrow space */
        }
        
        .software-content {
            padding-left: 100px; /* Left arrow space */
            padding-right: 1.5rem; /* No right arrow */
        }
        
        .content-header {
            margin-left: 3rem;
        }
    `;
    document.head.appendChild(style);
});