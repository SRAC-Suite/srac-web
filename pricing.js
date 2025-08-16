document.addEventListener('DOMContentLoaded', function() {
    initStarfieldCanvas();
    initPricingCalculator();
    initFormValidation();
    initTierSelection();
    initMobileMenu();
    initFormatDropdown();
});

function initStarfieldCanvas() {
    const canvas = document.getElementById('starfield-canvas');
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let time = 0;
    const stars = [];
    const shootingStars = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStarField() {
        stars.length = 0;
        const starCount = Math.floor((canvas.width * canvas.height) / 8000);
        
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                color: ['#f0f6fc', '#388bfd', '#a371f7', '#ff7b72'][Math.floor(Math.random() * 4)]
            });
        }
    }

    function updateStarfield() {
        stars.forEach(star => {
            star.opacity = 0.2 + Math.sin(time * star.twinkleSpeed) * 0.6;
        });

        shootingStars.forEach((star, index) => {
            star.x += star.velocityX;
            star.y += star.velocityY;
            star.opacity -= 0.008;
            
            if (star.opacity <= 0 || star.x > canvas.width || star.y > canvas.height) {
                shootingStars.splice(index, 1);
            }
        });

        if (Math.random() < 0.001) {
            createShootingStar();
        }
    }

    function createShootingStar() {
        shootingStars.push({
            x: Math.random() * canvas.width / 2,
            y: Math.random() * canvas.height / 2,
            velocityX: Math.random() * 3 + 2,
            velocityY: Math.random() * 3 + 2,
            opacity: 1,
            trail: []
        });
    }

    function drawStarfield() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = star.opacity;
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            if (star.opacity > 0.7) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = star.color;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        shootingStars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = star.opacity;
            
            const gradient = ctx.createLinearGradient(
                star.x - star.velocityX * 10, star.y - star.velocityY * 10,
                star.x, star.y
            );
            gradient.addColorStop(0, 'rgba(56, 139, 253, 0)');
            gradient.addColorStop(1, 'rgba(56, 139, 253, 0.8)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(star.x - star.velocityX * 10, star.y - star.velocityY * 10);
            ctx.lineTo(star.x, star.y);
            ctx.stroke();
            
            ctx.fillStyle = '#388bfd';
            ctx.beginPath();
            ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function animate() {
        time += 0.01;
        updateStarfield();
        drawStarfield();
        animationFrame = requestAnimationFrame(animate);
    }

    resizeCanvas();
    createStarField();
    animate();

    window.addEventListener('resize', () => {
        resizeCanvas();
        createStarField();
    });
}

function initPricingCalculator() {
    const form = document.getElementById('pricingForm');
    const resultContainer = document.getElementById('calculatorResult');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculatePricing();
    });

    form.addEventListener('change', calculatePricing);
    form.addEventListener('input', calculatePricing);
    
    // Add event listeners for checkbox changes
    const formatCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="format_"]');
    formatCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculatePricing);
    });
    
    // Add minimum validation for student count
    const studentCountInput = document.getElementById('studentCount');
    if (studentCountInput) {
        studentCountInput.addEventListener('input', function(e) {
            const value = parseInt(e.target.value);
            if (value && value < 20) {
                showFieldError(e.target, 'Warning: Minimum 20 students for billing. Showing minimum pricing.');
                setTimeout(() => clearFieldError(e), 3000);
            }
        });
        
        studentCountInput.addEventListener('change', function(e) {
            calculatePricing(); // Just recalculate, don't force value
        });
    }
    
    // Generate default bill on page load
    setTimeout(() => {
        calculatePricing();
    }, 100);
}

function calculatePricing() {
    const formData = getFormData();
    
    const pricing = calculateDetailedPricing(formData);
    displayPricingBreakdown(pricing, formData);
    showBreakdown();
}

function getFormData() {
    // Get selected report formats from checkboxes
    const formatCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="format_"]:checked');
    const reportFormat = Array.from(formatCheckboxes).map(cb => cb.value);
    
    // If no formats selected, default to excel
    if (reportFormat.length === 0) {
        reportFormat.push('excel');
        document.getElementById('format_excel').checked = true;
    }

    // Get student count - allow any number, don't force minimum here
    const studentCountInput = document.getElementById('studentCount');
    const studentCount = parseInt(studentCountInput?.value) || 20;

    return {
        analysisType: document.getElementById('analysisType')?.value || 'normal',
        studentCount: studentCount, // Don't force minimum here, let pricing function handle it
        reportFormat: reportFormat,
        contactName: document.getElementById('contactName')?.value || '',
        contactEmail: document.getElementById('contactEmail')?.value || '',
        institution: document.getElementById('institution')?.value || ''
    };
}

