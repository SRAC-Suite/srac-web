

document.addEventListener('DOMContentLoaded', function() {
    initializeTermsPage();
});

function initializeTermsPage() {
    setupLiveBackground();
    setupSmoothScrolling();
    setupTableOfContents();
    setupProgressIndicator();
    setupAnimations();
    setupInteractiveElements();
    

    setTimeout(() => {
        checkAndShowWelcomeModal();
    }, 2000); // Show after 2 seconds for better UX
}


function setupLiveBackground() {
    const backgroundContainer = document.querySelector('.github-bg');
    if (!backgroundContainer) return;
    

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    backgroundContainer.appendChild(particlesContainer);
    

    createStarfield();
    createFloatingParticles(particlesContainer, 15);
    createFloatingCodeSnippets(backgroundContainer);
    createPulseDots(backgroundContainer, 8);
    addMouseInteraction(backgroundContainer);
    setupCosmicInteractions();
}


function createStarfield() {
    const starsContainer = document.querySelector('.stars');
    if (!starsContainer) return;
    

    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        

        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        

        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        

        star.style.animationDelay = `${Math.random() * 3}s`;
        

        if (Math.random() < 0.1) {
            star.style.boxShadow = `0 0 6px currentColor`;
        }
        
        starsContainer.appendChild(star);
    }
}


function setupCosmicInteractions() {
    const cosmicSky = document.querySelector('.cosmic-sky');
    if (!cosmicSky) return;
    

    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        

        const galaxy = document.querySelector('.galaxy');
        if (galaxy) {
            const moveX = (mouseX - 0.5) * 20;
            const moveY = (mouseY - 0.5) * 10;
            galaxy.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
        

        const nebulae = document.querySelectorAll('.nebula');
        nebulae.forEach((nebula, index) => {
            const moveX = (mouseX - 0.5) * (10 + index * 5);
            const moveY = (mouseY - 0.5) * (5 + index * 3);
            nebula.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        

        const planets = document.querySelectorAll('.planet');
        planets.forEach((planet, index) => {
            const moveX = (mouseX - 0.5) * (15 + index * 3);
            const moveY = (mouseY - 0.5) * (8 + index * 2);
            planet.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
    

    setInterval(createCosmicEvent, 12000);
}


function createCosmicEvent() {
    const events = ['supernova', 'meteorShower', 'solarFlare'];
    const event = events[Math.floor(Math.random() * events.length)];
    
    switch(event) {
        case 'supernova':
            createSupernova();
            break;
        case 'meteorShower':
            createMeteorShower();
            break;
        case 'solarFlare':
            createSolarFlare();
            break;
    }
}

function createSupernova() {
    const supernova = document.createElement('div');
    supernova.style.position = 'absolute';
    supernova.style.left = `${Math.random() * 80 + 10}%`;
    supernova.style.top = `${Math.random() * 60 + 20}%`;
    supernova.style.width = '4px';
    supernova.style.height = '4px';
    supernova.style.background = 'white';
    supernova.style.borderRadius = '50%';
    supernova.style.animation = 'supernova 3s ease-out forwards';
    supernova.style.pointerEvents = 'none';
    
    document.querySelector('.cosmic-sky').appendChild(supernova);
    
    setTimeout(() => {
        if (supernova.parentNode) {
            supernova.parentNode.removeChild(supernova);
        }
    }, 3000);
}

function createMeteorShower() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const meteor = document.createElement('div');
            meteor.className = 'shooting-star';
            meteor.style.top = `${Math.random() * 30 + 10}%`;
            meteor.style.left = '-50px';
            meteor.style.animation = 'shootingStar 2s linear forwards';
            
            document.querySelector('.cosmic-sky').appendChild(meteor);
            
            setTimeout(() => {
                if (meteor.parentNode) {
                    meteor.parentNode.removeChild(meteor);
                }
            }, 2000);
        }, i * 200);
    }
}

function createSolarFlare() {
    const flare = document.createElement('div');
    flare.style.position = 'absolute';
    flare.style.top = '0';
    flare.style.left = '0';
    flare.style.width = '100%';
    flare.style.height = '100%';
    flare.style.background = 'radial-gradient(circle at 50% 0%, rgba(255, 140, 0, 0.1) 0%, transparent 50%)';
    flare.style.animation = 'solarFlare 4s ease-in-out forwards';
    flare.style.pointerEvents = 'none';
    
    document.querySelector('.cosmic-sky').appendChild(flare);
    
    setTimeout(() => {
        if (flare.parentNode) {
            flare.parentNode.removeChild(flare);
        }
    }, 4000);
}


const cosmicCSS = `
    @keyframes supernova {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(255, 255, 255, 1);
        }
        50% {
            transform: scale(8);
            box-shadow: 0 0 50px rgba(255, 255, 255, 0.8);
        }
        100% {
            transform: scale(20);
            opacity: 0;
            box-shadow: 0 0 100px rgba(255, 255, 255, 0);
        }
    }
    
    @keyframes solarFlare {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
    }
`;

if (!document.querySelector('#cosmic-styles')) {
    const style = document.createElement('style');
    style.id = 'cosmic-styles';
    style.textContent = cosmicCSS;
    document.head.appendChild(style);
}

function createFloatingParticles(container, count) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        

        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        

        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        

        particle.style.animationDelay = `${Math.random() * 6}s`;
        
        container.appendChild(particle);
    }
}

