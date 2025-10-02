document.addEventListener('DOMContentLoaded', function() {
    function isMobileOrTablet() {
        const userAgent = navigator.userAgent;
        const mobileKeywords = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i;
        return mobileKeywords.test(userAgent) || window.innerWidth <= 768;
    }

    if (isMobileOrTablet()) {
        document.body.classList.add('mobile-device');
        
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

    const downloadUrls = {
        dm: 'https://github.com/SRAC-Suite/SRAC/releases/download/v1.0.0/SRAC-DM.exe',
        app: 'https://github.com/SRAC-Suite/SRAC/releases/download/v1.0.0/SRAC.exe'
    };

    const watchDemo = document.getElementById('watchDemo');
    if (watchDemo) {
        watchDemo.addEventListener('click', function() {
            window.open('https://youtu.be/NV3BSmPhQcU', '_blank');
        });
    }

    const downloadButtons = document.querySelectorAll('.btn-download, .btn-terminal-download, #downloadBtn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fileType = this.getAttribute('data-file') || 'dm';
            handleDownload(fileType, this);
        });
    });

    function handleDownload(fileType, buttonElement = null) {
        if (isMobileOrTablet()) {
            showNotification('❌ Downloads blocked on mobile devices. Please use a Windows PC to download SRAC.', 'error');
            return;
        }

        const fileName = fileType === 'dm' ? 'SRAC-DM.exe' : 'SRAC.exe';
        const url = downloadUrls[fileType];
        
        if (buttonElement && buttonElement.classList.contains('btn-terminal-download')) {
            animateTerminalDownload(buttonElement, fileName);
        }
        
        showNotification(`🚀 Downloading ${fileName}...`, 'info');
        
        if (url) {
            window.open(url, '_blank');
            
            setTimeout(() => {
                showNotification(`✅ ${fileName} download initiated! Check your downloads folder.`, 'success');
            }, 2000);
        } else {
            showNotification('❌ Download link not available.', 'error');
        }
    }

    function animateTerminalDownload(button, fileName) {
        const originalButtonText = button.innerHTML;
        
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
        
        setTimeout(() => {
            button.innerHTML = originalButtonText;
            button.style.pointerEvents = 'auto';
            button.style.background = '';
            button.style.opacity = '';
        }, 4000);
    }

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
                        if (outputText) {
                            outputText.style.opacity = '1';
                        }
                        currentLine++;
                        setTimeout(typeTerminalLine, 200);
                    }
                } else {
                    const footer = terminal.querySelector('.download-terminal-footer');
                    if (footer) {
                        footer.style.opacity = '1';
                        footer.style.transform = 'translateY(0)';
                    }
                }
            }
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !terminal.classList.contains('animated')) {
                        terminal.classList.add('animated');
                        
                        terminalLines.forEach(line => {
                            line.style.opacity = '0';
                            const commandText = line.querySelector('.command-text');
                            const outputText = line.querySelector('.output-text');
                            if (commandText) commandText.style.opacity = '0';
                            if (outputText) outputText.style.opacity = '0';
                            line.classList.remove('animated');
                        });
                        
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
    
    function initTerminalInteractions() {
        downloadTerminals.forEach(terminal => {
            const terminalGlass = terminal.querySelector('.terminal-glass');
            const controlButtons = terminal.querySelectorAll('.control-button');
            
            controlButtons.forEach((button, index) => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    if (button.classList.contains('close')) {
                        button.style.pointerEvents = 'none';
                        terminalGlass.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        terminalGlass.style.transform = 'scale(0.01) rotateY(360deg) rotateX(180deg) rotateZ(180deg)';
                        terminalGlass.style.opacity = '0';
                        terminalGlass.style.filter = 'blur(20px) brightness(2) saturate(3)';
                        terminalGlass.style.borderRadius = '50%';
                        
                        createParticleExplosion(terminalGlass);
                        
                        setTimeout(() => {
                            terminalGlass.style.display = 'none';
                        }, 800);
                        
                        setTimeout(() => {
                            terminalGlass.style.display = 'block';
                            terminalGlass.style.transition = 'all 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                            terminalGlass.style.transform = 'scale(1) rotateY(0deg) rotateX(0deg) rotateZ(0deg)';
                            terminalGlass.style.opacity = '1';
                            terminalGlass.style.filter = 'blur(0px) brightness(1) saturate(1)';
                            terminalGlass.style.borderRadius = '20px';
                            button.style.pointerEvents = 'auto';
                            
                            terminalGlass.style.boxShadow = `
                                0 40px 80px rgba(0, 0, 0, 0.5),
                                0 0 120px rgba(131, 56, 236, 0.8),
                                0 0 200px rgba(255, 0, 110, 0.6),
                                inset 0 0 50px rgba(255, 255, 255, 0.15)
                            `;
                            
                            setTimeout(() => {
                                terminalGlass.style.boxShadow = '';
                            }, 2000);
                        }, 7000);
                        
                    } else if (button.classList.contains('minimize')) {
                        button.style.pointerEvents = 'none';
                        terminalGlass.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        terminalGlass.style.transform = 'scale(0.05) translateX(400px) translateY(300px)';
                        terminalGlass.style.opacity = '0';
                        terminalGlass.style.borderRadius = '50%';
                        terminalGlass.style.filter = 'blur(5px)';
                        
                        setTimeout(() => {
                            const siriBall = document.createElement('div');
                            siriBall.style.cssText = `
                                position: fixed;
                                bottom: 30px;
                                right: 30px;
                                width: 100px;
                                height: 100px;
                                background: radial-gradient(circle at 30% 30%, 
                                    rgba(255, 255, 255, 0.9) 0%,
                                    rgba(131, 56, 236, 0.8) 20%,
                                    rgba(58, 134, 255, 0.7) 40%,
                                    rgba(6, 255, 165, 0.6) 60%,
                                    rgba(255, 0, 110, 0.5) 80%,
                                    rgba(255, 190, 11, 0.4) 100%);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                                backdrop-filter: blur(30px) saturate(200%);
                                border: 2px solid rgba(255, 255, 255, 0.4);
                                box-shadow: 
                                    0 25px 50px rgba(131, 56, 236, 0.4),
                                    0 0 80px rgba(58, 134, 255, 0.5),
                                    0 0 120px rgba(6, 255, 165, 0.3),
                                    inset 0 0 40px rgba(255, 255, 255, 0.3);
                                z-index: 9999;
                                animation: siriBallFloat 4s ease-in-out infinite;
                                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                                transform: scale(0);
                                overflow: hidden;
                            `;
                            
                            for (let i = 0; i < 6; i++) {
                                const wave = document.createElement('div');
                                wave.style.cssText = `
                                    position: absolute;
                                    width: ${20 + i * 8}px;
                                    height: ${20 + i * 8}px;
                                    border: 2px solid rgba(255, 255, 255, ${0.6 - i * 0.08});
                                    border-radius: 50%;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%) scale(0);
                                    animation: siriWaveExpand ${2 + i * 0.3}s ease-in-out infinite;
                                    animation-delay: ${i * 0.2}s;
                                `;
                                siriBall.appendChild(wave);
                            }
                            
                            for (let i = 0; i < 12; i++) {
                                const particle = document.createElement('div');
                                const size = Math.random() * 4 + 2;
                                particle.style.cssText = `
                                    position: absolute;
                                    width: ${size}px;
                                    height: ${size}px;
                                    background: radial-gradient(circle, 
                                        rgba(255, 255, 255, 0.9),
                                        rgba(131, 56, 236, 0.6));
                                    border-radius: 50%;
                                    animation: siriParticleFloat ${3 + Math.random() * 2}s ease-in-out infinite;
                                    animation-delay: ${Math.random() * 2}s;
                                    top: ${20 + Math.random() * 60}%;
                                    left: ${20 + Math.random() * 60}%;
                                `;
                                siriBall.appendChild(particle);
                            }
                            
                            const siriCore = document.createElement('div');
                            siriCore.style.cssText = `
                                width: 30px;
                                height: 30px;
                                background: radial-gradient(circle, 
                                    rgba(255, 255, 255, 1) 0%,
                                    rgba(131, 56, 236, 0.9) 50%,
                                    rgba(58, 134, 255, 0.7) 100%);
                                border-radius: 50%;
                                animation: siriCorePulse 2.5s ease-in-out infinite;
                                box-shadow: 
                                    0 0 20px rgba(255, 255, 255, 0.8),
                                    0 0 40px rgba(131, 56, 236, 0.6);
                                position: relative;
                                z-index: 10;
                            `;
                            
                            siriBall.appendChild(siriCore);
                            document.body.appendChild(siriBall);
                            
                            setTimeout(() => {
                                siriBall.style.transform = 'scale(1)';
                            }, 100);
                            
                            terminalGlass.style.display = 'none';
                            
                            siriBall.addEventListener('mouseenter', () => {
                                siriBall.style.transform = 'scale(1.1)';
                                siriBall.style.boxShadow = `
                                    0 25px 50px rgba(131, 56, 236, 0.5),
                                    0 0 100px rgba(58, 134, 255, 0.6),
                                    inset 0 0 40px rgba(255, 255, 255, 0.3)
                                `;
                            });
                            
                            siriBall.addEventListener('mouseleave', () => {
                                siriBall.style.transform = 'scale(1)';
                                siriBall.style.boxShadow = `
                                    0 20px 40px rgba(131, 56, 236, 0.3),
                                    0 0 60px rgba(58, 134, 255, 0.4),
                                    inset 0 0 30px rgba(255, 255, 255, 0.2)
                                `;
                            });
                            
                            siriBall.addEventListener('click', () => {
                                const ripple = document.createElement('div');
                                ripple.style.cssText = `
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    width: 0;
                                    height: 0;
                                    background: radial-gradient(circle, 
                                        rgba(255, 255, 255, 0.6),
                                        transparent 70%);
                                    border-radius: 50%;
                                    transform: translate(-50%, -50%);
                                    animation: siriClickRipple 0.6s ease-out;
                                `;
                                siriBall.appendChild(ripple);
                                
                                siriBall.style.animation = 'siriCollapse 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                                siriBall.style.transform = 'scale(0)';
                                
                                setTimeout(() => {
                                    document.body.removeChild(siriBall);
                                    
                                    terminalGlass.style.display = 'block';
                                    terminalGlass.style.transition = 'all 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                                    terminalGlass.style.transform = 'scale(0.8) translateX(200px) translateY(150px) rotateY(180deg)';
                                    terminalGlass.style.opacity = '0.3';
                                    terminalGlass.style.filter = 'blur(10px)';
                                    
                                    setTimeout(() => {
                                        terminalGlass.style.transform = 'scale(1) translateX(0) translateY(0) rotateY(0deg)';
                                        terminalGlass.style.opacity = '1';
                                        terminalGlass.style.borderRadius = '20px';
                                        terminalGlass.style.filter = 'blur(0px)';
                                        
                                        terminalGlass.style.boxShadow = `
                                            0 40px 80px rgba(0, 0, 0, 0.5),
                                            0 0 120px rgba(6, 255, 165, 0.6),
                                            0 0 200px rgba(58, 134, 255, 0.4),
                                            inset 0 0 50px rgba(255, 255, 255, 0.15)
                                        `;
                                        
                                        setTimeout(() => {
                                            terminalGlass.style.boxShadow = '';
                                            button.style.pointerEvents = 'auto';
                                        }, 1500);
                                    }, 100);
                                }, 800);
                            });
                        }, 1000);
                        
                    } else if (button.classList.contains('maximize')) {
                        if (button.dataset.fullscreen === 'active') return;
                        
                        button.dataset.fullscreen = 'active';
                        
                        const fullscreenOverlay = document.createElement('div');
                        fullscreenOverlay.className = 'fullscreen-overlay';
                        fullscreenOverlay.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            background: linear-gradient(135deg, 
                                rgba(0, 0, 20, 0.95) 0%,
                                rgba(10, 10, 35, 0.98) 50%,
                                rgba(0, 0, 20, 0.95) 100%);
                            backdrop-filter: blur(40px) saturate(200%);
                            z-index: 10000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            opacity: 0;
                            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                        `;
                        
                        const fullscreenTerminal = terminalGlass.cloneNode(true);
                        fullscreenTerminal.style.cssText = `
                            width: 95vw;
                            height: 90vh;
                            max-width: 1400px;
                            max-height: 900px;
                            transform: scale(0.3) rotateY(45deg);
                            transition: all 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                            background: rgba(255, 255, 255, 0.08);
                            backdrop-filter: blur(40px) saturate(200%);
                            border: 1px solid rgba(255, 255, 255, 0.18);
                            border-radius: 20px;
                            box-shadow: 
                                0 60px 120px rgba(0, 0, 0, 0.6),
                                0 0 200px rgba(131, 56, 236, 0.4),
                                0 0 400px rgba(58, 134, 255, 0.3),
                                inset 0 0 80px rgba(255, 255, 255, 0.1);
                            position: relative;
                            overflow: hidden;
                        `;
                        
                        const reflection = document.createElement('div');
                        reflection.style.cssText = `
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: linear-gradient(45deg, 
                                transparent 30%, 
                                rgba(255, 255, 255, 0.08) 50%, 
                                transparent 70%);
                            pointer-events: none;
                            animation: gentleReflection 4s ease-in-out infinite;
                        `;
                        fullscreenTerminal.appendChild(reflection);
                        
                        const fullscreenControls = fullscreenTerminal.querySelectorAll('.control-button');
                        fullscreenControls.forEach(ctrl => {
                            if (ctrl.classList.contains('close') || ctrl.classList.contains('minimize')) {
                                ctrl.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    fullscreenTerminal.style.transform = 'scale(0.3) rotateY(-45deg)';
                                    fullscreenOverlay.style.opacity = '0';
                                    
                                    setTimeout(() => {
                                        document.body.removeChild(fullscreenOverlay);
                                        button.dataset.fullscreen = '';
                                    }, 800);
                                });
                            }
                        });
                        
                        const escHandler = (e) => {
                            if (e.key === 'Escape') {
                                fullscreenTerminal.style.transform = 'scale(0.3) rotateY(-45deg)';
                                fullscreenOverlay.style.opacity = '0';
                                
                                setTimeout(() => {
                                    document.body.removeChild(fullscreenOverlay);
                                    button.dataset.fullscreen = '';
                                }, 800);
                                
                                document.removeEventListener('keydown', escHandler);
                            }
                        };
                        document.addEventListener('keydown', escHandler);
                        
                        fullscreenOverlay.appendChild(fullscreenTerminal);
                        document.body.appendChild(fullscreenOverlay);
                        
                        setTimeout(() => {
                            fullscreenOverlay.style.opacity = '1';
                            fullscreenTerminal.style.transform = 'scale(1) rotateY(0deg)';
                        }, 100);
                        
                        setTimeout(() => {
                            fullscreenTerminal.style.animation = 'gentleMaximizedBreathe 4s ease-in-out infinite';
                        }, 1200);
                    }
                });
            });
            terminalGlass.addEventListener('click', function() {
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
    
    initTerminalInteractions();

    function createParticleExplosion(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: linear-gradient(45deg, #8338ec, #3a86ff, #06ffa5);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${centerX}px;
                top: ${centerY}px;
                transform: scale(1);
                opacity: 1;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 100 + Math.random() * 100;
            const deltaX = Math.cos(angle) * velocity;
            const deltaY = Math.sin(angle) * velocity;
            
            particle.animate([
                { 
                    transform: 'scale(1) translate(0, 0)', 
                    opacity: 1 
                },
                { 
                    transform: `scale(0) translate(${deltaX}px, ${deltaY}px)`, 
                    opacity: 0 
                }
            ], {
                duration: 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                document.body.removeChild(particle);
            };
        }
    }

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

    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', () => {
        if (hero) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

});