function calculateDetailedPricing(data) {
    let perStudentRate = 0;
    let deliveryTime = '';
    let total = 0;
    let studentLimitError = '';

    // Determine pricing based on analysis type and student count
    switch (data.analysisType) {
        case 'normal':
            // Normal Analysis: 20-100 students maximum, capped pricing
            if (data.studentCount < 20) {
                studentLimitError = 'Minimum 20 students required for Normal Analysis';
                total = 180; // Show minimum pricing
                perStudentRate = 9; // ₹9 per student minimum
            } else if (data.studentCount > 100) {
                studentLimitError = 'Normal Analysis limited to maximum 100 students. For larger batches, use Express Analysis.';
                total = 250; // Cap at maximum
                perStudentRate = 2.5; // Show capped rate
            } else if (data.studentCount >= 20 && data.studentCount <= 40) {
                // For 20-40 students: ₹180-210 (₹9-5.25 per student)
                const progress = (data.studentCount - 20) / (40 - 20);
                total = 180 + (progress * (210 - 180));
                perStudentRate = total / data.studentCount;
        } else if (data.studentCount >= 41 && data.studentCount <= 79) {
            // For 41-79 students: ₹210-250 (scaling up toward cap)
            const progress = (data.studentCount - 41) / (79 - 41);
            total = 210 + (progress * (250 - 210));
            perStudentRate = total / data.studentCount;
        } else if (data.studentCount >= 80 && data.studentCount <= 100) {
            // For 80-100 students: capped at ₹250
            total = 250;
            perStudentRate = total / data.studentCount;
        }
            deliveryTime = 'Generated instantly, deliberately delivered after 2 Days (to provide leverage for Express)';
            break;

        case 'express':
            // Express Analysis: Unlimited students, premium service
            if (data.studentCount < 20) {
                studentLimitError = 'Minimum 20 students required for Express Analysis';
                total = 750;
                perStudentRate = 37.5; // ₹37.5 per student minimum
            } else {
                // Fixed ₹750 regardless of student count (unlimited)
                total = 750;
                perStudentRate = total / data.studentCount;
            }
            deliveryTime = 'Generated instantly, delivered within 15 Minutes (Ultra Priority, Unlimited Students)';
            break;
            
        default:
            total = 180;
            perStudentRate = 9;
            deliveryTime = 'Please select analysis type';
    }

    // Calculate format fees - only for paid formats
    let formatFee = 0;
    data.reportFormat.forEach(format => {
        switch (format) {
            case 'presentation':
                formatFee += 20;
                break;
            case 'rv_tracking':
                formatFee += 50;
                break;
            case 'smart_monitoring':
                formatFee += 75;
                break;
            case 'digital':
            case 'excel':
            case 'combined':
            case 'subject':
            case 'word':
            default:
                // Free formats don't add to cost
                break;
        }
    });

    // Calculate final total
    const finalTotal = total + formatFee;

    return {
        perStudentRate: Math.ceil(perStudentRate * 10) / 10,
        studentCount: data.studentCount,
        studentCost: Math.ceil(total * 10) / 10,
        formatFee: Math.ceil(formatFee * 10) / 10,
        total: Math.ceil(finalTotal * 10) / 10,
        deliveryTime,
        studentLimitError
    };
}

