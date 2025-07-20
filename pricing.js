document.addEventListener('DOMContentLoaded', function() {
    initStarfieldCanvas();
    initPricingCalculator();
    initFormValidation();
    initTierSelection();
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

    // Determine pricing based on analysis type and student count
    switch (data.analysisType) {
        case 'normal':
            if (data.studentCount < 20) {
                // Less than 20 students: Show as minimum 20 pricing but display actual student count
                total = 180; // Minimum total for 20 students
                perStudentRate = total / Math.max(data.studentCount, 1); // Avoid division by zero
            } else if (data.studentCount >= 20 && data.studentCount <= 40) {
                // For 20-40 students: Total ranges from ₹180 to ₹210
                const progress = (data.studentCount - 20) / (40 - 20); // 0 to 1
                total = 180 + (progress * (210 - 180)); // Linear interpolation from 180 to 210
                perStudentRate = total / data.studentCount;
            } else if (data.studentCount >= 41 && data.studentCount <= 60) {
                // For 41-60 students: Total ranges from ₹180 to ₹250
                const progress = (data.studentCount - 40) / (60 - 40); // 0 to 1
                total = 180 + (progress * (250 - 180)); // Linear interpolation from 180 to 250
                perStudentRate = total / data.studentCount;
            } else {
                // For 60+ students: Capped at ₹250
                total = 250;
                perStudentRate = total / data.studentCount;
            }
            deliveryTime = 'Generated instantly, deliberately delivered after 2 Days';
            break;

        case 'express':
            // Express pricing: Fixed ₹750 regardless of student count (premium service)
            total = 750;
            perStudentRate = total / Math.max(data.studentCount, 1); // Avoid division by zero
            deliveryTime = 'Generated instantly, delivered within 15 Minutes (Ultra Priority)';
            break;
            
        default:
            // Default to normal pricing calculation for 20 students
            total = 180;
            perStudentRate = total / Math.max(data.studentCount, 1);
            deliveryTime = 'Please select analysis type';
    }

    // Calculate format fees - only for paid formats
    let formatFee = 0;
    data.reportFormat.forEach(format => {
        switch (format) {
            case 'detailed':
                formatFee += 10;
                break;
            case 'presentation':
                formatFee += 30;
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
        perStudentRate: Math.ceil(perStudentRate * 10) / 10, // Round to 1 decimal place using ceiling
        studentCount: data.studentCount,
        studentCost: Math.ceil(total * 10) / 10, // Round to 1 decimal place using ceiling
        formatFee: Math.ceil(formatFee * 10) / 10, // Round format fee too
        total: Math.ceil(finalTotal * 10) / 10, // Round final total using ceiling
        deliveryTime
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
    
    // Handle multiple report formats in status
    let formatInfo = '';
    if (Array.isArray(formData.reportFormat)) {
        const formatCount = formData.reportFormat.length;
        formatInfo = formatCount > 1 ? ` (${formatCount} formats selected)` : '';
    }
    
    const statusText = formData.contactName ? 
        `Quote for ${formData.contactName} - ${analysisTypeLabel} for ${formData.studentCount} students${formatInfo}` :
        `${analysisTypeLabel} calculated for ${formData.studentCount} students${formatInfo}`;
    showStatus(statusText, 'success');
}

function toggleFeeItem(itemId, show) {
    const item = document.getElementById(itemId);
    if (item) {
        item.style.display = show ? 'flex' : 'none';
    }
}

function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('resultStatus');
    statusElement.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
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
        const firstCheckbox = document.getElementById('format_digital');
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
    // Create a detailed text summary
    const formatsList = Array.isArray(quoteData.reportFormat) ? 
        quoteData.reportFormat.map(f => {
            const formatNames = {
                'excel': 'Excel Analysis Report - Free', 
                'combined': 'Combined PDF (All Students) - Free',
                'subject': 'Subject-Specific Analysis - Free',
                'word': 'Word Document Format - Free',
                'detailed': 'Detailed Report (+₹10)',
                'presentation': 'Graph-compatible Excel (Upload Excel in web UI to generate detailed graphs ...) (+₹30)'
            };
            return formatNames[f] || f;
        }).join(', ') : 'Excel Analysis Report';

    const institutionName = quoteData.institution === 'acs' ? 'ACS College' : 
                           quoteData.institution === 'rrc' ? 'RRC Institute' : 'Unknown';

    const analysisTypeLabel = quoteData.analysisType === 'normal' ? 'Normal Analysis' : 
                             quoteData.analysisType === 'express' ? 'Express Analysis' : 'Analysis';

    const quoteSummary = `
╔══════════════════════════════════════════════════════════════╗
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

⏰ DELIVERY:
   ${quoteData.deliveryTime}

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
═══════════════════════════════════════════════════════════════
    `.trim();

    // Create a text file and download it
    const blob = new Blob([quoteSummary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SRAC_Quote_${quoteData.quoteId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Also create a visual quote card for copying/sharing
    createVisualQuoteCard(quoteData, quoteSummary);
    
    alert(`Quote ${quoteData.quoteId} generated successfully!\nText file downloaded. Check below for visual quote card.`);
}

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
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
