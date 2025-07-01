/**
 * Visual Effects Module
 * Handles drawing, particles, and visual interactions for music therapy
 */

class VisualEffects {
    constructor(canvas) {
        if (!canvas) {
            throw new Error('Canvas element is required for VisualEffects');
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Visual modes
        this.mode = 'drawing'; // 'drawing', 'particles', 'shapes'
        this.colorMode = 'rainbow'; // 'rainbow', 'speed', 'position', 'audio'
        
        // Drawing settings
        this.brushSize = 15;
        this.trailLength = 50;
        this.symmetryMode = false;
        
        // Particle system
        this.particles = [];
        this.maxParticles = 500;
        
        // Drawing trails
        this.trails = new Map(); // For each hand
        this.maxTrailLength = 100;
        
        // Color palettes - optimized for music therapy with less bright/white colors
        this.colorPalettes = {
            rainbow: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#fd79a8'],
            warm: ['#ff6b6b', '#ee5a52', '#feca57', '#fd79a8', '#e17055'],
            cool: ['#4ecdc4', '#45b7d1', '#96ceb4', '#74b9ff', '#81ecec'],
            therapeutic: ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#55a3ff', '#00cec9']
        };
        
        // Animation frame
        this.animationId = null;
        this.isAnimating = false;
        
        // Audio responsiveness
        this.audioData = null;
        this.audioIntensity = 0;
        
        this.initCanvas();
        // Don't start animation automatically - will be started when camera starts
    }
    
    /**
     * Initialize canvas settings
     */
    initCanvas() {
        this.resizeCanvas();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Set up high DPI support
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.width = rect.width;
        this.height = rect.height;
    }
    
    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
    }
    
    /**
     * Start animation loop
     */
    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const animate = () => {
            if (!this.isAnimating) return;
            
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Stop animation loop
     */
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    /**
     * Update visual effects
     */
    update() {
        // Update particles
        this.updateParticles();
        
        // Fade trails for drawing mode
        if (this.mode === 'drawing') {
            this.fadeTrails();
        }
        
        // Clean up old trails to prevent memory leaks
        this.cleanupTrails();
    }
    
    /**
     * Clean up old trails and particles to prevent memory leaks
     */
    cleanupTrails() {
        // Remove trails that haven't been updated recently
        const now = Date.now();
        for (const [handId, trail] of this.trails.entries()) {
            if (trail.length === 0) {
                this.trails.delete(handId);
                continue;
            }
            
            // Remove trails older than 5 seconds
            const lastPoint = trail[trail.length - 1];
            if (lastPoint && now - lastPoint.timestamp > 5000) {
                this.trails.delete(handId);
            }
        }
        
        // Limit particle count to prevent memory issues
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(-this.maxParticles);
        }
    }
    
    /**
     * Render visual effects
     */
    render() {
        // Skip rendering if canvas is not visible or has no dimensions
        if (this.width <= 0 || this.height <= 0) {
            return;
        }
        
        // Only log occasionally to avoid console spam
        if (Math.random() < 0.01) { // 1% chance to log
            console.log('render() called, mode:', this.mode, 'trails count:', this.trails.size);
        }
        
        // Render based on current mode
        switch (this.mode) {
            case 'drawing':
                this.renderTrails();
                break;
            case 'particles':
                this.renderParticles();
                break;
            case 'shapes':
                // Shapes are rendered immediately in handleShapes, no separate rendering needed
                break;
        }
    }
    
    /**
     * Process hand data for visual effects
     */
    processHands(hands) {
        // Reduce logging to prevent memory issues
        if (Math.random() < 0.001) { // 0.1% chance to log
            console.log('VisualEffects.processHands called with:', hands.length, 'hands');
        }
        
        switch (this.mode) {
            case 'drawing':
                this.handleDrawing(hands);
                break;
            case 'particles':
                this.handleParticles(hands);
                break;
            case 'shapes':
                this.handleShapes(hands);
                break;
        }
    }
    