function createFloatingCodeSnippets(container) {
    const codeSnippets = [
        'function() {',
        'return true;',
        '};',
        'const data =',
        'async/await',
        '=> { }',
        'class SRAC',
        'import {',
        '} from',
        '.then()',
        'console.log',
        'git commit',
        'npm install',
        '// TODO:',
        '',
        '<div>',
        '</div>',
        'var x = 0;',
        'if (true)',
        'else {',
        'for (i=0;',
        'while()',
        'break;',
        'continue;'
    ];
    
    function createCodeSnippet() {
        const codeElement = document.createElement('div');
        codeElement.className = 'code-float';
        codeElement.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        

        codeElement.style.left = `${Math.random() * 90}%`;
        codeElement.style.top = '100vh';
        

        codeElement.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(codeElement);
        

        setTimeout(() => {
            if (codeElement.parentNode) {
                codeElement.parentNode.removeChild(codeElement);
            }
        }, 20000);
    }
    

    for (let i = 0; i < 8; i++) {
        setTimeout(() => createCodeSnippet(), i * 2000);
    }
    

    setInterval(createCodeSnippet, 3000);
}

function createPulseDots(container, count) {
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = 'pulse-dot';
        

        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${Math.random() * 100}%`;
        

        dot.style.animationDelay = `${Math.random() * 3}s`;
        
        container.appendChild(dot);
    }
}

function addMouseInteraction(container) {
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        

        if (Math.random() < 0.1) { // 10% chance
            createMouseParticle(container, mouseX, mouseY);
        }
    });
}

function createMouseParticle(container, x, y) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = '3px';
    particle.style.height = '3px';
    particle.style.background = 'var(--accent-secondary)';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '-1';
    particle.style.opacity = '0.8';
    particle.style.transition = 'all 2s ease-out';
    
    container.appendChild(particle);
    

    requestAnimationFrame(() => {
        particle.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(0)`;
        particle.style.opacity = '0';
    });
    

    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 2000);
}


function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}


function setupTableOfContents() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('.term-section');
    
    if (tocLinks.length === 0 || sections.length === 0) return;
    

    function updateActiveLink() {
        const scrollPosition = window.scrollY + 150;
        
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });
        

        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    

    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    });
    

    updateActiveLink();
}