function displayPricingBreakdown(pricing, formData) {
    // Update breakdown to show clean per-student calculation
    document.getElementById('basePrice').textContent = `₹${pricing.perStudentRate} × ${pricing.studentCount} students`;
    document.getElementById('hardwareFee').textContent = `₹${pricing.studentCost}`;
    document.getElementById('laborFee').textContent = `₹${pricing.formatFee}`;
    document.getElementById('licenseFee').textContent = `₹${pricing.total}`;
    
    // Hide unnecessary breakdown items
    document.getElementById('perStudentItem').style.display = 'none';
    document.getElementById('complexityFeeItem').style.display = 'none';
    document.getElementById('urgencyFeeItem').style.display = 'none';
    document.getElementById('formatFeeItem').style.display = pricing.formatFee > 0 ? 'flex' : 'none';
    document.getElementById('dailyVariationItem').style.display = 'none';
    
    document.getElementById('totalPrice').textContent = `₹${pricing.total}`;
    document.getElementById('deliveryTime').textContent = `Delivery: ${pricing.deliveryTime}`;

    const analysisTypeLabel = formData.analysisType === 'normal' ? 'Normal Analysis' : 
                             formData.analysisType === 'express' ? 'Express Analysis' : 'Analysis';
    
    // Handle student limit errors
    if (pricing.studentLimitError) {
        const errorElement = document.createElement('div');
        errorElement.className = 'student-limit-warning';
        errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${pricing.studentLimitError}`;
        
        // Show error in the breakdown container
        const breakdownContainer = document.getElementById('breakdownContainer');
        const existingWarning = breakdownContainer.querySelector('.student-limit-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        breakdownContainer.insertBefore(errorElement, breakdownContainer.firstChild);
    } else {
        // Remove any existing warnings
        const existingWarning = document.getElementById('breakdownContainer').querySelector('.student-limit-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
    }
    
    // Handle multiple report formats in status
    let formatInfo = '';
    if (Array.isArray(formData.reportFormat)) {
        const formatCount = formData.reportFormat.length;
        formatInfo = formatCount > 1 ? ` (${formatCount} formats selected)` : '';
    }
    
    const statusText = formData.contactName ? 
        `Quote for ${formData.contactName} - ${analysisTypeLabel} for ${formData.studentCount} students${formatInfo}` :
        `${analysisTypeLabel} calculated for ${formData.studentCount} students${formatInfo}`;
    
    // Show different status based on whether there's an error
    const statusType = pricing.studentLimitError ? 'warning' : 'success';
    showStatus(statusText, statusType);
}

function toggleFeeItem(itemId, show) {
    const item = document.getElementById(itemId);
    if (item) {
        item.style.display = show ? 'flex' : 'none';
    }
}

function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('resultStatus');
    const iconMap = {
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle',
        'info': 'info-circle'
    };
    statusElement.innerHTML = `<i class="fas fa-${iconMap[type] || iconMap.info}"></i> ${message}`;
    statusElement.className = `result-status ${type}`;
}

function showBreakdown() {
    document.getElementById('breakdownContainer').style.display = 'block';
}

function hideBreakdown() {
    document.getElementById('breakdownContainer').style.display = 'none';
}

function initFormValidation() {
    const form = document.getElementById('pricingForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');

    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Clear any existing error when checkbox is changed
            const firstCheckbox = document.getElementById('format_digital');
            if (firstCheckbox) {
                clearFieldError({ target: firstCheckbox });
            }
        });
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    clearFieldError(e);
    
    if (!value && field.required) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    if (field.type === 'number' && value) {
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 10000) {
            showFieldError(field, 'Please enter a number between 1 and 10,000');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    clearFieldError({ target: field });
    
    field.style.borderColor = '#da3633';
    field.style.boxShadow = '0 0 10px rgba(218, 54, 51, 0.3)';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = `
        color: #da3633;
        font-size: 0.85rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    `;
    errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function initTierSelection() {
    const tierCards = document.querySelectorAll('.tier-card');
    const analysisTypeSelect = document.getElementById('analysisType');
    
    tierCards.forEach(card => {
        card.addEventListener('click', function() {
            const tier = this.dataset.tier;
            if (tier && tier !== 'deprecated') {
                analysisTypeSelect.value = tier;
                calculatePricing();
                
                tierCards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                
                document.querySelector('.calculator-section').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });
}

function generateQuote() {
    const formData = getFormData();
    
    if (!validateForm()) {
        alert('Please fill in all required fields before generating a quote.\n\nRequired: Analysis Type, Student Count, Report Format, Name, Email, and Institution');
        return;
    }
    
    const pricing = calculateDetailedPricing(formData);
    const quoteData = {
        ...formData,
        ...pricing,
        quoteId: generateQuoteId(),
        generatedDate: new Date().toLocaleDateString('en-IN'),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN') // 7 days
    };
    
    generateQuoteTextSummary(quoteData);
}

function validateForm() {
    const requiredFields = ['analysisType', 'studentCount', 'contactName', 'contactEmail', 'institution'];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        if (!value) {
            showFieldError(field, 'This field is required for quote generation');
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
            return false;
        }
        
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(field, 'Please enter a valid email address');
                field.focus();
                return false;
            }
        }
        
        if (field.type === 'number') {
            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 10000) {
                showFieldError(field, 'Please enter a valid number of students (1-10,000)');
                field.focus();
                return false;
            }
        }
    }
    
    // Check if at least one report format is selected
    const formatCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="format_"]:checked');
    if (formatCheckboxes.length === 0) {
        const firstCheckbox = document.getElementById('format_excel');
        showFieldError(firstCheckbox, 'Please select at least one report format');
        firstCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }
    
    return true;
}

function generateQuoteId() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `SRAC-${dateStr}-${randomStr}`;
}

function generateQuoteTextSummary(quoteData) {
    // Show options for quote generation
    showQuoteGenerationOptions(quoteData);
}

function showQuoteGenerationOptions(quoteData) {
    // Directly generate image quote without showing options
    createQuoteImage(quoteData);
}

function generateImageQuote(quoteDataStr) {
    const quoteData = JSON.parse(quoteDataStr.replace(/&quot;/g, '"'));
    closeQuoteOptions();
    createQuoteImage(quoteData);
}

function generateTextQuote(quoteDataStr) {
    const quoteData = JSON.parse(quoteDataStr.replace(/&quot;/g, '"'));
    closeQuoteOptions();
    generateTextQuoteFormat(quoteData);
}

function generateBothFormats(quoteDataStr) {
    const quoteData = JSON.parse(quoteDataStr.replace(/&quot;/g, '"'));
    closeQuoteOptions();
    generateBothQuoteFormats(quoteData);
}

function createQuoteImage(quoteData) {
    // Create canvas for quote image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for high quality
    canvas.width = 1200;
    canvas.height = 1600;
    
    // Create cosmic background
    createCosmicBackground(ctx, canvas.width, canvas.height);
    
    // Add quote content
    addQuoteContent(ctx, quoteData, canvas.width, canvas.height);
    
    // Show the generated image with download option
    showImageQuoteResult(canvas, quoteData);
}

function createCosmicBackground(ctx, width, height) {
    // Create gradient background
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    gradient.addColorStop(0, '#001122');
    gradient.addColorStop(0.4, '#000611');
    gradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add colored particles
    const colors = ['#4a90e2', '#8a2be2', '#ffd700'];
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 3 + 1;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + '80';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function addQuoteContent(ctx, quoteData, width, height) {
    const formatsList = Array.isArray(quoteData.reportFormat) ? 
        quoteData.reportFormat.map(f => {
            const formatNames = {
                'excel': 'Excel Analysis Report - Free', 
                'combined': 'Combined PDF (All Students) - Free',
                'subject': 'Subject-Specific Analysis - Free',
                'word': 'Word Document Format - Free',
                'presentation': 'Graph-compatible Excel (+₹20)',
                'rv_tracking': 'RV Results Auto-Update (+₹50)',
                'smart_monitoring': 'Smart AI Monitoring (+₹75)'
            };
            return formatNames[f] || f;
        }).join(', ') : 'Excel Analysis Report';

    const institutionName = quoteData.institution === 'acs' ? 'ACS College' : 
                           quoteData.institution === 'rrc' ? 'RRC Institute' : 'Unknown';

    const analysisTypeLabel = quoteData.analysisType === 'normal' ? 'Normal Analysis' : 
                             quoteData.analysisType === 'express' ? 'Express Analysis' : 'Analysis';
    
    let yPos = 60;
    
    // Header with logo effect
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SRAC ANALYSIS SERVICE', width/2, yPos);
    yPos += 40;
    
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#4a90e2';
    ctx.fillText('PRICE ESTIMATION QUOTE', width/2, yPos);
    yPos += 80;
    
    // Quote details section
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('📋 QUOTE DETAILS', 80, yPos);
    yPos += 40;
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Quote ID: ${quoteData.quoteId}`, 100, yPos);
    yPos += 30;
    ctx.fillText(`Generated: ${quoteData.generatedDate}`, 100, yPos);
    yPos += 30;
    ctx.fillText(`Valid Until: ${quoteData.validUntil}`, 100, yPos);
    yPos += 60;
    
    // Client information
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('👤 CLIENT INFORMATION', 80, yPos);
    yPos += 40;
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Name: ${quoteData.contactName}`, 100, yPos);
    yPos += 30;
    ctx.fillText(`Email: ${quoteData.contactEmail}`, 100, yPos);
    yPos += 30;
    ctx.fillText(`Institution: ${institutionName}`, 100, yPos);
    yPos += 60;
    
    // Service details
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('📊 SERVICE DETAILS', 80, yPos);
    yPos += 40;
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Analysis Type: ${analysisTypeLabel}`, 100, yPos);
    yPos += 30;
    ctx.fillText(`Number of Students: ${quoteData.studentCount}`, 100, yPos);
    yPos += 30;
    
    // Handle long format list
    const maxLineLength = 80;
    const formatLines = wrapText(ctx, `Report Formats: ${formatsList}`, maxLineLength);
    formatLines.forEach(line => {
        ctx.fillText(line, 100, yPos);
        yPos += 30;
    });
    yPos += 30;
    
    // Pricing breakdown
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('💰 PRICING BREAKDOWN', 80, yPos);
    yPos += 40;
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Per Student Rate: ₹${quoteData.perStudentRate}`, 100, yPos);
    yPos += 30;
    ctx.fillText(`Base Cost (${quoteData.studentCount} students): ₹${quoteData.studentCost}`, 100, yPos);
    yPos += 30;
    ctx.fillText(`Format Fees: ₹${quoteData.formatFee}`, 100, yPos);
    yPos += 40;
    
    // Total amount highlight
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(80, yPos - 30, width - 160, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`TOTAL AMOUNT: ₹${quoteData.total}`, 100, yPos);
    yPos += 80;
    
    // Future-ready features
    if (quoteData.reportFormat.includes('rv_tracking') || quoteData.reportFormat.includes('smart_monitoring')) {
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('🔮 FUTURE-READY FEATURES', 80, yPos);
        yPos += 40;
        
        ctx.font = '18px Arial';
        ctx.fillStyle = '#ffffff';
        
        if (quoteData.reportFormat.includes('rv_tracking')) {
            ctx.fillText('✅ RV Results Auto-Update - Automatic monitoring', 100, yPos);
            yPos += 25;
        }
        
        if (quoteData.reportFormat.includes('smart_monitoring')) {
            ctx.fillText('✅ Smart AI Monitoring - Lifetime result tracking', 100, yPos);
            yPos += 25;
        }
        yPos += 30;
    }
    
    // Contact info
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('📍 CONTACT', 80, yPos);
    yPos += 40;
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Location: CSE Department, Final Year Block', 100, yPos);
    yPos += 25;
    ctx.fillText('Room No. 103, Section C', 100, yPos);
    yPos += 25;
    ctx.fillText('Ask for: "Tanishq" (SRAC Analysis Service)', 100, yPos);
    yPos += 50;
    
    // Footer note
    ctx.font = 'italic 16px Arial';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText('This is a price estimation, not a final invoice.', width/2, height - 60);
    ctx.fillText('For official quotation and service booking, please contact directly.', width/2, height - 30);
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth * 10) { // Approximate character limit
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function showImageQuoteResult(canvas, quoteData) {
    const imageDataUrl = canvas.toDataURL('image/png', 1.0);
    
    const resultHTML = `
        <div class="image-quote-popup" id="imageQuotePopup">
            <div class="image-quote-content">
                <div class="image-quote-header">
                    <h3><i class="fas fa-image"></i> Your Professional Quote Image</h3>
                    <button class="quote-popup-close" onclick="closeImageQuote()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="image-quote-body">
                    <div class="image-preview">
                        <img src="${imageDataUrl}" alt="SRAC Quote" class="quote-image-preview">
                    </div>
                    <div class="image-actions">
                        <button class="btn-download-image" onclick="downloadQuoteImage('${imageDataUrl}', '${quoteData.quoteId}')">
                            <i class="fas fa-download"></i> Download Image
                        </button>
                        <button class="btn-share-whatsapp" onclick="shareViaWhatsApp('${imageDataUrl}')">
                            <i class="fab fa-whatsapp"></i> Share via WhatsApp
                        </button>
                        <button class="btn-copy-image" onclick="copyImageToClipboard('${imageDataUrl}')">
                            <i class="fas fa-copy"></i> Copy to Clipboard
                        </button>
                    </div>
                    <div class="sharing-tips">
                        <h4><i class="fas fa-lightbulb"></i> Sharing Tips:</h4>
                        <ul>
                            <li>Download the image and attach it to your email or message</li>
                            <li>Share directly via WhatsApp for instant communication</li>
                            <li>Copy to clipboard for quick pasting in other applications</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', resultHTML);
}