    /**
     * Handle drawing mode
     */
    handleDrawing(hands) {
        // Reduce logging to prevent memory issues
        if (Math.random() < 0.001) { // 0.1% chance to log
            console.log('handleDrawing called with', hands.length, 'hands');
        }
        
        for (const hand of hands) {
            const x = hand.center.x * this.width;
            const y = hand.center.y * this.height;
            
            // Get or create trail for this hand
            let trail = this.trails.get(hand.id);
            if (!trail) {
                trail = [];
                this.trails.set(hand.id, trail);
                if (Math.random() < 0.01) { // 1% chance to log
                    console.log(`Created new trail for hand ${hand.id}`);
                }
            }
            
            // Add point to trail
            const point = {
                x: x,
                y: y,
                velocity: hand.velocity.magnitude,
                timestamp: Date.now(),
                color: this.getColor(hand, x, y)
            };
            
            trail.push(point);
            
            // Limit trail length to prevent memory issues
            if (trail.length > this.maxTrailLength) {
                trail.shift();
            }
            
            // Add symmetry point if enabled
            if (this.symmetryMode) {
                const symmetryPoint = {
                    x: this.width - x,
                    y: y,
                    velocity: hand.velocity.magnitude,
                    timestamp: Date.now(),
                    color: this.getColor(hand, this.width - x, y)
                };
                
                let symmetryTrail = this.trails.get(hand.id + '_symmetry');
                if (!symmetryTrail) {
                    symmetryTrail = [];
                    this.trails.set(hand.id + '_symmetry', symmetryTrail);
                }
                
                symmetryTrail.push(symmetryPoint);
                if (symmetryTrail.length > this.maxTrailLength) {
                    symmetryTrail.shift();
                }
            }
        }
        
        // Clean up old trails
        this.cleanupTrails();
    }
    
    /**
     * Handle particle mode
     */
    handleParticles(hands) {
        for (const hand of hands) {
            const x = hand.center.x * this.width;
            const y = hand.center.y * this.height;
            
            // Create particles based on hand movement
            const particleCount = Math.max(1, Math.floor(hand.velocity.magnitude * 10));
            
            for (let i = 0; i < particleCount; i++) {
                if (this.particles.length < this.maxParticles) {
                    this.createParticle(x, y, hand);
                }
            }
        }
    }
    