function setupProgressIndicator() {

    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    document.body.appendChild(progressBar);
    

    const progressCSS = `
        .reading-progress {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            height: 3px;
            background: var(--bg-secondary);
            z-index: 999;
            border-bottom: 1px solid var(--border-muted);
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--accent-secondary), var(--accent-primary));
            width: 0%;
            transition: width 0.3s ease;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = progressCSS;
    document.head.appendChild(style);
    

    function updateProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = Math.min(progress, 100) + '%';
        }
    }
    
    let progressTicking = false;
    window.addEventListener('scroll', function() {
        if (!progressTicking) {
            requestAnimationFrame(function() {
                updateProgress();
                progressTicking = false;
            });
            progressTicking = true;
        }
    });
}


function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    

    const termSections = document.querySelectorAll('.term-section');
    termSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(section);
    });
    

    const animatedElements = document.querySelectorAll('.contact-card, .agreement-card');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(element);
    });
}


function setupInteractiveElements() {

    const acceptBtn = document.querySelector('.btn-accept');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {

            localStorage.setItem('srac-terms-accepted', 'true');
            localStorage.setItem('srac-terms-accepted-date', new Date().toISOString());
            

            showTermsAcceptedModal();
        });
    }
    

    const downloadBtn = document.querySelector('.btn-secondary');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            generatePDF();
        });
    }
    

    setupMobileNavigation();
    

    setupDownloadButton();
    

    updateTermsStatus();
    

    if (!('ontouchstart' in window)) {
        const termSections = document.querySelectorAll('.term-section');
        termSections.forEach(section => {
            section.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            section.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
    

    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.querySelector('span').textContent;
            if (text.includes('@')) {
                window.open(`mailto:${text}`, '_blank');
            } else if (text.includes('www.')) {
                window.open(`https://${text}`, '_blank');
            }
        });
        

        item.style.cursor = 'pointer';
    });
}


function showAcceptanceModal() {
    const modal = createModal({
        title: 'Terms Accepted',
        content: `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 1rem;">✓</div>
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Thank you!</h3>
                <p style="color: var(--text-secondary); line-height: 1.6;">
                    You have successfully accepted the SRAC Terms & Conditions. 
                    You can now proceed to download and use the software.
                </p>
                <div style="margin-top: 2rem;">
                    <button class="btn-primary" onclick="closeModal()">
                        <i class="fas fa-download"></i>
                        Download SRAC
                    </button>
                </div>
            </div>
        `,
        showCloseButton: true
    });
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}


function generatePDF() {
    const modal = createModal({
        title: 'Download Terms & Conditions',
        content: `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3rem; color: var(--accent-secondary); margin-bottom: 1rem;">📄</div>
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">PDF Generation</h3>
                <p style="color: var(--text-secondary); line-height: 1.6;">
                    The PDF version of these Terms & Conditions will be generated and downloaded shortly.
                </p>
                <div style="margin-top: 2rem;">
                    <button class="btn-primary" onclick="closeModal(); simulateDownload();">
                        <i class="fas fa-download"></i>
                        Start Download
                    </button>
                </div>
            </div>
        `,
        showCloseButton: true
    });
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}


