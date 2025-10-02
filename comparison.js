document.addEventListener('DOMContentLoaded', function () { initStarfieldCanvas(); initConstellationAnimation(); initTableInteractions(); initCosmicEffects(); initMobileNavigation(); initScrollAnimations(); console.log('SRAC Comparison: Cosmic environment with Mahavishnu constellation activated'); }); function initStarfieldCanvas() {
    const canvas = document.getElementById('starfield-canvas'); const ctx = canvas.getContext('2d'); let animationFrame; let time = 0; const stars = []; const shootingStars = []; const mahavishnutStars = []; let constellationFormed = false;
    let mahavishnu_arms_animation_started = false;
    let arm_animation_time = 0; const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    function resizeCanvas() { 
        // Mobile responsive canvas sizing
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        if (isSmallMobile) {
            canvas.width = Math.min(window.innerWidth, 360);
            canvas.height = Math.min(window.innerHeight, 640);
        } else if (isMobile) {
            canvas.width = Math.min(window.innerWidth, 768);
            canvas.height = Math.min(window.innerHeight, 1024);
        } else {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        // Prevent overflow on mobile
        canvas.style.maxWidth = '100vw';
        canvas.style.maxHeight = '100vh';
        canvas.style.overflow = 'hidden';
        
        createStarField(); 
        
        // Recreate constellation with mobile scaling
        if (constellationFormed) {
            createMahavishnuConstellation();
        }
    } function createStarField() { stars.length = 0; for (let i = 0; i < 200; i++) { stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.8 + 0.2, twinkleSpeed: Math.random() * 0.02 + 0.005, color: `hsl(${Math.random() > 0.8 ? 45 : 60},${Math.random() * 30 + 70}%,${Math.random() * 30 + 70}%)`, velocity: { x: (Math.random() - 0.5) * 0.2, y: (Math.random() - 0.5) * 0.2 } }) } }
    function createMahavishnuConstellation() {
        const centerX = canvas.width / 2; 
        const centerY = canvas.height / 2; 
        mahavishnutStars.length = 0; 
        
        // Enhanced mobile responsive scaling with better positioning
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        let scale = 0.6;
        let offsetY = 0; // Add vertical offset for mobile
        
        if (isSmallMobile) {
            scale = 0.25; // Much smaller for small mobile
            offsetY = -50; // Move up to center better
        } else if (isMobile) {
            scale = 0.35; // Smaller for tablets
            offsetY = -30; // Slight upward adjustment
        }
        
        constellationPoints = [
            // Mahavishnu's Divine Form
            { x: 0, y: -140, size: 5, name: 'divine_crown', color: '#FFD700', brightness: 1.5 },
            { x: -12, y: -125, size: 3, name: 'crown_jewel_left', color: '#87CEEB', brightness: 1.2 },
            { x: 12, y: -125, size: 3, name: 'crown_jewel_right', color: '#87CEEB', brightness: 1.2 },
            { x: 0, y: -115, size: 4, name: 'third_eye', color: '#FF6B47', brightness: 1.8 },
            { x: -8, y: -105, size: 2.5, name: 'forehead_left', color: '#FFD700', brightness: 1 },
            { x: 8, y: -105, size: 2.5, name: 'forehead_right', color: '#FFD700', brightness: 1 },
            { x: -15, y: -95, size: 3, name: 'eye_left', color: '#4169E1', brightness: 1.3 },
            { x: 15, y: -95, size: 3, name: 'eye_right', color: '#4169E1', brightness: 1.3 },
            { x: 0, y: -88, size: 2, name: 'nose_bridge', color: '#FFD700', brightness: 1 },
            { x: 0, y: -80, size: 2.5, name: 'divine_mouth', color: '#FF69B4', brightness: 1.1 },
            { x: -22, y: -100, size: 2, name: 'ear_left', color: '#FFD700', brightness: 1 },
            { x: 22, y: -100, size: 2, name: 'ear_right', color: '#FFD700', brightness: 1 },
            { x: 0, y: -70, size: 3, name: 'blessed_neck', color: '#FFD700', brightness: 1 },
            { x: -30, y: -50, size: 4, name: 'shoulder_left', color: '#FFD700', brightness: 1 },
            { x: 30, y: -50, size: 4, name: 'shoulder_right', color: '#FFD700', brightness: 1 },
            { x: 0, y: -35, size: 6, name: 'sacred_heart', color: '#00FF7F', brightness: 2 },

            // Four Divine Arms with Sacred Items
            { x: -70, y: -40, size: 3.5, name: 'arm1_shoulder_left', color: '#FFD700', brightness: 1 },
            { x: -85, y: -25, size: 3, name: 'arm1_upper_left', color: '#FFD700', brightness: 1 },
            { x: -95, y: -5, size: 3, name: 'arm1_elbow_left', color: '#FFD700', brightness: 1 },
            { x: -90, y: 15, size: 2.5, name: 'arm1_forearm_left', color: '#FFD700', brightness: 1 },
            { x: -80, y: 35, size: 3.5, name: 'hand1_left', color: '#FFD700', brightness: 1 },
            { x: -75, y: 45, size: 3, name: 'conch_shell', color: '#FFF8DC', brightness: 1.4 },

            { x: 70, y: -40, size: 3.5, name: 'arm1_shoulder_right', color: '#FFD700', brightness: 1 },
            { x: 85, y: -25, size: 3, name: 'arm1_upper_right', color: '#FFD700', brightness: 1 },
            { x: 95, y: -5, size: 3, name: 'arm1_elbow_right', color: '#FFD700', brightness: 1 },
            { x: 90, y: 15, size: 2.5, name: 'arm1_forearm_right', color: '#FFD700', brightness: 1 },
            { x: 80, y: 35, size: 3.5, name: 'hand1_right', color: '#FFD700', brightness: 1 },
            { x: 85, y: 45, size: 4, name: 'sudarshan_chakra', color: '#FFD700', brightness: 2 },

            // Back arms (behind body) - will raise radially outward to upward
            { x: -35, y: -30, size: 3, name: 'arm2_shoulder_left', color: '#FFD700', brightness: 0.8 },
            { x: -45, y: -15, size: 2.5, name: 'arm2_upper_left', color: '#FFD700', brightness: 0.8 },
            { x: -50, y: 5, size: 2.5, name: 'arm2_forearm_left', color: '#FFD700', brightness: 0.8 },
            { x: -45, y: 25, size: 3, name: 'hand2_left', color: '#FFD700', brightness: 0.8 },
            { x: -50, y: 35, size: 3.5, name: 'divine_gada', color: '#8B4513', brightness: 1.3 },

            { x: 35, y: -30, size: 3, name: 'arm2_shoulder_right', color: '#FFD700', brightness: 0.8 },
            { x: 45, y: -15, size: 2.5, name: 'arm2_upper_right', color: '#FFD700', brightness: 0.8 },
            { x: 50, y: 5, size: 2.5, name: 'arm2_forearm_right', color: '#FFD700', brightness: 0.8 },
            { x: 45, y: 25, size: 3, name: 'hand2_right', color: '#FFD700', brightness: 0.8 },
            { x: 55, y: 30, size: 3.5, name: 'divine_khadga', color: '#C0C0C0', brightness: 1.3 }, // Divine Sword
            { x: -73, y: 47, size: 3.5, name: 'padma_lotus', color: '#FFB6C1', brightness: 1.4 },

            // Divine Body
            { x: -20, y: -10, size: 3, name: 'chest_left', color: '#FFD700', brightness: 1 },
            { x: 20, y: -10, size: 3, name: 'chest_right', color: '#FFD700', brightness: 1 },
            { x: 0, y: 10, size: 4, name: 'navel_chakra', color: '#FFA500', brightness: 1.5 },
            { x: -15, y: 40, size: 3, name: 'waist_left', color: '#FFD700', brightness: 1 },
            { x: 15, y: 40, size: 3, name: 'waist_right', color: '#FFD700', brightness: 1 },
            { x: 0, y: 70, size: 3, name: 'divine_center', color: '#FF4500', brightness: 1.3 },
            { x: -25, y: 100, size: 4, name: 'hip_left', color: '#FFD700', brightness: 1 },
            { x: 25, y: 100, size: 4, name: 'hip_right', color: '#FFD700', brightness: 1 },
            { x: -20, y: 130, size: 3, name: 'thigh_left_upper', color: '#FFD700', brightness: 1 },
            { x: -15, y: 160, size: 2.5, name: 'thigh_left_lower', color: '#FFD700', brightness: 1 },
            { x: -10, y: 190, size: 3, name: 'knee_left', color: '#FFD700', brightness: 1 },
            { x: -5, y: 220, size: 2.5, name: 'calf_left', color: '#FFD700', brightness: 1 },
            { x: 0, y: 250, size: 3, name: 'ankle_left', color: '#FFD700', brightness: 1 },
            { x: 5, y: 275, size: 3, name: 'foot_left', color: '#FFD700', brightness: 1 },
            { x: 20, y: 130, size: 3, name: 'thigh_right_upper', color: '#FFD700', brightness: 1 },
            { x: 15, y: 160, size: 2.5, name: 'thigh_right_lower', color: '#FFD700', brightness: 1 },
            { x: 10, y: 190, size: 3, name: 'knee_right', color: '#FFD700', brightness: 1 },
            { x: 5, y: 220, size: 2.5, name: 'calf_right', color: '#FFD700', brightness: 1 },
            { x: 0, y: 250, size: 3, name: 'ankle_right', color: '#FFD700', brightness: 1 },
            { x: -5, y: 275, size: 3, name: 'foot_right', color: '#FFD700', brightness: 1 },

            // 7-HEADED SHESHA NAAG - COLORFUL STAR CONSTELLATION
            // Seven serpent heads with different colors for visibility
            { x: -200, y: -180, size: 5, name: 'serpent_head_1', color: '#FF0000', brightness: 1.2 }, // Red
            { x: -120, y: -200, size: 5, name: 'serpent_head_2', color: '#FF8C00', brightness: 1.2 }, // Orange  
            { x: -60, y: -220, size: 5, name: 'serpent_head_3', color: '#FFD700', brightness: 1.2 }, // Yellow
            { x: 0, y: -240, size: 6, name: 'serpent_head_center', color: '#00FF00', brightness: 1.5 }, // Green (center)
            { x: 60, y: -220, size: 5, name: 'serpent_head_5', color: '#00BFFF', brightness: 1.2 }, // Blue
            { x: 120, y: -200, size: 5, name: 'serpent_head_6', color: '#4B0082', brightness: 1.2 }, // Indigo
            { x: 200, y: -180, size: 5, name: 'serpent_head_7', color: '#8B00FF', brightness: 1.2 }, // Violet

            // Colored neck points for connecting heads
            { x: -190, y: -170, size: 4, name: 'serpent_neck_1', color: '#FF4500', brightness: 1 }, // Red-Orange
            { x: -110, y: -185, size: 4, name: 'serpent_neck_2', color: '#FFA500', brightness: 1 }, // Orange
            { x: -50, y: -205, size: 4, name: 'serpent_neck_3', color: '#FFFF00', brightness: 1 }, // Yellow
            { x: 0, y: -215, size: 4, name: 'serpent_neck_center', color: '#32CD32', brightness: 1 }, // Lime Green
            { x: 50, y: -205, size: 4, name: 'serpent_neck_5', color: '#1E90FF', brightness: 1 }, // Dodger Blue
            { x: 110, y: -185, size: 4, name: 'serpent_neck_6', color: '#6A5ACD', brightness: 1 }, // Slate Blue
            { x: 190, y: -170, size: 4, name: 'serpent_neck_7', color: '#9932CC', brightness: 1 }, // Dark Orchid

            // Complete Serpent Body - Star Constellation Points
            // Upper body segments connecting necks
            { x: -150, y: -150, size: 3, name: 'serpent_body_upper_1', color: '#228B22', brightness: 0.9 },
            { x: -100, y: -160, size: 3, name: 'serpent_body_upper_2', color: '#228B22', brightness: 0.9 },
            { x: -50, y: -170, size: 3, name: 'serpent_body_upper_3', color: '#228B22', brightness: 0.9 },
            { x: 0, y: -180, size: 4, name: 'serpent_body_upper_center', color: '#32CD32', brightness: 1.1 },
            { x: 50, y: -170, size: 3, name: 'serpent_body_upper_5', color: '#228B22', brightness: 0.9 },
            { x: 100, y: -160, size: 3, name: 'serpent_body_upper_6', color: '#228B22', brightness: 0.9 },
            { x: 150, y: -150, size: 3, name: 'serpent_body_upper_7', color: '#228B22', brightness: 0.9 },

            // Main body segments
            { x: -120, y: -130, size: 4, name: 'serpent_body_main_1', color: '#2F4F4F', brightness: 1 },
            { x: -80, y: -135, size: 4, name: 'serpent_body_main_2', color: '#2F4F4F', brightness: 1 },
            { x: -40, y: -140, size: 4, name: 'serpent_body_main_3', color: '#2F4F4F', brightness: 1 },
            { x: 0, y: -145, size: 5, name: 'serpent_body_main_center', color: '#008B8B', brightness: 1.2 },
            { x: 40, y: -140, size: 4, name: 'serpent_body_main_5', color: '#2F4F4F', brightness: 1 },
            { x: 80, y: -135, size: 4, name: 'serpent_body_main_6', color: '#2F4F4F', brightness: 1 },
            { x: 120, y: -130, size: 4, name: 'serpent_body_main_7', color: '#2F4F4F', brightness: 1 },

            // Lower body coils
            { x: -90, y: -110, size: 3, name: 'serpent_body_lower_1', color: '#556B2F', brightness: 0.8 },
            { x: -60, y: -115, size: 3, name: 'serpent_body_lower_2', color: '#556B2F', brightness: 0.8 },
            { x: -30, y: -120, size: 3, name: 'serpent_body_lower_3', color: '#556B2F', brightness: 0.8 },
            { x: 0, y: -125, size: 4, name: 'serpent_body_lower_center', color: '#6B8E23', brightness: 1 },
            { x: 30, y: -120, size: 3, name: 'serpent_body_lower_5', color: '#556B2F', brightness: 0.8 },
            { x: 60, y: -115, size: 3, name: 'serpent_body_lower_6', color: '#556B2F', brightness: 0.8 },
            { x: 90, y: -110, size: 3, name: 'serpent_body_lower_7', color: '#556B2F', brightness: 0.8 },

            // Serpent coils extending down (umbrella support)
            { x: -60, y: -90, size: 4, name: 'serpent_coil_left_1', color: '#228B22', brightness: 1 },
            { x: -30, y: -95, size: 4, name: 'serpent_coil_left_2', color: '#228B22', brightness: 1 },
            { x: 0, y: -100, size: 5, name: 'serpent_coil_center', color: '#32CD32', brightness: 1.2 },
            { x: 30, y: -95, size: 4, name: 'serpent_coil_right_1', color: '#228B22', brightness: 1 },
            { x: 60, y: -90, size: 4, name: 'serpent_coil_right_2', color: '#228B22', brightness: 1 },

            // Tail segments extending below
            { x: -20, y: -70, size: 3, name: 'serpent_tail_1', color: '#2F4F4F', brightness: 0.9 },
            { x: 0, y: -75, size: 3, name: 'serpent_tail_2', color: '#2F4F4F', brightness: 0.9 },
            { x: 20, y: -70, size: 3, name: 'serpent_tail_3', color: '#2F4F4F', brightness: 0.9 },
            { x: 0, y: -50, size: 3, name: 'serpent_tail_end', color: '#556B2F', brightness: 0.8 },

            // Only Essential Divine Aura (reduced brightness for performance)
            { x: -200, y: -100, size: 3, name: 'divine_aura_tl', color: '#E6E6FA', brightness: 0.6 },
            { x: 200, y: -100, size: 3, name: 'divine_aura_tr', color: '#E6E6FA', brightness: 0.6 },
            { x: -220, y: 50, size: 3, name: 'divine_aura_ml', color: '#E6E6FA', brightness: 0.6 },
            { x: 220, y: 50, size: 3, name: 'divine_aura_mr', color: '#E6E6FA', brightness: 0.6 },
            { x: -180, y: 200, size: 3, name: 'divine_aura_bl', color: '#E6E6FA', brightness: 0.6 },
            { x: 180, y: 200, size: 3, name: 'divine_aura_br', color: '#E6E6FA', brightness: 0.6 }
        ]; 
        
        constellationPoints.forEach(point => { 
            mahavishnutStars.push({ 
                x: centerX + (point.x * scale), 
                y: centerY + (point.y * scale) + offsetY, // Add mobile offset
                targetX: centerX + (point.x * scale), 
                targetY: centerY + (point.y * scale) + offsetY, // Add mobile offset
                currentX: Math.random() * canvas.width, 
                currentY: Math.random() * canvas.height, 
                size: Math.max(1, point.size * (isMobile ? 0.8 : 1)), // Scale star sizes
                opacity: 0, 
                targetOpacity: (point.brightness || 1) * 0.9, 
                color: point.color || '#FFD700', 
                name: point.name, 
                formationProgress: 0, 
                brightness: point.brightness || 1, 
                connectionLines: [] 
            }) 
        })
    } 
    function updateStarfield() {
        time += 0.016; 
        if (!constellationFormed && time > 2) { formConstellation() }

        // Start Mahavishnu's divine arm-raising animation after constellation fully forms
        if (!mahavishnu_arms_animation_started && time > 10) { // Wait longer for complete constellation
            mahavishnu_arms_animation_started = true;
            arm_animation_time = 0;
        }

        if (mahavishnu_arms_animation_started) {
            arm_animation_time += 0.015; // Slower for more dramatic effect
        }

        stars.forEach(star => { 
            star.x += star.velocity.x; 
            star.y += star.velocity.y; 
            if (star.x < 0) star.x = canvas.width; 
            if (star.x > canvas.width) star.x = 0; 
            if (star.y < 0) star.y = canvas.height; 
            if (star.y > canvas.height) star.y = 0; 
            star.opacity = 0.5 + Math.sin(time * star.twinkleSpeed) * 0.3 
        }); 
        
        if (constellationFormed) {
            mahavishnutStars.forEach((star, index) => {
                const formationDelay = getDivineFormationDelay(star.name); 
                const adjustedProgress = Math.max(0, (time - 2 - formationDelay) / 4); 
                
                if (star.formationProgress < 1) { 
                    star.formationProgress = Math.min(1, adjustedProgress); 
                    const progress = easeInOutCubic(star.formationProgress); 
                    star.currentX = star.currentX + (star.targetX - star.currentX) * progress * 0.12; 
                    star.currentY = star.currentY + (star.targetY - star.currentY) * progress * 0.12; 
                    star.opacity = star.targetOpacity * progress 
                } else {
                    if (mahavishnu_arms_animation_started && arm_animation_time > 5) {
                        star.opacity = 1;
                        star.color = '#FFD700';
                    }

                    // RESPECTFUL ARM ANIMATION SEQUENCE - Stop after 5 seconds
                    let armAnimationX = 0;
                    let armAnimationY = 0;

                    if (mahavishnu_arms_animation_started && arm_animation_time <= 5) {
                        // Animation phases: 0-3s gradual rise, 3-5s hold position respectfully
                        const flexPhase = Math.min(1, arm_animation_time / 3); // 3 seconds to rise gracefully
                        const holdPhase = arm_animation_time > 3; // Hold gracefully for remaining time
                        
                        const flexEase = easeInOutCubic(flexPhase);
                        // Gentle, respectful strength - no excessive movement
                        const gentleStrength = holdPhase ? 1 + Math.sin(arm_animation_time * 2) * 0.1 : 
                                              Math.sin(arm_animation_time * 1.5) * 0.15 + 0.85;

                        // LEFT ARM GRACEFUL ARC ANIMATION - RESPECTFUL MOVEMENT
                        if (star.name.includes('arm1_shoulder_left')) {
                            armAnimationY = -flexEase * 12;
                            armAnimationX = -flexEase * 6;
                        }
                        if (star.name.includes('arm1_upper_left')) {
                            armAnimationY = -flexEase * 28 - gentleStrength * 1;
                            armAnimationX = -flexEase * 20;
                        }
                        if (star.name.includes('arm1_elbow_left')) {
                            armAnimationY = -flexEase * 38 - (holdPhase ? 2 : 0);
                            armAnimationX = -flexEase * 28;
                        }
                        if (star.name.includes('arm1_forearm_left')) {
                            armAnimationY = -flexEase * 55 - gentleStrength * 1;
                            armAnimationX = -flexEase * 25;
                        }
                        if (star.name.includes('hand1_left')) {
                            armAnimationY = -flexEase * 68 - (holdPhase ? 1 : 0);
                            armAnimationX = -flexEase * 22;
                        }
                        if (star.name.includes('conch_shell')) {
                            // Conch held steadily with gentle divine glow
                            const conchGlow = Math.sin(time * 3) * 0.3;
                            armAnimationY = -flexEase * 72 + conchGlow;
                            armAnimationX = -flexEase * 24;
                        }

                        // RIGHT ARM GRACEFUL ARC ANIMATION (MIRROR) - RESPECTFUL MOVEMENT
                        if (star.name.includes('arm1_shoulder_right')) {
                            armAnimationY = -flexEase * 12;
                            armAnimationX = flexEase * 6;
                        }
                        if (star.name.includes('arm1_upper_right')) {
                            armAnimationY = -flexEase * 28 - gentleStrength * 1;
                            armAnimationX = flexEase * 20;
                        }
                        if (star.name.includes('arm1_elbow_right')) {
                            armAnimationY = -flexEase * 38 - (holdPhase ? 2 : 0);
                            armAnimationX = flexEase * 28;
                        }
                        if (star.name.includes('arm1_forearm_right')) {
                            armAnimationY = -flexEase * 55 - gentleStrength * 1;
                            armAnimationX = flexEase * 25;
                        }
                        if (star.name.includes('hand1_right')) {
                            armAnimationY = -flexEase * 68 - (holdPhase ? 1 : 0);
                            armAnimationX = flexEase * 22;
                        }
                        if (star.name.includes('sudarshan_chakra')) {
                            // Chakra spins gently and steadily
                            const chakraGlow = Math.sin(time * 2) * 0.4;
                            armAnimationY = -flexEase * 72 + chakraGlow;
                            armAnimationX = flexEase * 24;
                        }

                        // SECOND SET OF ARMS (BACK ARMS) - Lower Graceful Arc Formation
                        if (star.name.includes('arm2_shoulder_left')) {
                            armAnimationY = flexEase * 4;
                            armAnimationX = -flexEase * 10;
                        }
                        if (star.name.includes('arm2_upper_left')) {
                            armAnimationY = flexEase * 12 - gentleStrength * 0.5;
                            armAnimationX = -flexEase * 25;
                        }
                        if (star.name.includes('arm2_forearm_left')) {
                            armAnimationY = flexEase * 20 - gentleStrength * 0.5;
                            armAnimationX = -flexEase * 35;
                        }
                        if (star.name.includes('hand2_left')) {
                            armAnimationY = flexEase * 25;
                            armAnimationX = -flexEase * 40;
                        }
                        if (star.name.includes('divine_gada')) {
                            // Gada shows divine weight but respectful handling
                            const gadaWeight = Math.sin(time * 1.5) * 0.3;
                            armAnimationY = flexEase * 30 + gadaWeight;
                            armAnimationX = -flexEase * 43;
                        }

                        if (star.name.includes('arm2_shoulder_right')) {
                            armAnimationY = flexEase * 4;
                            armAnimationX = flexEase * 10;
                        }
                        if (star.name.includes('arm2_upper_right')) {
                            armAnimationY = flexEase * 12 - gentleStrength * 0.5;
                            armAnimationX = flexEase * 25;
                        }
                        if (star.name.includes('arm2_forearm_right')) {
                            armAnimationY = flexEase * 20 - gentleStrength * 0.5;
                            armAnimationX = flexEase * 35;
                        }
                        if (star.name.includes('hand2_right')) {
                            armAnimationY = flexEase * 25;
                            armAnimationX = flexEase * 40;
                        }
                        if (star.name.includes('divine_khadga')) {
                            // Divine sword held with warrior's precision
                            const swordGleam = Math.sin(time * 2) * 0.4;
                            armAnimationY = flexEase * 30 + swordGleam;
                            armAnimationX = flexEase * 43;
                        }

                        // ADDITIONAL WEAPONS FOR COMPLETE 4-ARM SETUP
                        if (star.name.includes('padma_lotus')) {
                            // Lotus blooming with divine energy
                            const lotusBloom = Math.sin(time * 2) * 0.4;
                            armAnimationY = -flexEase * 70 + lotusBloom;
                            armAnimationX = -flexEase * 26;
                        }
                    }

                    // Update the base star movement calculation with mobile scaling
                    const isMobile = window.innerWidth <= 768;
                    const isSmallMobile = window.innerWidth <= 480;
                    let movementScale = 1;

                    if (isSmallMobile) {
                        movementScale = 0.4; // Much smaller base movements
                    } else if (isMobile) {
                        movementScale = 0.6; // Smaller base movements
                    }

                    star.currentX = star.targetX + Math.sin(time * 0.3 + index * 0.1) * 1.2 * (star.brightness || 1) * movementScale + armAnimationX;
                    star.currentY = star.targetY + Math.cos(time * 0.25 + index * 0.1) * 0.8 * (star.brightness || 1) * movementScale + armAnimationY;
                    
                    if (mahavishnu_arms_animation_started && arm_animation_time <= 5) {
                        star.opacity = star.targetOpacity;
                    }

                    // Subtle serpent movement ONLY after arms stop (5 seconds)
                    if (star.name.includes('serpent')) {
                        const serpentActivePhase = mahavishnu_arms_animation_started && arm_animation_time > 5;
                        
                        if (serpentActivePhase) {
                            const isMobile = window.innerWidth <= 768;
                            const isSmallMobile = window.innerWidth <= 480;
                            let serpentScale = 1;
                            
                            if (isSmallMobile) {
                                serpentScale = 0.3;
                            } else if (isMobile) {
                                serpentScale = 0.5;
                            }
                            
                            const gentleMovement = Math.sin(time * 0.2 + index * 0.3) * 0.8 * serpentScale;
                            const protectiveSway = Math.cos(time * 0.15 + index * 0.2) * 0.6 * serpentScale;
                            
                            if (star.name.includes('serpent_head_')) {
                                const protectiveWatch = Math.sin((arm_animation_time - 5) * 0.8) * 1.2 * serpentScale;
                                const guardianPosition = Math.cos((arm_animation_time - 5) * 0.6) * 0.9 * serpentScale;
                                star.currentX += gentleMovement + protectiveWatch;
                                star.currentY += protectiveSway + guardianPosition;
                            } else {
                                star.currentX += gentleMovement * 0.5;
                                star.currentY += protectiveSway * 0.5;
                            }
                        } 
                    }

                    // Enhanced weapon animations
                    if (star.name.includes('sudarshan')) {
                        const weaponActivePhase = mahavishnu_arms_animation_started && arm_animation_time <= 5;
                        const spinSpeed = weaponActivePhase ? time * 2 : time * 1;
                        
                        const isMobile = window.innerWidth <= 768;
                        const weaponScale = isMobile ? 0.5 : 1;
                        
                        const energyRadius = (weaponActivePhase ? 0.8 + Math.sin(time * 2) * 0.3 : 0.4) * weaponScale;
                        star.currentX += Math.cos(spinSpeed) * energyRadius;
                        star.currentY += Math.sin(spinSpeed) * energyRadius;
                    }

                    if (star.name.includes('padma')) {
                        const weaponActivePhase = mahavishnu_arms_animation_started && arm_animation_time <= 5;
                        
                        const isMobile = window.innerWidth <= 768;
                        const weaponScale = isMobile ? 0.5 : 1;
                        
                        const blooming = (weaponActivePhase ? Math.sin(time * 1.5) * 0.8 : Math.sin(time * 0.8) * 0.3) * weaponScale;
                        const petals = (weaponActivePhase ? Math.cos(time * 1.2) * 0.6 : Math.cos(time * 0.6) * 0.2) * weaponScale;
                        star.currentX += blooming * 0.4;
                        star.currentY += petals;
                    }

                    if (star.name.includes('divine_gada')) {
                        const weaponActivePhase = mahavishnu_arms_animation_started && arm_animation_time <= 5;
                        
                        const isMobile = window.innerWidth <= 768;
                        const weaponScale = isMobile ? 0.5 : 1;
                        
                        const weaponMovement = (weaponActivePhase ? Math.sin(time * 1.5) * 0.6 : Math.sin(time * 0.8) * 0.3) * weaponScale;
                        const divineWeight = (weaponActivePhase ? Math.cos(time * 1.2) * 0.4 : Math.cos(time * 0.7) * 0.2) * weaponScale;
                        star.currentY += weaponMovement;
                        star.currentX += divineWeight * 0.3;
                    }

                    if (star.name.includes('divine_khadga')) {
                        const weaponActivePhase = mahavishnu_arms_animation_started && arm_animation_time <= 5;
                        
                        const isMobile = window.innerWidth <= 768;
                        const weaponScale = isMobile ? 0.5 : 1;
                        
                        // Sword gleaming and precise movement
                        const swordGleam = (weaponActivePhase ? Math.sin(time * 3) * 0.5 : Math.sin(time * 1.5) * 0.2) * weaponScale;
                        const warriorPrecision = (weaponActivePhase ? Math.cos(time * 2.5) * 0.3 : Math.cos(time * 1) * 0.15) * weaponScale;
                        star.currentY += swordGleam;
                        star.currentX += warriorPrecision;
                    }

                    if (star.name.includes('conch_shell')) {
                        const weaponActivePhase = mahavishnu_arms_animation_started && arm_animation_time <= 5;
                        
                        const isMobile = window.innerWidth <= 768;
                        const weaponScale = isMobile ? 0.5 : 1;
                        
                        const soundVibration = (weaponActivePhase ? Math.sin(time * 4) * 0.4 : Math.sin(time * 2) * 0.2) * weaponScale;
                        star.currentX += soundVibration;
                    }
                }
            });
        }
        updateShootingStars();
    }
    function getDivineFormationDelay(starName) {
        if (starName.includes('supreme') || starName.includes('cosmic_ray') || starName.includes('divine_ray')) return 0;
        if (starName.includes('divine_crown') || starName.includes('crown_jewel')) return 0.2;
        if (starName.includes('third_eye') || starName.includes('forehead')) return 0.4;
        if (starName.includes('eye') || starName.includes('nose') || starName.includes('mouth') || starName.includes('ear')) return 0.6;
        if (starName.includes('blessed_neck')) return 0.8;
        if (starName.includes('shoulder')) return 1.0;
        if (starName.includes('sacred_heart')) return 1.2;
        if (starName.includes('arm1') || starName.includes('conch') || starName.includes('sudarshan')) return 1.4;
        if (starName.includes('arm2') || starName.includes('kaumodaki') || starName.includes('padma')) return 1.6;
        if (starName.includes('chest') || starName.includes('navel')) return 1.8;
        if (starName.includes('waist') || starName.includes('divine_center')) return 2.0;
        if (starName.includes('hip')) return 2.2;
        if (starName.includes('thigh') || starName.includes('knee') || starName.includes('calf') || starName.includes('ankle') || starName.includes('foot')) return 2.4;
        // 7-Headed Serpent Formation (Umbrella appears as divine protection)
        if (starName.includes('serpent_head_center')) return 2.6; // Center head appears first
        if (starName.includes('serpent_head_1') || starName.includes('serpent_head_7')) return 2.8; // Outer heads
        if (starName.includes('serpent_head_2') || starName.includes('serpent_head_6')) return 3.0;
        if (starName.includes('serpent_head_3') || starName.includes('serpent_head_5')) return 3.2;
        if (starName.includes('serpent_hood') || starName.includes('serpent_eye') || starName.includes('serpent_nostril') || starName.includes('serpent_tongue')) return 3.4;
        if (starName.includes('serpent_gem')) return 3.5;
        // Serpent neck anatomy forms after heads
        if (starName.includes('serpent_neck_center')) return 3.6; // Center neck first
        if (starName.includes('serpent_neck_')) return 3.8; // Other necks
        if (starName.includes('serpent_spine')) return 4.0; // Spine structure
        if (starName.includes('serpent_body_transition')) return 4.2; // Body transition
        if (starName.includes('serpent_body_')) return 4.4; // Main body coils
        if (starName.includes('divine_aura')) return 4.6; // Divine aura last
        return 0;
    }
    function formConstellation() {
        if (!constellationFormed) {
            createMahavishnuConstellation(); constellationFormed = true
        }
    }
    function updateShootingStars() { if (Math.random() < 0.001) { createShootingStar() } shootingStars.forEach((star, index) => { star.x += star.vx; star.y += star.vy; star.life -= 0.02; if (star.life <= 0) { shootingStars.splice(index, 1) } }) } function createShootingStar() { shootingStars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.3, vx: Math.random() * 3 + 2, vy: Math.random() * 2 + 1, life: 1, color: '#FFD700' }) } function drawStarfield() { ctx.clearRect(0, 0, canvas.width, canvas.height); stars.forEach(star => { ctx.save(); ctx.globalAlpha = star.opacity; ctx.fillStyle = star.color; ctx.shadowColor = star.color; ctx.shadowBlur = star.size * 2; ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill(); ctx.restore() }); drawShootingStars(); if (constellationFormed) { drawConstellation() } } function drawShootingStars() { shootingStars.forEach(star => { ctx.save(); ctx.globalAlpha = star.life; ctx.strokeStyle = star.color; ctx.lineWidth = 2; ctx.shadowColor = star.color; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(star.x, star.y); ctx.lineTo(star.x - star.vx * 10, star.y - star.vy * 10); ctx.stroke(); ctx.restore() }) }    function drawConstellation() {
        ctx.save(); 
        const effectsStopped = mahavishnu_arms_animation_started && arm_animation_time > 5;
        
        mahavishnutStars.forEach(star => {
            if (star.opacity > 0.1) {
                if (effectsStopped) {
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = '#FFFF00';
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(star.currentX, star.currentY, star.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const glowIntensity = star.brightness || 1; 
                    ctx.globalAlpha = star.opacity; 
                    ctx.fillStyle = star.color; 
                    ctx.shadowColor = star.color; 
                    ctx.shadowBlur = star.size * glowIntensity * 2; 
                    if (star.name.includes('sacred') || star.name.includes('divine') || star.name.includes('supreme')) { 
                        ctx.shadowBlur = star.size * glowIntensity * 4; 
                        const gradient = ctx.createRadialGradient(star.currentX, star.currentY, 0, star.currentX, star.currentY, star.size * 2); 
                        gradient.addColorStop(0, star.color); 
                        gradient.addColorStop(1, 'transparent'); 
                        ctx.fillStyle = gradient 
                    } 
                    ctx.beginPath(); 
                    ctx.arc(star.currentX, star.currentY, star.size, 0, Math.PI * 2); 
                    ctx.fill();
                }                }
                
                if (!effectsStopped) {
                    if (star.name.includes('eye')) { 
                        ctx.fillStyle = '#000033'; 
                        ctx.globalAlpha = star.opacity * 0.6; 
                        ctx.beginPath(); 
                        ctx.arc(star.currentX, star.currentY, star.size * 0.4, 0, Math.PI * 2); 
                        ctx.fill(); 
                        ctx.fillStyle = '#FFFFFF'; 
                        ctx.globalAlpha = star.opacity * 0.8; 
                        ctx.beginPath(); 
                        ctx.arc(star.currentX - star.size * 0.2, star.currentY - star.size * 0.2, star.size * 0.15, 0, Math.PI * 2); 
                        ctx.fill() 
                    } 
                    if (star.name === 'third_eye') { 
                        ctx.strokeStyle = '#FF6B47'; 
                        ctx.lineWidth = 2; 
                        ctx.globalAlpha = star.opacity; 
                        ctx.beginPath(); 
                        ctx.moveTo(star.currentX - star.size * 1.2, star.currentY); 
                        ctx.lineTo(star.currentX + star.size * 1.2, star.currentY); 
                        ctx.stroke(); 
                        ctx.beginPath(); 
                        ctx.moveTo(star.currentX, star.currentY - star.size * 1.2); 
                        ctx.lineTo(star.currentX, star.currentY + star.size * 1.2); 
                        ctx.stroke(); 
                        const eyeGradient = ctx.createRadialGradient(star.currentX, star.currentY, 0, star.currentX, star.currentY, star.size * 2); 
                        eyeGradient.addColorStop(0, '#FF6B47'); 
                        eyeGradient.addColorStop(1, 'transparent'); 
                        ctx.fillStyle = eyeGradient; 
                        ctx.globalAlpha = star.opacity * 0.7; 
                        ctx.beginPath();
                        ctx.arc(star.currentX, star.currentY, star.size * 1.5, 0, Math.PI * 2); 
                        ctx.fill(); 
                    }
                    
                    if (star.name === 'sudarshan_chakra') {
                        const armsStoppedPhase = mahavishnu_arms_animation_started && arm_animation_time > 5;
                        const animationPhase = mahavishnu_arms_animation_started && arm_animation_time <= 5;
                        
                        ctx.strokeStyle = '#FFD700';
                        ctx.lineWidth = armsStoppedPhase ? 6 : animationPhase ? 4 : 3;
                        ctx.globalAlpha = star.opacity;
                        ctx.shadowColor = '#FFD700';
                        ctx.shadowBlur = armsStoppedPhase ? 30 : animationPhase ? 20 : 15;
                        
                        const spinSpeed = armsStoppedPhase ? time * 1.5 : animationPhase ? time * 3 : time * 2;
                        const energyPulse = armsStoppedPhase ? 1 + Math.sin((arm_animation_time - 5) * 4) * 0.8 : 
                                           animationPhase ? 1 + Math.sin(arm_animation_time * 4) * 0.4 : 
                                           1 + Math.sin(time * 2) * 0.3;
                        
                        ctx.beginPath();
                        ctx.arc(star.currentX, star.currentY, star.size * 1.5 * energyPulse, 0, Math.PI * 2);
                        ctx.stroke();
                        
                        const rayCount = armsStoppedPhase ? 24 : animationPhase ? 12 : 8;
                        for (let i = 0; i < rayCount; i++) {
                            const angle = i * Math.PI * 2 / rayCount + spinSpeed;
                            const rayLength = star.size * (armsStoppedPhase ? 4 : 2.5) * energyPulse;
                            ctx.lineWidth = armsStoppedPhase ? 3 : 2;
                            ctx.beginPath();
                            ctx.moveTo(star.currentX, star.currentY);
                            ctx.lineTo(star.currentX + Math.cos(angle) * rayLength, 
                                      star.currentY + Math.sin(angle) * rayLength);
                            ctx.stroke();
                        }
                        
                        ctx.fillStyle = armsStoppedPhase ? '#FFFFFF' : '#FFD700';
                        ctx.globalAlpha = star.opacity * energyPulse;
                        ctx.beginPath();
                        ctx.arc(star.currentX, star.currentY, star.size * 0.8 * energyPulse, 0, Math.PI * 2);
                        ctx.fill();
                        
                        if (armsStoppedPhase) {
                            for (let ring = 1; ring <= 3; ring++) {
                                ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 / ring})`;
                                ctx.lineWidth = 7 - ring;
                                ctx.beginPath();
                            ctx.arc(star.currentX, star.currentY, 
                                   star.size * (2.5 + ring) * energyPulse, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                    }
                }
            }});
            drawConstellationLines();
            
            ctx.restore();
        }

        function drawConstellationLines() {
            const bodyConnections = [['divine_crown', 'forehead_left'], ['divine_crown', 'forehead_right'], ['crown_jewel_left', 'divine_crown'], ['crown_jewel_right', 'divine_crown'], ['forehead_left', 'third_eye'], ['forehead_right', 'third_eye'], ['third_eye', 'eye_left'], ['third_eye', 'eye_right'], ['eye_left', 'nose_bridge'], ['eye_right', 'nose_bridge'], ['nose_bridge', 'divine_mouth'], ['ear_left', 'forehead_left'], ['ear_right', 'forehead_right'], ['divine_mouth', 'blessed_neck'], ['blessed_neck', 'shoulder_left'], ['blessed_neck', 'shoulder_right'], ['shoulder_left', 'sacred_heart'], ['shoulder_right', 'sacred_heart']];        const armConnections = [
                // First set of arms (upper arms)
                ['shoulder_left', 'arm1_shoulder_left'], ['arm1_shoulder_left', 'arm1_upper_left'], ['arm1_upper_left', 'arm1_elbow_left'], ['arm1_elbow_left', 'arm1_forearm_left'], ['arm1_forearm_left', 'hand1_left'], ['hand1_left', 'conch_shell'], 
                ['shoulder_right', 'arm1_shoulder_right'], ['arm1_shoulder_right', 'arm1_upper_right'], ['arm1_upper_right', 'arm1_elbow_right'], ['arm1_elbow_right', 'arm1_forearm_right'], ['arm1_forearm_right', 'hand1_right'], ['hand1_right', 'sudarshan_chakra'], 
                // Second set of arms (lower arms) - connecting to shoulders with correct weapon names
                ['shoulder_left', 'arm2_shoulder_left'], ['arm2_shoulder_left', 'arm2_upper_left'], ['arm2_upper_left', 'arm2_forearm_left'], ['arm2_forearm_left', 'hand2_left'], ['hand2_left', 'divine_gada'], 
                ['shoulder_right', 'arm2_shoulder_right'], ['arm2_shoulder_right', 'arm2_upper_right'], ['arm2_upper_right', 'arm2_forearm_right'], ['arm2_forearm_right', 'hand2_right'], ['hand2_right', 'divine_bow']
            ];const torsoConnections = [['sacred_heart', 'chest_left'], ['sacred_heart', 'chest_right'], ['chest_left', 'navel_chakra'], ['chest_right', 'navel_chakra'], ['navel_chakra', 'waist_left'], ['navel_chakra', 'waist_right'], ['waist_left', 'divine_center'], ['waist_right', 'divine_center'], ['divine_center', 'hip_left'], ['divine_center', 'hip_right']]; const legConnections = [['hip_left', 'thigh_left_upper'], ['thigh_left_upper', 'thigh_left_lower'], ['thigh_left_lower', 'knee_left'], ['knee_left', 'calf_left'], ['calf_left', 'ankle_left'], ['ankle_left', 'foot_left'], ['hip_right', 'thigh_right_upper'], ['thigh_right_upper', 'thigh_right_lower'], ['thigh_right_lower', 'knee_right'], ['knee_right', 'calf_right'], ['calf_right', 'ankle_right'], ['ankle_right', 'foot_right']];        const sheshaConnections = [
                // Head-to-neck connections
                ['serpent_head_1', 'serpent_neck_1'],
                ['serpent_head_2', 'serpent_neck_2'],
                ['serpent_head_3', 'serpent_neck_3'],
                ['serpent_head_center', 'serpent_neck_center'],
                ['serpent_head_5', 'serpent_neck_5'],
                ['serpent_head_6', 'serpent_neck_6'],
                ['serpent_head_7', 'serpent_neck_7'],
                // Neck-to-upper-body connections
                ['serpent_neck_1', 'serpent_body_upper_1'],
                ['serpent_neck_2', 'serpent_body_upper_2'],
                ['serpent_neck_3', 'serpent_body_upper_3'],
                ['serpent_neck_center', 'serpent_body_upper_center'],
                ['serpent_neck_5', 'serpent_body_upper_5'],
                ['serpent_neck_6', 'serpent_body_upper_6'],
                ['serpent_neck_7', 'serpent_body_upper_7'],
                // Upper-to-main body connections
                ['serpent_body_upper_1', 'serpent_body_main_1'],
                ['serpent_body_upper_2', 'serpent_body_main_2'],
                ['serpent_body_upper_3', 'serpent_body_main_3'],
                ['serpent_body_upper_center', 'serpent_body_main_center'],
                ['serpent_body_upper_5', 'serpent_body_main_5'],
                ['serpent_body_upper_6', 'serpent_body_main_6'],
                ['serpent_body_upper_7', 'serpent_body_main_7'],
                // Main-to-lower body connections
                ['serpent_body_main_1', 'serpent_body_lower_1'],
                ['serpent_body_main_2', 'serpent_body_lower_2'],
                ['serpent_body_main_3', 'serpent_body_lower_3'],
                ['serpent_body_main_center', 'serpent_body_lower_center'],
                ['serpent_body_main_5', 'serpent_body_lower_5'],
                ['serpent_body_main_6', 'serpent_body_lower_6'],
                ['serpent_body_main_7', 'serpent_body_lower_7'],
                // Lower body to coils
                ['serpent_body_lower_1', 'serpent_coil_left_1'],
                ['serpent_body_lower_2', 'serpent_coil_left_2'],
                ['serpent_body_lower_center', 'serpent_coil_center'],
                ['serpent_body_lower_5', 'serpent_coil_right_1'],
                ['serpent_body_lower_6', 'serpent_coil_right_2'],
                // Coils to tail
                ['serpent_coil_left_1', 'serpent_tail_1'],
                ['serpent_coil_center', 'serpent_tail_2'],
                ['serpent_coil_right_1', 'serpent_tail_3'],
                ['serpent_tail_1', 'serpent_tail_end'],
                ['serpent_tail_2', 'serpent_tail_end'],
                ['serpent_tail_3', 'serpent_tail_end']
            ];const divineConnections = [
                // Removed supreme_light connections
            ];const auraConnections = [['divine_aura_tl', 'divine_aura_ml'], ['divine_aura_ml', 'divine_aura_bl'], ['divine_aura_tr', 'divine_aura_mr'], ['divine_aura_mr', 'divine_aura_br']]; function drawConnectionSet(connections, strokeStyle, lineWidth, shadowColor, opacity) { ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth; ctx.shadowColor = shadowColor; ctx.shadowBlur = lineWidth * 2; connections.forEach(([start, end]) => { const startStar = mahavishnutStars.find(s => s.name === start); const endStar = mahavishnutStars.find(s => s.name === end); if (startStar && endStar && startStar.formationProgress > 0.7 && endStar.formationProgress > 0.7) { ctx.globalAlpha = Math.min(startStar.opacity, endStar.opacity) * opacity; ctx.beginPath(); ctx.moveTo(startStar.currentX, startStar.currentY); ctx.lineTo(endStar.currentX, endStar.currentY); ctx.stroke() } }) }        drawConnectionSet(bodyConnections, 'rgba(255,215,0,0.8)', 2, '#FFD700', 0.9);
        drawConnectionSet(armConnections, 'rgba(255,215,0,0.7)', 1.5, '#FFD700', 0.8);
        drawConnectionSet(torsoConnections, 'rgba(255,215,0,0.8)', 2, '#FFD700', 0.9);
        drawConnectionSet(legConnections, 'rgba(255,215,0,0.7)', 1.5, '#FFD700', 0.8);
        
        // Draw serpent connections with matching colors for complete body
        function drawColoredSerpentConnections() {
            const serpentHeadConnections = [
                { start: 'serpent_head_1', end: 'serpent_neck_1', color: 'rgba(255,69,0,0.8)' }, // Red-Orange
                { start: 'serpent_head_2', end: 'serpent_neck_2', color: 'rgba(255,165,0,0.8)' }, // Orange
                { start: 'serpent_head_3', end: 'serpent_neck_3', color: 'rgba(255,255,0,0.8)' }, // Yellow
                { start: 'serpent_head_center', end: 'serpent_neck_center', color: 'rgba(50,205,50,0.8)' }, // Lime Green
                { start: 'serpent_head_5', end: 'serpent_neck_5', color: 'rgba(30,144,255,0.8)' }, // Dodger Blue
                { start: 'serpent_head_6', end: 'serpent_neck_6', color: 'rgba(106,90,205,0.8)' }, // Slate Blue
                { start: 'serpent_head_7', end: 'serpent_neck_7', color: 'rgba(153,50,204,0.8)' } // Dark Orchid
            ];
            
            // Body connections with green variants
            const serpentBodyConnections = [
                { start: 'serpent_neck_1', end: 'serpent_body_upper_1', color: 'rgba(34,139,34,0.7)' },
                { start: 'serpent_neck_2', end: 'serpent_body_upper_2', color: 'rgba(34,139,34,0.7)' },
                { start: 'serpent_neck_3', end: 'serpent_body_upper_3', color: 'rgba(34,139,34,0.7)' },
                { start: 'serpent_neck_center', end: 'serpent_body_upper_center', color: 'rgba(50,205,50,0.8)' },
                { start: 'serpent_neck_5', end: 'serpent_body_upper_5', color: 'rgba(34,139,34,0.7)' },
                { start: 'serpent_neck_6', end: 'serpent_body_upper_6', color: 'rgba(34,139,34,0.7)' },
                { start: 'serpent_neck_7', end: 'serpent_body_upper_7', color: 'rgba(34,139,34,0.7)' },
                
                // Main body segments
                { start: 'serpent_body_upper_center', end: 'serpent_body_main_center', color: 'rgba(0,139,139,0.8)' },
                { start: 'serpent_body_main_center', end: 'serpent_body_lower_center', color: 'rgba(107,142,35,0.7)' },
                { start: 'serpent_body_lower_center', end: 'serpent_coil_center', color: 'rgba(50,205,50,0.8)' },
                { start: 'serpent_coil_center', end: 'serpent_tail_2', color: 'rgba(85,107,47,0.7)' },
                { start: 'serpent_tail_2', end: 'serpent_tail_end', color: 'rgba(85,107,47,0.6)' }
            ];
            
            // Draw head connections
            serpentHeadConnections.forEach(connection => {
                const startStar = mahavishnutStars.find(s => s.name === connection.start);
                const endStar = mahavishnutStars.find(s => s.name === connection.end);
                if (startStar && endStar && startStar.formationProgress > 0.7 && endStar.formationProgress > 0.7) {
                    ctx.strokeStyle = connection.color;
                    ctx.lineWidth = 3;
                    ctx.shadowColor = connection.color;
                    ctx.shadowBlur = 6;
                    ctx.globalAlpha = Math.min(startStar.opacity, endStar.opacity) * 0.9;
                    ctx.beginPath();
                    ctx.moveTo(startStar.currentX, startStar.currentY);
                    ctx.lineTo(endStar.currentX, endStar.currentY);
                    ctx.stroke();
                }
            });
            
            // Draw body connections
            serpentBodyConnections.forEach(connection => {
                const startStar = mahavishnutStars.find(s => s.name === connection.start);
                const endStar = mahavishnutStars.find(s => s.name === connection.end);
                if (startStar && endStar && startStar.formationProgress > 0.7 && endStar.formationProgress > 0.7) {
                    ctx.strokeStyle = connection.color;
                    ctx.lineWidth = 2;
                    ctx.shadowColor = connection.color;
                    ctx.shadowBlur = 4;
                    ctx.globalAlpha = Math.min(startStar.opacity, endStar.opacity) * 0.8;
                    ctx.beginPath();
                    ctx.moveTo(startStar.currentX, startStar.currentY);
                    ctx.lineTo(endStar.currentX, endStar.currentY);
                    ctx.stroke();
                }
            });
        }
        
        drawColoredSerpentConnections();
        drawConnectionSet(divineConnections, 'rgba(255,255,255,0.9)', 2, '#FFFFFF', 1);
        drawConnectionSet(auraConnections, 'rgba(230,230,250,0.6)', 1.5, '#E6E6FA', 0.7);
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animate() {
        updateStarfield();
        drawStarfield();
        animationFrame = requestAnimationFrame(animate);
    }

    resizeCanvas();
    createStarField();
    animate();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
}

function initConstellationAnimation() { const constellation = document.querySelector('.mahavishnu-constellation'); if (constellation) { const stars = []; for (let i = 0; i < 20; i++) { const star = document.createElement('div'); star.style.cssText = `position:absolute;width:${Math.random() * 6 + 2}px;height:${Math.random() * 6 + 2}px;background:radial-gradient(circle,#FFD700,#FF8C00);border-radius:50%;box-shadow:0 0 10px #FFD700;`; star.style.left = Math.random() * 100 + '%'; star.style.top = Math.random() * 100 + '%'; constellation.appendChild(star); stars.push(star) } setTimeout(() => { stars.forEach((star, index) => { star.style.transition = 'all 2s ease-in-out'; star.style.transform = `translate(${(index % 4 - 1.5) * 30}px, ${Math.floor(index / 4) * 25 - 50}px)`; star.style.opacity = '1' }) }, 3000) } } function initTableInteractions() { const tableRows = document.querySelectorAll('.table-row'); tableRows.forEach((row, index) => { row.addEventListener('mouseenter', function () { this.style.transform = 'scale(1.02) translateX(10px)'; this.style.background = 'rgba(255,215,0,0.08)'; this.style.boxShadow = '0 10px 30px rgba(255,215,0,0.2)' }); row.addEventListener('mouseleave', function () { this.style.transform = 'scale(1) translateX(0)'; this.style.background = ''; this.style.boxShadow = '' }); setTimeout(() => { row.style.animation = 'fadeInCosmic 0.8s ease-out forwards'; row.style.animationDelay = `${index * 0.1}s` }, 500) }); const timeBars = document.querySelectorAll('.time-bar'); timeBars.forEach(bar => { const savedTime = parseInt(bar.dataset.saved) || 0; if (savedTime > 0) { setTimeout(() => { bar.style.setProperty('--fill-width', `${Math.min(100, savedTime * 1.67)}%`) }, 1000) } }) } function initCosmicEffects() { const metricItems = document.querySelectorAll('.metric-item'); const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.animation = 'countUp 2s ease-out forwards'; entry.target.classList.add('visible') } }) }, { threshold: 0.1 }); metricItems.forEach(item => { observer.observe(item); item.addEventListener('mouseenter', function () { createEnergyRipple(this) }) }); function createEnergyRipple(element) { const ripple = document.createElement('div'); ripple.style.cssText = `position:absolute;top:50%;left:50%;width:0;height:0;background:radial-gradient(circle,rgba(255,215,0,0.6),transparent);border-radius:50%;pointer-events:none;z-index:10;animation:energyRipple 1s ease-out forwards;`; element.style.position = 'relative'; element.appendChild(ripple); setTimeout(() => ripple.remove(), 1000) } document.addEventListener('click', function (e) { if (e.target.closest('.comparison-table')) { createCosmicSpark(e.clientX, e.clientY) } }); function createCosmicSpark(x, y) { const spark = document.createElement('div'); spark.style.cssText = `position:fixed;left:${x - 5}px;top:${y - 5}px;width:10px;height:10px;background:radial-gradient(circle,#FFD700,transparent);border-radius:50%;pointer-events:none;z-index:9999;animation:sparkBurst 1s ease-out forwards;`; document.body.appendChild(spark); setTimeout(() => spark.remove(), 1000) } } function initMobileNavigation() { const hamburger = document.querySelector('.hamburger-cosmic'); const navMenu = document.querySelector('.nav-menu-cosmic'); if (hamburger && navMenu) { hamburger.addEventListener('click', () => { navMenu.classList.toggle('active'); hamburger.classList.toggle('active'); const spans = hamburger.querySelectorAll('span'); if (hamburger.classList.contains('active')) { spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)'; spans[1].style.opacity = '0'; spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)' } else { spans.forEach(span => { span.style.transform = 'none'; span.style.opacity = '1' }) } document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto' }) } } function initScrollAnimations() { let ticking = false; function updateParallax() { const scrolled = window.pageYOffset; const rate = scrolled * -0.3; const parallaxElements = document.querySelectorAll('.nebula-layer, .cosmic-particles'); parallaxElements.forEach(el => { el.style.transform = `translate3d(0, ${rate}px, 0)` }); const constellation = document.querySelector('.constellation-overlay'); if (constellation) { constellation.style.transform = `translate3d(0, ${rate * 0.1}px, 0)` } ticking = false } function requestTick() { if (!ticking) { requestAnimationFrame(updateParallax); ticking = true } } window.addEventListener('scroll', requestTick) } function createAmbientParticles() { setInterval(() => { const particle = document.createElement('div'); particle.style.cssText = `position:fixed;width:${Math.random() * 4 + 1}px;height:${Math.random() * 4 + 1}px;background:radial-gradient(circle,rgba(255,215,0,0.8),transparent);border-radius:50%;pointer-events:none;z-index:5;left:${Math.random() * 100}vw;top:100vh;animation:floatUp ${Math.random() * 10 + 10}s linear forwards;`; document.body.appendChild(particle); setTimeout(() => particle.remove(), 20000) }, 2000) } createAmbientParticles(); const cosmicCSS = `@keyframes fadeInCosmic{0%{opacity:0;transform:translateY(20px) scale(0.9);}100%{opacity:1;transform:translateY(0) scale(1);}}@keyframes energyRipple{0%{width:0;height:0;opacity:1;}100%{width:200px;height:200px;opacity:0;transform:translate(-50%,-50%);}}@keyframes sparkBurst{0%{transform:scale(0);opacity:1;}100%{transform:scale(3);opacity:0;}}@keyframes countUp{0%{transform:scale(0.8);opacity:0;}100%{transform:scale(1);opacity:1;}}@keyframes floatUp{0%{transform:translateY(0) rotate(0deg);}100%{transform:translateY(-100vh) rotate(360deg);}}@keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(255,215,0,0.4);}50%{box-shadow:0 0 40px rgba(255,215,0,0.8),0 0 60px rgba(255,140,0,0.4);}}`; const cosmicStyle = document.createElement('style'); cosmicStyle.textContent = cosmicCSS; document.head.appendChild(cosmicStyle);

// Global download function for SRAC
function downloadSRAC() {
    window.location.href = 'TC.html';
}

// Add click handlers for download buttons on page load
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn-download, .btn-download-stellar, .btn-download-cosmic, .btn-download-modern').forEach(button => {
        button.addEventListener('click', downloadSRAC);
    });
});