    /**
     * Handle shapes mode
     */
    handleShapes(hands) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        for (const hand of hands) {
            const x = hand.center.x * this.width;
            const y = hand.center.y * this.height;
            const size = this.brushSize + (hand.velocity.magnitude * 50);
            
            this.ctx.fillStyle = this.getColor(hand, x, y);
            this.ctx.globalAlpha = 0.7;
            
            // Draw different shapes based on gestures
            if (hand.gestures.isPointing) {
                this.drawTriangle(x, y, size);
            } else if (hand.gestures.isFist) {
                this.drawSquare(x, y, size);
            } else if (hand.gestures.isOpen) {
                this.drawStar(x, y, size);
            } else {
                this.drawCircle(x, y, size);
            }
            
            // Add symmetry if enabled
            if (this.symmetryMode) {
                const symX = this.width - x;
                this.ctx.fillStyle = this.getColor(hand, symX, y);
                
                if (hand.gestures.isPointing) {
                    this.drawTriangle(symX, y, size);
                } else if (hand.gestures.isFist) {
                    this.drawSquare(symX, y, size);
                } else if (hand.gestures.isOpen) {
                    this.drawStar(symX, y, size);
                } else {
                    this.drawCircle(symX, y, size);
                }
            }
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    /**
     * Create a particle
     */
    createParticle(x, y, hand) {
        const particle = {
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 4 + hand.velocity.x * 100,
            vy: (Math.random() - 0.5) * 4 + hand.velocity.y * 100,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.01,
            size: Math.random() * 8 + 2,
            color: this.getColor(hand, x, y),
            type: Math.random() > 0.7 ? 'spark' : 'dot'
        };
        
        this.particles.push(particle);
    }
    
    /**
     * Update particles
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity and friction
            particle.vy += 0.1;
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Update life
            particle.life -= particle.decay;
            particle.size *= 0.99;
            
            // Remove dead particles
            if (particle.life <= 0 || particle.size < 0.5) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Render particles
     */
    renderParticles() {
        // Use normal blending to avoid white dominance from 'lighter' mode
        this.ctx.globalCompositeOperation = 'source-over';
        
        for (const particle of this.particles) {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            
            if (particle.type === 'spark') {
                this.drawSpark(particle.x, particle.y, particle.size);
            } else {
                this.drawCircle(particle.x, particle.y, particle.size);
            }
        }
        
        this.ctx.globalAlpha = 1.0;
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    /**
     * Render drawing trails
     */
    renderTrails() {
        // Only log when we actually have trails to render
        if (this.trails.size > 0) {
            console.log('renderTrails called, trails:', this.trails.size);
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        for (const [handId, trail] of this.trails) {
            if (this.trails.size > 0) {
                console.log(`Rendering trail for ${handId}, length: ${trail.length}`);
            }
            if (trail.length < 2) continue;
            
            for (let i = 1; i < trail.length; i++) {
                const current = trail[i];
                const previous = trail[i - 1];
                
                // Calculate line width based on velocity and age
                const progress = i / trail.length;
                const velocityScale = Math.min(current.velocity * 2, 1);
                const lineWidth = this.brushSize * velocityScale * progress;
                
                this.ctx.strokeStyle = current.color;
                this.ctx.lineWidth = Math.max(lineWidth, 1);
                this.ctx.globalAlpha = progress * 0.8;
                
                this.ctx.beginPath();
                this.ctx.moveTo(previous.x, previous.y);
                this.ctx.lineTo(current.x, current.y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    /**
     * Get color based on current color mode
     */
    getColor(hand, x, y) {
        switch (this.colorMode) {
            case 'rainbow':
                return this.getRainbowColor(Date.now() / 10);
                
            case 'speed':
                const intensity = Math.min(hand.velocity.magnitude * 2, 1);
                return this.getSpeedColor(intensity);
                
            case 'position':
                return this.getPositionColor(x / this.width, y / this.height);
                
            case 'audio':
                return this.getAudioColor();
                
            default:
                return '#4ecdc4';
        }
    }
    
    /**
     * Get rainbow color
     */
    getRainbowColor(time) {
        const hue = (time / 10) % 360;
        // Reduced saturation and lightness to prevent white dominance
        return `hsl(${hue}, 65%, 55%)`;
    }
    
    /**
     * Get speed-based color
     */
    getSpeedColor(intensity) {
        const colors = ['#4ecdc4', '#45b7d1', '#feca57', '#ff6b6b', '#ff3838'];
        const index = Math.floor(intensity * (colors.length - 1));
        return colors[Math.min(index, colors.length - 1)];
    }
    
    /**
     * Get position-based color
     */
    getPositionColor(x, y) {
        const hue = (x * 360) % 360;
        // Reduced lightness range to prevent overly bright colors
        const lightness = 45 + (y * 20);
        return `hsl(${hue}, 65%, ${lightness}%)`;
    }
    
    /**
     * Get audio-responsive color
     */
    getAudioColor() {
        if (!this.audioData) return '#4ecdc4';
        
        const intensity = this.audioIntensity;
        const hue = (intensity * 360) % 360;
        // More muted colors for therapeutic use
        return `hsl(${hue}, 70%, 50%)`;
    }
    
    /**
     * Drawing helper functions
     */
    drawCircle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawTriangle(x, y, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x - size, y + size);
        this.ctx.lineTo(x + size, y + size);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawSquare(x, y, size) {
        this.ctx.fillRect(x - size/2, y - size/2, size, size);
    }
    
    drawStar(x, y, size) {
        const spikes = 5;
        const step = Math.PI / spikes;
        
        this.ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = i * step;
            const radius = i % 2 === 0 ? size : size / 2;
            const pointX = x + Math.cos(angle) * radius;
            const pointY = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(pointX, pointY);
            } else {
                this.ctx.lineTo(pointX, pointY);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawSpark(x, y, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y);
        this.ctx.lineTo(x + size, y);
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x, y + size);
        this.ctx.stroke();
    }
    
    /**
     * Utility functions
     */
    fadeTrails() {
        const now = Date.now();
        for (const [handId, trail] of this.trails) {
            for (let i = trail.length - 1; i >= 0; i--) {
                const age = now - trail[i].timestamp;
                if (age > this.trailLength * 100) {
                    trail.splice(i, 1);
                }
            }
            
            if (trail.length === 0) {
                this.trails.delete(handId);
            }
        }
    }
    
    /**
     * Clear canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.trails.clear();
        this.particles = [];
    }
    
    /**
     * Update settings
     */
    updateSettings(settings) {
        if (settings.mode) this.mode = settings.mode;
        if (settings.colorMode) this.colorMode = settings.colorMode;
        if (settings.brushSize) this.brushSize = settings.brushSize;
        if (settings.trailLength) this.trailLength = settings.trailLength;
        if (settings.symmetryMode !== undefined) this.symmetryMode = settings.symmetryMode;
    }
    
    /**
     * Set audio data for audio-responsive effects
     */
    setAudioData(audioData, intensity) {
        this.audioData = audioData;
        this.audioIntensity = intensity;
    }
}

// Export for use in main application
window.VisualEffects = VisualEffects;