function createModal({ title, content, showCloseButton = false }) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                ${showCloseButton ? '<button class="modal-close" onclick="closeModal()">×</button>' : ''}
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    

    const modalCSS = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(1, 4, 9, 0.8);
            backdrop-filter: blur(8px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal-overlay.show {
            opacity: 1;
        }
        
        .modal-content {
            background: var(--bg-secondary);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: var(--shadow-lg);
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        
        .modal-overlay.show .modal-content {
            transform: translateY(0);
        }
        
        .modal-header {
            padding: var(--spacing-lg);
            border-bottom: 1px solid var(--border-muted);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h2 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.25rem;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        
        .modal-close:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }
        
        .modal-body {
            padding: 0;
        }
        
        
        @media (max-width: 768px) {
            .modal-content {
                width: 95%;
                max-width: none;
                margin: var(--spacing-md);
            }
            
            .modal-header {
                padding: var(--spacing-md);
            }
            
            .modal-header h2 {
                font-size: 1.1rem;
            }
        }
        
        @media (max-width: 480px) {
            .modal-content {
                width: 98%;
                margin: var(--spacing-sm);
            }
            
            .modal-header {
                padding: var(--spacing-sm) var(--spacing-md);
            }
        }
    `;
    
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = modalCSS;
        document.head.appendChild(style);
    }
    

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    return modal;
}


function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}


function simulateDownload() {
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,SRAC Terms & Conditions - Downloaded';
    link.download = 'SRAC_Terms_Conditions.txt';
    link.click();
}


document.addEventListener('keydown', function(e) {

    if (e.key === 'Escape') {
        closeModal();
    }
    

    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        if (confirm('Reset terms acceptance? This is for testing purposes.')) {
            resetTermsAcceptance();
        }
    }
    

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const activeLink = document.querySelector('.toc-link.active');
        if (activeLink) {
            const allLinks = Array.from(document.querySelectorAll('.toc-link'));
            const currentIndex = allLinks.indexOf(activeLink);
            let nextIndex;
            
            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % allLinks.length;
            } else {
                nextIndex = currentIndex === 0 ? allLinks.length - 1 : currentIndex - 1;
            }
            
            if (allLinks[nextIndex]) {
                allLinks[nextIndex].click();
                e.preventDefault();
            }
        }
    }
});


function addLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <p>Loading Terms & Conditions...</p>
        </div>
    `;
    
    const loaderCSS = `
        .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-canvas);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
            transition: opacity 0.5s ease;
        }
        
        .loader-content {
            text-align: center;
            color: var(--text-primary);
        }
        
        .loader-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-default);
            border-top: 3px solid var(--accent-secondary);
            border-radius: 50%;
            margin: 0 auto 1rem;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .page-loader.hide {
            opacity: 0;
            pointer-events: none;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = loaderCSS;
    document.head.appendChild(style);
    
    document.body.appendChild(loader);
    

    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.classList.add('hide');
            setTimeout(() => loader.remove(), 500);
        }, 1000);
    });
}


addLoadingAnimation();


function addParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    });
}


addParallaxEffect();


function updateTermsStatus() {
    const hasAcceptedTerms = localStorage.getItem('srac-terms-accepted');
    const downloadBtns = document.querySelectorAll('.btn-primary');
    
    if (hasAcceptedTerms) {
        downloadBtns.forEach(btn => {
            if (btn.textContent.includes('Download')) {

                btn.innerHTML = '<i class="fas fa-download"></i> Go to Download';
                btn.style.background = 'var(--accent-primary)';
                btn.title = 'Terms already accepted - Click to download';
                

                btn.removeEventListener('click', showTermsAgreementModal);
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = 'download.html';
                });
            }
        });
        

        const agreementCard = document.querySelector('.agreement-card');
        if (agreementCard && !agreementCard.querySelector('.terms-accepted-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'terms-accepted-indicator';
            indicator.innerHTML = `
                <div style="background: rgba(35, 134, 54, 0.1); border: 1px solid rgba(35, 134, 54, 0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <p style="color: var(--accent-primary); font-size: 0.9rem; margin: 0; text-align: center;">
                        <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
                        You have already accepted these Terms & Conditions
                    </p>
                </div>
            `;
            agreementCard.insertBefore(indicator, agreementCard.querySelector('h3'));
        }
    }
}


function setupDownloadButton() {
    const downloadBtns = document.querySelectorAll('.btn-primary');
    const hasAcceptedTerms = localStorage.getItem('srac-terms-accepted');
    
    downloadBtns.forEach(btn => {
        if (btn.textContent.includes('Download')) {
            if (hasAcceptedTerms) {

                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = 'download.html';
                });
            } else {

                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showTermsAgreementModal();
                });
            }
        }
    });
}


function showTermsAgreementModal() {
    const modal = createModal({
        title: 'Accept Terms & Conditions',
        content: `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3rem; color: var(--accent-warning); margin-bottom: 1rem;">⚠️</div>
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Terms & Conditions Required</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
                    To download SRAC software, you must first read and accept our Terms & Conditions. 
                    This ensures you understand the license agreement and usage guidelines.
                </p>
                <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn-primary" onclick="scrollToAgreement(); closeModal();" style="background: var(--accent-primary);">
                        <i class="fas fa-scroll"></i>
                        Read Terms & Accept
                    </button>
                    <button class="btn-secondary" onclick="closeModal();" style="background: var(--bg-secondary); color: var(--text-secondary);">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                </div>
            </div>
        `,
        showCloseButton: true
    });
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}


function checkAndShowWelcomeModal() {

    const hasSeenWelcome = sessionStorage.getItem('srac-terms-welcome-shown');
    const hasAcceptedTerms = localStorage.getItem('srac-terms-accepted');
    
    if (!hasSeenWelcome) {
        if (hasAcceptedTerms) {
            showReturningUserModal();
        } else {
            showWelcomeTermsModal();
        }

        sessionStorage.setItem('srac-terms-welcome-shown', 'true');
    }
}


function showReturningUserModal() {
    const acceptedDate = localStorage.getItem('srac-terms-accepted-date');
    const formattedDate = acceptedDate ? new Date(acceptedDate).toLocaleDateString() : 'recently';
    
    const modal = createModal({
        title: 'Welcome Back!',
        content: `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 1rem;">✅</div>
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Terms Already Accepted</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
                    You have already accepted our Terms & Conditions on ${formattedDate}. 
                    You can now download SRAC software or review the terms again if needed.
                </p>
                <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="window.location.href='download.html'; closeModal();" style="background: var(--accent-primary);">
                        <i class="fas fa-download"></i>
                        Go to Download
                    </button>
                    <button class="btn-secondary" onclick="closeModal();" style="background: var(--bg-secondary); color: var(--text-secondary);">
                        <i class="fas fa-times"></i>
                        Continue Reading
                    </button>
                </div>
            </div>
        `,
        showCloseButton: true
    });
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}


function showTermsAcceptedModal() {
    const modal = createModal({
        title: 'Terms & Conditions Accepted!',
        content: `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 1rem;">🎉</div>
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Thank You!</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
                    You have successfully accepted the SRAC Terms & Conditions. 
                    You can now download and use our educational software platform.
                </p>
                <div style="background: rgba(35, 134, 54, 0.1); border: 1px solid rgba(35, 134, 54, 0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0;">
                    <p style="color: var(--accent-primary); font-size: 0.9rem; margin: 0;">
                        <i class="fas fa-shield-check" style="margin-right: 0.5rem;"></i>
                        Your acceptance has been recorded. You won't need to accept again.
                    </p>
                </div>
                <div style="margin-top: 2rem;">
                    <button class="btn-primary" onclick="window.location.href='download.html';" style="background: var(--accent-primary);">
                        <i class="fas fa-download"></i>
                        Download SRAC Now
                    </button>
                </div>
            </div>
        `,
        showCloseButton: false
    });
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}


function showWelcomeTermsModal() {
    const modal = createModal({
        title: 'Welcome to SRAC Terms & Conditions',
        content: `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3rem; color: var(--accent-secondary); margin-bottom: 1rem;">📜</div>
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Important Legal Information</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
                    Before using SRAC software, please take a moment to read our Terms & Conditions. 
                    These terms outline your rights, responsibilities, and the licensing agreement for using our educational platform.
                </p>
                <div style="background: rgba(88, 166, 255, 0.1); border: 1px solid rgba(88, 166, 255, 0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0;">
                    <p style="color: var(--text-accent); font-size: 0.9rem; margin: 0;">
                        <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                        By continuing to use this website, you acknowledge that you will read and accept our terms.
                    </p>
                </div>
                <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-primary" onclick="scrollToAgreement(); closeModal();" style="background: var(--accent-primary);">
                        <i class="fas fa-scroll"></i>
                        Read & Accept Terms
                    </button>
                    <button class="btn-secondary" onclick="closeModal();" style="background: var(--bg-secondary); color: var(--text-secondary);">
                        <i class="fas fa-clock"></i>
                        I'll Read Later
                    </button>
                </div>
                <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 1rem;">
                    This popup appears once per session. You can access terms anytime from the navigation menu.
                </p>
            </div>
        `,
        showCloseButton: true
    });
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}


function scrollToAgreement() {
    const agreementSection = document.querySelector('.agreement-section');
    if (agreementSection) {
        agreementSection.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        

        const agreementCard = document.querySelector('.agreement-card');
        if (agreementCard) {
            agreementCard.style.animation = 'highlightPulse 2s ease-in-out';
            agreementCard.style.boxShadow = '0 0 30px rgba(88, 166, 255, 0.3)';
            
            setTimeout(() => {
                agreementCard.style.animation = '';
                agreementCard.style.boxShadow = '';
            }, 2000);
        }
    }
}


function setupMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    

    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu-overlay';
    mobileMenu.innerHTML = `
        <div class="mobile-menu-content">
            <div class="mobile-menu-header">
                <div class="mobile-brand">
                    <div class="brand-icon">
                        <i class="fas fa-code-branch"></i>
                    </div>
                    <span class="brand-text">SRAC</span>
                </div>
                <button class="mobile-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <nav class="mobile-nav">
                <a href="#" class="mobile-nav-link">Home</a>
                <a href="#" class="mobile-nav-link">Features</a>
                <a href="#" class="mobile-nav-link">Pricing</a>
                <a href="#" class="mobile-nav-link active">Terms</a>
                <a href="#" class="mobile-nav-link">Contact</a>
            </nav>
            <div class="mobile-actions">
                <button class="btn-primary mobile-download" onclick="showTermsAgreementModal(); document.querySelector('.mobile-menu-overlay').classList.remove('active'); document.querySelector('.hamburger').classList.remove('active'); document.body.style.overflow = '';">
                    <i class="fas fa-download"></i>
                    Download
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(mobileMenu);
    

    const mobileCSS = `
        .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(1, 4, 9, 0.95);
            backdrop-filter: blur(12px);
            z-index: 10001;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .mobile-menu-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .mobile-menu-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: var(--spacing-lg);
        }
        
        .mobile-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: var(--spacing-lg);
            border-bottom: 1px solid var(--border-default);
            margin-bottom: var(--spacing-lg);
        }
        
        .mobile-brand {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            color: var(--text-primary);
            font-weight: 600;
            font-size: 18px;
        }
        
        .mobile-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: var(--spacing-sm);
            border-radius: var(--radius-sm);
            transition: all 0.2s ease;
        }
        
        .mobile-close:hover {
            color: var(--text-primary);
            background: var(--bg-secondary);
        }
        
        .mobile-nav {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
        }
        
        .mobile-nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            padding: var(--spacing-md);
            border-radius: var(--radius-sm);
            font-weight: 500;
            font-size: 1.1rem;
            transition: all 0.2s ease;
            border: 1px solid transparent;
        }
        
        .mobile-nav-link:hover {
            color: var(--text-primary);
            background: var(--bg-secondary);
            border-color: var(--border-default);
        }
        
        .mobile-nav-link.active {
            color: var(--text-accent);
            background: rgba(88, 166, 255, 0.1);
            border-color: rgba(88, 166, 255, 0.2);
        }
        
        .mobile-actions {
            padding-top: var(--spacing-lg);
            border-top: 1px solid var(--border-default);
        }
        
        .mobile-download {
            width: 100%;
            justify-content: center;
            padding: var(--spacing-md);
            font-size: 1.1rem;
        }
        
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(6px, 6px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(6px, -6px);
        }
        
        @media (min-width: 769px) {
            .mobile-menu-overlay {
                display: none;
            }
        }
    `;
    
    if (!document.querySelector('#mobile-nav-styles')) {
        const style = document.createElement('style');
        style.id = 'mobile-nav-styles';
        style.textContent = mobileCSS;
        document.head.appendChild(style);
    }
    

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    

    const closeBtn = mobileMenu.querySelector('.mobile-close');
    closeBtn.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
    

    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}


function resetTermsAcceptance() {
    localStorage.removeItem('srac-terms-accepted');
    localStorage.removeItem('srac-terms-accepted-date');
    sessionStorage.removeItem('srac-terms-welcome-shown');
    console.log('Terms acceptance has been reset. Refresh the page to see the welcome modal again.');
    location.reload();
}


console.log('%c🚀 SRAC Terms & Conditions Loaded', 'color: #58a6ff; font-size: 16px; font-weight: bold;');
console.log('%cGitHub Dark Theme Initialized', 'color: #238636; font-size: 12px;');
console.log('%cTo reset terms acceptance for testing, run: resetTermsAcceptance()', 'color: #d29922; font-size: 10px;');