function downloadQuoteImage(imageDataUrl, quoteId) {
    const link = document.createElement('a');
    link.download = `SRAC_Quote_${quoteId}.png`;
    link.href = imageDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    showNotification('Quote image downloaded successfully!', 'success');
}

function shareViaWhatsApp(imageDataUrl) {
    // Convert to blob and create a file
    fetch(imageDataUrl)
        .then(res => res.blob())
        .then(blob => {
            if (navigator.share) {
                navigator.share({
                    title: 'SRAC Analysis Service Quote',
                    text: 'Here is my SRAC analysis service quote',
                    files: [new File([blob], 'srac_quote.png', { type: 'image/png' })]
                });
            } else {
                // Fallback - open WhatsApp web with text
                const message = encodeURIComponent('Here is my SRAC analysis service quote. Please check the attached image.');
                window.open(`https://wa.me/?text=${message}`, '_blank');
                showNotification('Please attach the downloaded image to your WhatsApp message', 'info');
            }
        });
}

function copyImageToClipboard(imageDataUrl) {
    fetch(imageDataUrl)
        .then(res => res.blob())
        .then(blob => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
                showNotification('Quote image copied to clipboard!', 'success');
            }).catch(() => {
                showNotification('Could not copy image. Please download and share manually.', 'warning');
            });
        })
        .catch(() => {
            showNotification('Could not copy image. Please download and share manually.', 'warning');
        });
}

