// Download page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Device detection
    function isMobileOrTablet() {
        const userAgent = navigator.userAgent;
        const mobileKeywords = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;
        return mobileKeywords.test(userAgent) || window.innerWidth <= 768;
    }

    // Disable heavy animations on mobile
    if (isMobileOrTablet()) {
        // Add mobile class to body for CSS targeting
        document.body.classList.add('mobile-device');
        
        // Disable complex animations
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device * {
                animation-duration: 0.3s !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.3s !important;
            }
            
            .mobile-device .galaxy-layer,
            .mobile-device .stars-field,
            .mobile-device .cosmic-particles,
            .mobile-device .nebula-glow {
                display: none !important;
            }
            
            .mobile-device .terminal-glass::before,
            .mobile-device .terminal-glass::after,
            .mobile-device .feature-card::before,
            .mobile-device .feature-card::after {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            showNotification('📱 Optimized for mobile viewing', 'info');
        }, 1000);
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Download URLs
    const downloadUrls = {
        dm: 'https://github.com/SRAC-Suite/SRAC/releases/download/v1.0.0/SRAC-DM.exe',
        app: 'https://github.com/SRAC-Suite/SRAC/releases/download/v1.0.0/SRAC.exe'
    };

    // Watch Demo button
    const watchDemo = document.getElementById('watchDemo');
    if (watchDemo) {
        watchDemo.addEventListener('click', function() {
            window.open('https://youtu.be/NV3BSmPhQcU', '_blank');
        });
    }

    // Download button functionality - Updated for terminal style
    const downloadButtons = document.querySelectorAll('.btn-download, .btn-terminal-download, #downloadBtn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fileType = this.getAttribute('data-file') || 'dm';
            handleDownload(fileType, this);
        });
    });

    // Handle download process with terminal animation
    function handleDownload(fileType, buttonElement = null) {
        // Block downloads on mobile/tablet
        if (isMobileOrTablet()) {
            showNotification('❌ Downloads blocked on mobile devices. Please use a Windows PC to download SRAC.', 'error');
            return;
        }

        const fileName = fileType === 'dm' ? 'SRAC-DM.exe' : 'SRAC.exe';
        const url = downloadUrls[fileType];
        
        // Animate terminal download button
        if (buttonElement && buttonElement.classList.contains('btn-terminal-download')) {
            animateTerminalDownload(buttonElement, fileName);
        }
        
        // Show download started notification
        showNotification(`🚀 Downloading ${fileName}...`, 'info');
        
        // Start download
        if (url) {
            window.open(url, '_blank');
            
            // Show completion notification after delay
            setTimeout(() => {
                showNotification(`✅ ${fileName} download initiated! Check your downloads folder.`, 'success');
            }, 2000);
        } else {
            showNotification('❌ Download link not available.', 'error');
        }
    }

    // Terminal download animation
    function animateTerminalDownload(button, fileName) {
        const originalButtonText = button.innerHTML;
        
        // Start animation
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Initiating...</span>';
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.8';
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-download"></i><span>Downloading...</span>';
        }, 500);
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i><span>Downloaded!</span>';
            button.style.background = 'linear-gradient(135deg, #06ffa5 0%, #00c853 100%)';
        }, 2000);
        
        // Reset after delay
        setTimeout(() => {
            button.innerHTML = originalButtonText;
            button.style.pointerEvents = 'auto';
            button.style.background = '';
            button.style.opacity = '';
        }, 4000);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-primary);
                border-radius: 8px;
                padding: 1rem;
                box-shadow: var(--shadow-primary);
                z-index: 9999;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
            }
            
            .notification-success { border-left: 4px solid var(--accent-success); }
            .notification-info { border-left: 4px solid var(--accent-primary); }
            .notification-warning { border-left: 4px solid var(--accent-warning); }
            .notification-error { border-left: 4px solid var(--accent-secondary); }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: var(--text-primary);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0.25rem;
                margin-left: auto;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .notification-close:hover {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle',
            error: 'exclamation-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Enhanced Terminal typing animation for download terminals
    const downloadTerminals = document.querySelectorAll('.download-terminal');
    
    function initDownloadTerminalAnimations() {
        downloadTerminals.forEach((terminal, index) => {
            const terminalLines = terminal.querySelectorAll('.terminal-line');
            let currentLine = 0;
            
            function typeTerminalLine() {
                if (currentLine < terminalLines.length) {
                    const line = terminalLines[currentLine];
                    const commandText = line.querySelector('.command-text');
                    const outputText = line.querySelector('.output-text');
                    
                    line.style.opacity = '1';
                    
                    if (commandText && !line.classList.contains('animated')) {
                        line.classList.add('animated');
                        const text = commandText.textContent;
                        commandText.textContent = '';
                        
                        let charIndex = 0;
                        const typeInterval = setInterval(() => {
                            commandText.textContent += text[charIndex];
                            charIndex++;
                            if (charIndex >= text.length) {
                                clearInterval(typeInterval);
                                currentLine++;
                                setTimeout(typeTerminalLine, 300);
                            }
                        }, 50);
                    } else {
                        // Output line - show immediately
                        if (outputText) {
                            outputText.style.opacity = '1';
                        }
                        currentLine++;
                        setTimeout(typeTerminalLine, 200);
                    }
                } else {
                    // Animation complete - show download button area
                    const footer = terminal.querySelector('.download-terminal-footer');
                    if (footer) {
                        footer.style.opacity = '1';
                        footer.style.transform = 'translateY(0)';
                    }
                }
            }
            
            // Initialize animation when terminal comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !terminal.classList.contains('animated')) {
                        terminal.classList.add('animated');
                        
                        // Reset all lines
                        terminalLines.forEach(line => {
                            line.style.opacity = '0';
                            const commandText = line.querySelector('.command-text');
                            const outputText = line.querySelector('.output-text');
                            if (commandText) commandText.style.opacity = '0';
                            if (outputText) outputText.style.opacity = '0';
                            line.classList.remove('animated');
                        });
                        
                        // Hide footer initially
                        const footer = terminal.querySelector('.download-terminal-footer');
                        if (footer) {
                            footer.style.opacity = '0';
                            footer.style.transform = 'translateY(20px)';
                            footer.style.transition = 'all 0.5s ease';
                        }
                        
                        currentLine = 0;
                        setTimeout(() => typeTerminalLine(), 1000 + (index * 500));
                        observer.unobserve(terminal);
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(terminal);
        });
    }
    
    // Enhanced terminal interactions
    function initTerminalInteractions() {
        downloadTerminals.forEach(terminal => {
            const terminalGlass = terminal.querySelector('.terminal-glass');
            const controlButtons = terminal.querySelectorAll('.control-button');
            
            // Control button interactions
            controlButtons.forEach((button, index) => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    if (button.classList.contains('close')) {
                        // Close animation
                        terminalGlass.style.transform = 'scale(0.8) rotateY(90deg)';
                        terminalGlass.style.opacity = '0.5';
                        
                        setTimeout(() => {
                            terminalGlass.style.transform = '';
                            terminalGlass.style.opacity = '';
                        }, 1000);
                    } else if (button.classList.contains('minimize')) {
                        // Minimize animation
                        terminalGlass.style.transform = 'scale(0.95) translateY(10px)';
                        
                        setTimeout(() => {
                            terminalGlass.style.transform = '';
                        }, 500);
                    } else if (button.classList.contains('maximize')) {
                        // Maximize animation
                        terminalGlass.style.transform = 'scale(1.05) rotateX(0deg) rotateY(0deg)';
                        
                        setTimeout(() => {
                            terminalGlass.style.transform = '';
                        }, 500);
                    }
                });
            });
            
            // Terminal glass click to focus
            terminalGlass.addEventListener('click', function() {
                // Add focus effect
                terminalGlass.style.boxShadow = `
                    0 40px 80px rgba(0, 0, 0, 0.5),
                    0 0 120px rgba(131, 56, 236, 0.8),
                    0 0 200px rgba(255, 0, 110, 0.6),
                    inset 0 0 50px rgba(255, 255, 255, 0.15),
                    0 0 0 2px rgba(131, 56, 236, 0.5)
                `;
                
                setTimeout(() => {
                    terminalGlass.style.boxShadow = '';
                }, 2000);
            });
        });
    }
    
    // Initialize terminal interactions
    initTerminalInteractions();

    // Scroll-based animations for cards
    const animatedElements = document.querySelectorAll('.feature-card, .download-card, .requirement-card');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', () => {
        if (hero) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    console.log('🚀 SRAC Download Page loaded successfully!');
    console.log('📊 Student Result Analysis Compiler v1.0.0');
});