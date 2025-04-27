document.addEventListener('DOMContentLoaded', function() {
    // Fix image URL if needed
    const robotImage = document.getElementById('robotImage');
    if (robotImage) {
        // The Google Images URL might not work directly
        // This is a fallback in case the provided URL doesn't load properly
        robotImage.onerror = function() {
            // Replace with a placeholder image if original fails to load
            this.src = 'https://via.placeholder.com/800x1200/333333/ffffff?text=Robot';
        };
    }
    
    // Mobile menu functionality
    const menuToggle = document.getElementById('menuToggle');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            // Create mobile menu if it doesn't exist
            if (!document.querySelector('.mobile-menu')) {
                createMobileMenu();
            }
            
            // Toggle mobile menu
            const mobileMenu = document.querySelector('.mobile-menu');
            const menuOverlay = document.querySelector('.menu-overlay');
            
            mobileMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        });
    }
    
    // Create mobile menu elements
    function createMobileMenu() {
        // Create overlay
        const menuOverlay = document.createElement('div');
        menuOverlay.className = 'menu-overlay';
        document.body.appendChild(menuOverlay);
        
        // Create mobile menu
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-menu';
        closeButton.innerHTML = '&times;';
        mobileMenu.appendChild(closeButton);
        
        // Add menu links
        const links = [
            { name: 'ARRANGEMENTS', url: 'placement.html' },
            { name: 'RETRIEVAL', url: 'retrieval.html' },
            { name: 'OPTIMISATION', url: 'rearrange.html' },
            { name: 'WASTE MANAGEMENT', url: 'waste.html' },
            { name: 'CARGO RETURN', url: 'return.html' },
            { name: 'ANALYSIS', url: 'log.html' },
            { name: 'SHOP', url: '#' }
        ];
        
        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            mobileMenu.appendChild(a);
        });
        
        document.body.appendChild(mobileMenu);
        
        // Add event listeners for closing
        closeButton.addEventListener('click', closeMobileMenu);
        menuOverlay.addEventListener('click', closeMobileMenu);
        
        function closeMobileMenu() {
            mobileMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
        }
    }
    
    // Parallax effect for robot image
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        if (robotImage) {
            robotImage.style.transform = `translateY(${scrollPosition * 0.2}px)`;
        }
    });
    
    // Animate text on page load
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        heroText.style.opacity = '0';
        heroText.style.transform = 'translateY(20px)';
        heroText.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(() => {
            heroText.style.opacity = '1';
            heroText.style.transform = 'translateY(0)';
        }, 500);
    }
});