function generateTextQuoteFormat(quoteData) {
    // Generate the traditional text format
    const formatsList = Array.isArray(quoteData.reportFormat) ? 
        quoteData.reportFormat.map(f => {
            const formatNames = {
                'excel': 'Excel Analysis Report - Free', 
                'combined': 'Combined PDF (All Students) - Free',
                'subject': 'Subject-Specific Analysis - Free',
                'word': 'Word Document Format - Free',
                'presentation': 'Graph-compatible Excel (Upload Excel in web UI to generate detailed graphs) (+₹20)',
                'rv_tracking': 'RV Results Auto-Update Service (+₹50)',
                'smart_monitoring': 'Smart Result Monitoring (AI-Powered) (+₹75)'
            };
            return formatNames[f] || f;
        }).join(', ') : 'Excel Analysis Report';

    const institutionName = quoteData.institution === 'acs' ? 'ACS College' : 
                           quoteData.institution === 'rrc' ? 'RRC Institute' : 'Unknown';

    const analysisTypeLabel = quoteData.analysisType === 'normal' ? 'Normal Analysis' : 
                             quoteData.analysisType === 'express' ? 'Express Analysis' : 'Analysis';

    const quoteSummary = `╔══════════════════════════════════════════════════════════════╗
║                    SRAC ANALYSIS SERVICE                     ║
║                   PRICE ESTIMATION QUOTE                     ║
╚══════════════════════════════════════════════════════════════╝

📋 QUOTE DETAILS:
   Quote ID: ${quoteData.quoteId}
   Generated: ${quoteData.generatedDate}
   Valid Until: ${quoteData.validUntil}

👤 CLIENT INFORMATION:
   Name: ${quoteData.contactName}
   Email: ${quoteData.contactEmail}
   Institution: ${institutionName}

📊 SERVICE DETAILS:
   Analysis Type: ${analysisTypeLabel}
   Number of Students: ${quoteData.studentCount}
   Report Formats: ${formatsList}

💰 PRICING BREAKDOWN:
   Per Student Rate: ₹${quoteData.perStudentRate}
   Base Cost (${quoteData.studentCount} students): ₹${quoteData.studentCost}
   Format Fees: ₹${quoteData.formatFee}
   ────────────────────────────────────
   TOTAL AMOUNT: ₹${quoteData.total}

⏰ DELIVERY: ${quoteData.deliveryTime}

🔮 FUTURE-READY FEATURES:
   ${quoteData.reportFormat.includes('rv_tracking') ? '✅ RV Results Auto-Update - Automatic monitoring for revaluation results' : '❌ RV Results Auto-Update - Not selected'}
   ${quoteData.reportFormat.includes('smart_monitoring') ? '✅ Smart AI Monitoring - Lifetime result tracking with AI-powered updates' : '❌ Smart AI Monitoring - Not selected'}
   
   💡 Premium Features Benefit: Never worry about result updates again! 
   Our AI system continuously monitors university portals and automatically 
   recalculates your analysis when RV or supplementary results are announced.

📋 IMPORTANT POLICIES:
   • Payment required in advance before work begins
   • Data must be in correct SRAC format
   • Each analysis run counts as new request
   • Reports delivered via email as PDF attachments
   • Available only for ACS College and RRC Institute

⚠️  SECTION LIMITATION:
   This quote is valid for ONE SECTION ONLY. Multiple sections 
   require separate quotes and payments. Each section will have 
   its own individual report output.

📍 CONTACT:
   Location: CSE Department, Final Year Block
   Room No. 103, Section C
   Ask for: "Tanishq" (SRAC Analysis Service)

═══════════════════════════════════════════════════════════════
NOTE: This is a price estimation, not a final invoice.
For official quotation and service booking, please contact directly.
═══════════════════════════════════════════════════════════════`;

    // Show text quote popup
    showQuotePopup(quoteSummary, quoteData);
}

function generateBothQuoteFormats(quoteData) {
    // Generate both formats
    generateTextQuoteFormat(quoteData);
    
    // Also create the image after a small delay
    setTimeout(() => {
        createQuoteImage(quoteData);
    }, 500);
    
    showNotification('Generated both text and image formats for you!', 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Global close functions
window.closeQuoteOptions = function() {
    const popup = document.getElementById('quoteOptionsPopup');
    if (popup) popup.remove();
};

window.closeImageQuote = function() {
    const popup = document.getElementById('imageQuotePopup');
    if (popup) popup.remove();
};

    const quoteSummary = `╔══════════════════════════════════════════════════════════════╗
║                    SRAC ANALYSIS SERVICE                     ║
║                   PRICE ESTIMATION QUOTE                     ║
╚══════════════════════════════════════════════════════════════╝

📋 QUOTE DETAILS:
   Quote ID: ${quoteData.quoteId}
   Generated: ${quoteData.generatedDate}
   Valid Until: ${quoteData.validUntil}

👤 CLIENT INFORMATION:
   Name: ${quoteData.contactName}
   Email: ${quoteData.contactEmail}
   Institution: ${institutionName}

📊 SERVICE DETAILS:
   Analysis Type: ${analysisTypeLabel}
   Number of Students: ${quoteData.studentCount}
   Report Formats: ${formatsList}

💰 PRICING BREAKDOWN:
   Per Student Rate: ₹${quoteData.perStudentRate}
   Base Cost (${quoteData.studentCount} students): ₹${quoteData.studentCost}
   Format Fees: ₹${quoteData.formatFee}
   ────────────────────────────────────
   TOTAL AMOUNT: ₹${quoteData.total}

⏰ DELIVERY: ${quoteData.deliveryTime}

🔮 FUTURE-READY FEATURES:
   ${quoteData.reportFormat.includes('rv_tracking') ? '✅ RV Results Auto-Update - Automatic monitoring for revaluation results' : '❌ RV Results Auto-Update - Not selected'}
   ${quoteData.reportFormat.includes('smart_monitoring') ? '✅ Smart AI Monitoring - Lifetime result tracking with AI-powered updates' : '❌ Smart AI Monitoring - Not selected'}
   
   💡 Premium Features Benefit: Never worry about result updates again! 
   Our AI system continuously monitors university portals and automatically 
   recalculates your analysis when RV or supplementary results are announced.

📋 IMPORTANT POLICIES:
   • Payment required in advance before work begins
   • Data must be in correct SRAC format
   • Each analysis run counts as new request
   • Reports delivered via email as PDF attachments
   • Available only for ACS College and RRC Institute

⚠️  SECTION LIMITATION:
   This quote is valid for ONE SECTION ONLY. Multiple sections 
   require separate quotes and payments. Each section will have 
   its own individual report output.

📍 CONTACT:
   Location: CSE Department, Final Year Block
   Room No. 103, Section C
   Ask for: "Tanishq" (SRAC Analysis Service)

═══════════════════════════════════════════════════════════════
NOTE: This is a price estimation, not a final invoice.
For official quotation and service booking, please contact directly.
═══════════════════════════════════════════════════════════════`;

    // Show popup instead of downloading
    showQuotePopup(quoteSummary, quoteData);


function showQuotePopup(quoteSummary, quoteData) {
    // Create the popup HTML
    const popupHTML = `
        <div class="quote-popup" id="quotePopup">
            <div class="quote-popup-content">
                <div class="quote-popup-header">
                    <h3><i class="fas fa-receipt"></i> Your SRAC Analysis Quote</h3>
                    <button class="quote-popup-close" onclick="closeQuotePopup()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div>
                    <p style="color: #9ca3af; margin-bottom: 1rem;">
                        Copy the text below and paste it when contacting us for service booking:
                    </p>
                    <textarea class="quote-text-area" id="quoteTextArea" readonly>${quoteSummary}</textarea>
                    <div class="quote-actions">
                        <button class="btn-copy-quote" onclick="copyQuoteText()">
                            <i class="fas fa-copy"></i> Copy Quote Text
                        </button>
                        <button class="btn-copy-quote" onclick="closeQuotePopup()" style="background: #dc3545;">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Add event listener for escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeQuotePopup();
        }
    });
    
    // Add click outside to close
    document.getElementById('quotePopup').addEventListener('click', function(e) {
        if (e.target === this) {
            closeQuotePopup();
        }
    });
}

// Global functions for popup actions
window.closeQuotePopup = function() {
    const popup = document.getElementById('quotePopup');
    if (popup) {
        popup.remove();
    }
};

window.copyQuoteText = function() {
    const textArea = document.getElementById('quoteTextArea');
    if (textArea) {
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            document.execCommand('copy');
            
            // Show success feedback
            const copyBtn = document.querySelector('.btn-copy-quote');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.background = '#28a745';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = 'linear-gradient(135deg, #4a90e2, #8a2be2)';
            }, 2000);
            
        } catch (err) {
            // Fallback for modern browsers
            navigator.clipboard.writeText(textArea.value).then(() => {
                alert('Quote copied to clipboard!');
            }).catch(() => {
                alert('Unable to copy. Please select and copy manually.');
            });
        }
    }
};

function createVisualQuoteCard(quoteData, quoteSummary) {
    // Create a modal or overlay with the quote information for easy copying
    const modalHTML = `
        <div id="quoteModal" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
            align-items: center; justify-content: center;
        ">
            <div style="
                background: #fff; padding: 2rem; border-radius: 15px; 
                max-width: 600px; max-height: 80vh; overflow-y: auto;
                color: #333; font-family: monospace; font-size: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            ">
                <div style="text-align: center; margin-bottom: 1rem;">
                    <h3 style="color: #0066cc; margin: 0 0 0.5rem 0;">📋 Quote Ready for Sharing</h3>
                    <button onclick="copyQuoteText()" style="
                        background: #0066cc; color: white; border: none; 
                        padding: 0.5rem 1rem; border-radius: 5px; margin-right: 0.5rem;
                        cursor: pointer;
                    ">📋 Copy Text</button>
                    <button onclick="saveAsImage()" style="
                        background: #28a745; color: white; border: none; 
                        padding: 0.5rem 1rem; border-radius: 5px; margin-right: 0.5rem;
                        cursor: pointer;
                    ">🖼️ Save as Image</button>
                    <button onclick="closeQuoteModal()" style="
                        background: #dc3545; color: white; border: none; 
                        padding: 0.5rem 1rem; border-radius: 5px;
                        cursor: pointer;
                    ">❌ Close</button>
                </div>
                <pre id="quoteText" style="
                    background: #f8f9fa; padding: 1rem; border-radius: 8px; 
                    white-space: pre-wrap; word-wrap: break-word; margin: 0;
                    border: 1px solid #e9ecef; font-size: 11px; line-height: 1.4;
                ">${quoteSummary}</pre>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add functions to window for button access
    window.copyQuoteText = function() {
        const textArea = document.createElement('textarea');
        textArea.value = quoteSummary;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Quote text copied to clipboard!');
    };
    
    window.saveAsImage = function() {
        // Convert the quote text to canvas and download as image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 1000;
        
        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set text properties
        ctx.fillStyle = '#333333';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        
        // Split text into lines and draw
        const lines = quoteSummary.split('\n');
        let y = 30;
        lines.forEach(line => {
            if (y < canvas.height - 20) {
                ctx.fillText(line, 20, y);
                y += 15;
            }
        });
        
        // Download as image
        const link = document.createElement('a');
        link.download = `SRAC_Quote_${quoteData.quoteId}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        alert('Quote saved as image!');
    };
    
    window.closeQuoteModal = function() {
        const modal = document.getElementById('quoteModal');
        if (modal) modal.remove();
    };
}

function getAnalysisTypeLabel(type) {
    const labels = {
        'normal': 'Normal Analysis (Generated instantly, delivered within 2 Days)',
        'express': 'Express Analysis (Generated instantly, delivered within 15 Minutes)',
        'format': 'Format Check Only (Deprecated)'
    };
    return labels[type] || type;
}

function requestSample() {
    // Show a modal or alert with sample screenshots
    const sampleInfo = `SRAC Analysis Report Sample:

📊 Sample Report Features:
• Student Performance Analysis
• Subject-wise Breakdown  
• Grade Predictions
• Fail Count Analysis
• Comprehensive Charts & Graphs

📋 Sample Data Format Required:
Student_Name, Roll_Number, Mathematics, Physics, Chemistry, Computer_Science, English, Semester, CGPA

🖼️ For actual sample screenshots, please contact:
📍 CSE Department, Final Year Block, Room 103, Section C
📞 Ask any faculty for "Tanishq"

💼 Professional Analysis Service with detailed insights and predictions.`;

    alert(sampleInfo);
}

const additionalCSS = `
.tier-card.selected {
    border-color: #a371f7 !important;
    box-shadow: 0 0 30px rgba(163, 113, 247, 0.4) !important;
    transform: translateY(-5px) !important;
}

.field-error {
    animation: shake 0.3s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.result-status.success {
    color: #3fb950;
}

.result-status.info {
    color: #7d8590;
}

.mobile-menu-toggle {
    display: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
    background: rgba(74, 144, 226, 0.1);
    color: #4a90e2;
}

.sample-links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
}

.sample-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #4a90e2;
    text-decoration: none;
    padding: 0.5rem 1rem;
    background: rgba(74, 144, 226, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(74, 144, 226, 0.3);
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.sample-link:hover {
    background: rgba(74, 144, 226, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
}

.sample-data-preview {
    background: rgba(74, 144, 226, 0.1);
    border: 1px solid rgba(74, 144, 226, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 0.5rem;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    color: #e6e6e6;
}

.quote-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(10px);
}

.quote-popup-content {
    background: rgba(6, 17, 34, 0.95);
    border: 1px solid rgba(74, 144, 226, 0.3);
    border-radius: 16px;
    padding: 2rem;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    backdrop-filter: blur(20px);
}

.quote-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(74, 144, 226, 0.2);
}

.quote-popup-close {
    background: none;
    border: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.quote-popup-close:hover {
    background: rgba(255, 0, 0, 0.2);
    color: #ff4444;
}

.quote-text-area {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(74, 144, 226, 0.3);
    border-radius: 8px;
    padding: 1rem;
    color: #fff;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    width: 100%;
    min-height: 300px;
    resize: vertical;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.quote-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
}

.btn-copy-quote {
    background: linear-gradient(135deg, #4a90e2, #8a2be2);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-copy-quote:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(74, 144, 226, 0.3);
}

@media (max-width: 1024px) {
    .mobile-menu-toggle {
        display: block;
    }
    
    .nav-menu-cosmic {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(0, 6, 17, 0.95);
        backdrop-filter: blur(20px);
        flex-direction: column;
        padding: 2rem;
        border-top: 1px solid rgba(74, 144, 226, 0.3);
    }
    
    .nav-menu-cosmic.active {
        display: flex;
    }
}

@media (max-width: 768px) {
    .quote-popup-content {
        padding: 1.5rem;
        margin: 1rem;
    }
    
    .quote-text-area {
        font-size: 0.8rem;
        min-height: 250px;
    }
    
    .quote-actions {
        flex-direction: column;
    }
    
    .btn-copy-quote {
        width: 100%;
        justify-content: center;
    }
    
    .sample-links {
        gap: 0.5rem;
    }
    
    .sample-link {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
    }
}
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu-cosmic');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link-cosmic');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.querySelector('i').className = 'fas fa-bars';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.querySelector('i').className = 'fas fa-bars';
            }
        });
    }
}

function initFormatDropdown() {
    const dropdownToggle = document.getElementById('formatDropdownToggle');
    const dropdownContent = document.getElementById('formatDropdownContent');
    const dropdownText = dropdownToggle.querySelector('.dropdown-text');
    
    if (!dropdownToggle || !dropdownContent) return;
    
    // Make dropdown toggle focusable and keyboard accessible
    dropdownToggle.setAttribute('tabindex', '0');
    
    // Toggle dropdown visibility
    function toggleDropdown(e) {
        e.preventDefault();
        e.stopPropagation();
        const isActive = dropdownContent.classList.contains('active');
        dropdownContent.classList.toggle('active');
        dropdownToggle.classList.toggle('active');
        dropdownToggle.setAttribute('aria-expanded', !isActive);
        
        // Add special effects when opening
        if (!isActive) {
            dropdownContent.style.transform = 'translateY(-10px)';
            dropdownContent.style.opacity = '0';
            
            setTimeout(() => {
                dropdownContent.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                dropdownContent.style.transform = 'translateY(0)';
                dropdownContent.style.opacity = '1';
            }, 10);
        }
    }
    
    dropdownToggle.addEventListener('click', toggleDropdown);
    
    // Handle keyboard events
    dropdownToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            toggleDropdown(e);
        } else if (e.key === 'Escape') {
            dropdownContent.classList.remove('active');
            dropdownToggle.classList.remove('active');
            dropdownToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Enhanced premium feature interactions
    const premiumFeatures = document.querySelectorAll('.premium-feature');
    premiumFeatures.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            // Add sparkle effect
            createSparkleEffect(this);
        });
        
        feature.addEventListener('click', function() {
            // Add click ripple effect
            createRippleEffect(this, event);
        });
    });
    
    function createSparkleEffect(element) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-effect';
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #ffd700;
            border-radius: 50%;
            pointer-events: none;
            animation: sparkleAnim 1s ease-out forwards;
        `;
        
        for (let i = 0; i < 5; i++) {
            const clone = sparkle.cloneNode();
            clone.style.left = Math.random() * 100 + '%';
            clone.style.top = Math.random() * 100 + '%';
            clone.style.animationDelay = Math.random() * 0.5 + 's';
            element.appendChild(clone);
            
            setTimeout(() => clone.remove(), 1000);
        }
    }
    
    function createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(138, 43, 226, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleAnim 0.6s ease-out;
            pointer-events: none;
        `;
        
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownToggle.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove('active');
            dropdownToggle.classList.remove('active');
            dropdownToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Update dropdown text based on selected checkboxes
    function updateDropdownText() {
        const checkedBoxes = dropdownContent.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) {
            dropdownText.textContent = 'Click to select formats';
        } else if (checkedBoxes.length === 1) {
            const labelText = checkedBoxes[0].nextElementSibling.textContent;
            dropdownText.textContent = labelText.length > 30 ? labelText.substring(0, 30) + '...' : labelText;
        } else {
            dropdownText.textContent = `${checkedBoxes.length} formats selected`;
        }
    }
    
    // Add event listeners to checkboxes
    const checkboxes = dropdownContent.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation();
            updateDropdownText();
            if (typeof calculatePricing === 'function') {
                calculatePricing(); // Trigger price recalculation
            }
        });
    });
    
    // Initialize dropdown text
    updateDropdownText();
}

// Download functionality
function downloadSRAC() {
    window.open('https://github.com/SRAC-Suite/SRAC/releases/download/v1.0.0/SRAC.exe', '_blank');
}

// Add download button event listeners
document.addEventListener('DOMContentLoaded', function() {
    const downloadButtons = document.querySelectorAll('.btn-download, .btn-download-stellar, .btn-download-cosmic, .btn-download-modern');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            downloadSRAC();
        });
    });
});
