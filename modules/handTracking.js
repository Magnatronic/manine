/**
 * Hand Tracking Module using MediaPipe Hands
 * Optimized for music therapy applications with accessibility features
 */

class HandTracker {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.isInitialized = false;
        this.isTracking = false;
        
        // Hand tracking data
        this.currentHands = [];
        this.previousHands = [];
        this.handHistory = new Map(); // For consistent hand identification
        this.maxHistoryLength = 10;
        
        // Smoothing parameters
        this.smoothingFactor = 0.7;
        this.velocityThreshold = 0.02;
        this.confidenceThreshold = 0.7;
        
        // Tracking settings
        this.settings = {
            singleHandMode: false,
            sensitivity: 1.0,
            smoothing: true,
            handPreference: 'right', // 'left', 'right', 'any'
            movementZone: {
                x: { min: 0.1, max: 0.9 },
                y: { min: 0.1, max: 0.9 }
            }
        };
        
        // Event callbacks
        this.onHandsDetected = null;
        this.onHandLost = null;
        this.onError = null;
        
        this.initializeMediaPipe();
    }
    
    /**
     * Initialize MediaPipe Hands
     */
    initializeMediaPipe() {
        try {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });
            
            this.hands.setOptions({
                maxNumHands: this.settings.singleHandMode ? 1 : 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            this.hands.onResults(this.onResults.bind(this));
            this.isInitialized = true;
            
            console.log('MediaPipe Hands initialized successfully');
        } catch (error) {
            console.error('Failed to initialize MediaPipe Hands:', error);
            if (this.onError) this.onError('Failed to initialize hand tracking');
        }
    }
    
    /**
     * Start camera and hand tracking
     */
    async startTracking(videoElement, previewElement = null) {
        if (!this.isInitialized) {
            throw new Error('Hand tracker not initialized');
        }
        
        try {
            let frameCount = 0;
            
            // Get camera stream first
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 1280,
                    height: 720,
                    facingMode: 'user'
                }
            });
            
            // Set up preview video if provided
            if (previewElement) {
                previewElement.srcObject = stream;
            }
            
            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    frameCount++;
                    if (frameCount % 300 === 0) { // Log every 300 frames (about once per 5 seconds)
                        console.log(`Camera frame ${frameCount}: sending to MediaPipe`);
                    }
                    
                    if (this.hands && this.isTracking) {
                        await this.hands.send({ image: videoElement });
                    }
                },
                width: 1280,
                height: 720,
                facingMode: 'user'
            });
            
            await this.camera.start();
            this.isTracking = true;
            
            console.log('Hand tracking started');
        } catch (error) {
            console.error('Failed to start camera:', error);
            if (this.onError) this.onError('Failed to access camera. Please check permissions.');
            throw error;
        }
    }
    
    /**
     * Stop hand tracking
     */
    stopTracking() {
        this.isTracking = false;
        if (this.camera) {
            this.camera.stop();
        }
        this.currentHands = [];
        this.previousHands = [];
        this.handHistory.clear();
        
        console.log('Hand tracking stopped');
    }
    
    /**
     * Process hand tracking results
     */
    onResults(results) {
        if (!this.isTracking) return;
        
        // Debug: Log raw MediaPipe results
        if (results.multiHandLandmarks) {
            // Only log occasionally to prevent memory issues
            if (Math.random() < 0.01) { // 1% chance to log
                console.log(`MediaPipe detected ${results.multiHandLandmarks.length} hands`);
            }
        }
        
        this.previousHands = [...this.currentHands];
        this.currentHands = [];
        
        if (results.multiHandLandmarks && results.multiHandedness) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i];
                
                // Only log occasionally to prevent memory issues
                if (Math.random() < 0.01) { // 1% chance to log
                    console.log(`Hand ${i}: confidence=${handedness.score.toFixed(3)}, threshold=${this.confidenceThreshold}`);
                }
                
                if (handedness.score < this.confidenceThreshold) {
                    if (Math.random() < 0.01) { // 1% chance to log
                        console.log(`Hand ${i} filtered out due to low confidence`);
                    }
                    continue;
                }
                
                const handData = this.processHandData(landmarks, handedness, i);
                
                // Apply movement zone filtering
                if (this.isInMovementZone(handData)) {
                    if (Math.random() < 0.01) { // 1% chance to log
                        console.log(`Hand ${i} accepted: center=(${handData.center.x.toFixed(3)}, ${handData.center.y.toFixed(3)})`);
                    }
                    this.currentHands.push(handData);
                } else {
                    if (Math.random() < 0.01) { // 1% chance to log
                        console.log(`Hand ${i} filtered out due to movement zone`);
                    }
                }
            }
        }
        
        // Maintain consistent hand identification
        this.maintainHandIdentity();
        
        // Apply smoothing
        if (this.settings.smoothing) {
            this.smoothHandPositions();
        }
        
        // Calculate velocities and gestures
        this.calculateHandVelocities();
        this.detectGestures();
        
        // Trigger callbacks
        if (this.onHandsDetected) {
            this.onHandsDetected(this.currentHands);
        }
        
        // Check for hand loss
        if (this.previousHands.length > 0 && this.currentHands.length === 0) {
            if (this.onHandLost) this.onHandLost();
        }
    }
    
    /**
     * Process raw hand landmark data
     */
    processHandData(landmarks, handedness, index) {
        const rawLabel = handedness.label; // 'Left' or 'Right' from MediaPipe
        
        // Flip labels to match user's perspective with mirrored coordinates
        // MediaPipe sees "Left" but user's left hand should be labeled as "Left" on left side
        const label = rawLabel === 'Left' ? 'Right' : 'Left';
        
        // Get key landmarks
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        const thumbTip = landmarks[4];
        
        // Calculate hand center (average of key points)
        const handCenter = this.calculateHandCenter(landmarks);
        
        // Calculate hand size for gesture recognition
        const handSize = this.calculateHandSize(landmarks);
        
        return {
            id: `${label}_${index}`,
            label: label.toLowerCase(), // Right hand shows as "right" on right side, left hand as "left" on left side
            confidence: handedness.score,
            landmarks: landmarks,
            center: handCenter,
            size: handSize,
            velocity: { x: 0, y: 0, magnitude: 0 },
            fingers: {
                thumb: thumbTip,
                index: indexTip,
                middle: middleTip,
                ring: ringTip,
                pinky: pinkyTip
            },
            gestures: {
                isPointing: false,
                isFist: false,
                isOpen: false,
                isPinching: false
            },
            timestamp: Date.now()
        };
    }
    
    /**
     * Calculate hand center point
     */
    calculateHandCenter(landmarks) {
        let sumX = 0, sumY = 0;
        for (const landmark of landmarks) {
            sumX += landmark.x;
            sumY += landmark.y;
        }
        
        // Mirror the x-coordinate to match the mirrored video preview
        // This ensures hand positions match what user sees in the mirrored camera preview
        const mirroredX = 1 - (sumX / landmarks.length);
        
        return {
            x: mirroredX,
            y: sumY / landmarks.length,
            z: landmarks[0].z // Use wrist z-coordinate as reference
        };
    }
    
    /**
     * Calculate hand size for scaling effects
     */
    calculateHandSize(landmarks) {
        const wrist = landmarks[0];
        const middleTip = landmarks[12];
        
        const dx = middleTip.x - wrist.x;
        const dy = middleTip.y - wrist.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Check if hand is within defined movement zone
     */
    isInMovementZone(handData) {
        const { x, y } = handData.center;
        const zone = this.settings.movementZone;
        
        return x >= zone.x.min && x <= zone.x.max &&
               y >= zone.y.min && y <= zone.y.max;
    }
    
    /**
     * Maintain consistent hand identification across frames
     */
    maintainHandIdentity() {
        if (this.currentHands.length === 0) return;
        
        // Simple approach: maintain left/right consistency
        // More complex tracking could use position history and movement prediction
        for (const hand of this.currentHands) {
            const history = this.handHistory.get(hand.label) || [];
            history.push({
                center: hand.center,
                timestamp: hand.timestamp
            });
            
            // Keep limited history
            if (history.length > this.maxHistoryLength) {
                history.shift();
            }
            
            this.handHistory.set(hand.label, history);
        }
    }
    
    /**
     * Apply smoothing to hand positions
     */
    smoothHandPositions() {
        for (const currentHand of this.currentHands) {
            const previousHand = this.previousHands.find(h => h.label === currentHand.label);
            
            if (previousHand) {
                // Apply exponential smoothing
                currentHand.center.x = this.lerp(
                    previousHand.center.x,
                    currentHand.center.x,
                    1 - this.smoothingFactor
                );
                currentHand.center.y = this.lerp(
                    previousHand.center.y,
                    currentHand.center.y,
                    1 - this.smoothingFactor
                );
            }
        }
    }
    
    /**
     * Calculate hand velocities
     */
    calculateHandVelocities() {
        for (const currentHand of this.currentHands) {
            const previousHand = this.previousHands.find(h => h.label === currentHand.label);
            
            if (previousHand) {
                const dt = (currentHand.timestamp - previousHand.timestamp) / 1000; // Convert to seconds
                
                if (dt > 0) {
                    const dx = currentHand.center.x - previousHand.center.x;
                    const dy = currentHand.center.y - previousHand.center.y;
                    
                    currentHand.velocity = {
                        x: (dx / dt) * this.settings.sensitivity,
                        y: (dy / dt) * this.settings.sensitivity,
                        magnitude: Math.sqrt(dx * dx + dy * dy) / dt * this.settings.sensitivity
                    };
                }
            }
        }
    }
    
    /**
     * Detect basic hand gestures
     */
    detectGestures() {
        for (const hand of this.currentHands) {
            const landmarks = hand.landmarks;
            
            // Detect pointing (index finger extended)
            hand.gestures.isPointing = this.isFingerExtended(landmarks, 8) && 
                                      !this.isFingerExtended(landmarks, 12) &&
                                      !this.isFingerExtended(landmarks, 16) &&
                                      !this.isFingerExtended(landmarks, 20);
            
            // Detect open hand (all fingers extended)
            hand.gestures.isOpen = this.isFingerExtended(landmarks, 8) &&
                                  this.isFingerExtended(landmarks, 12) &&
                                  this.isFingerExtended(landmarks, 16) &&
                                  this.isFingerExtended(landmarks, 20);
            
            // Detect fist (all fingers closed)
            hand.gestures.isFist = !this.isFingerExtended(landmarks, 8) &&
                                  !this.isFingerExtended(landmarks, 12) &&
                                  !this.isFingerExtended(landmarks, 16) &&
                                  !this.isFingerExtended(landmarks, 20);
            
            // Detect pinching (thumb and index close)
            hand.gestures.isPinching = this.isPinching(landmarks);
        }
    }
    
    /**
     * Check if a finger is extended
     */
    isFingerExtended(landmarks, tipIndex) {
        const tip = landmarks[tipIndex];
        const pip = landmarks[tipIndex - 2]; // PIP joint
        
        // Simple check: tip is higher than PIP joint
        return tip.y < pip.y;
    }
    
    /**
     * Check if thumb and index finger are pinching
     */
    isPinching(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) +
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        
        return distance < 0.05; // Threshold for pinching
    }
    
    /**
     * Linear interpolation utility
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    /**
     * Update tracking settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        if (this.hands) {
            this.hands.setOptions({
                maxNumHands: this.settings.singleHandMode ? 1 : 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
        }
    }
    
    /**
     * Update movement zone settings to be more accessible
     */
    updateMovementZone(zone) {
        this.settings.movementZone = {
            x: { min: Math.max(0, zone.x.min), max: Math.min(1, zone.x.max) },
            y: { min: Math.max(0, zone.y.min), max: Math.min(1, zone.y.max) }
        };
        console.log('Movement zone updated:', this.settings.movementZone);
    }
    
    /**
     * Make movement zone more forgiving for accessibility
     */
    expandMovementZone(factor = 1.2) {
        const zone = this.settings.movementZone;
        const centerX = (zone.x.min + zone.x.max) / 2;
        const centerY = (zone.y.min + zone.y.max) / 2;
        const widthX = (zone.x.max - zone.x.min) * factor;
        const widthY = (zone.y.max - zone.y.min) * factor;
        
        this.settings.movementZone = {
            x: { 
                min: Math.max(0, centerX - widthX / 2), 
                max: Math.min(1, centerX + widthX / 2) 
            },
            y: { 
                min: Math.max(0, centerY - widthY / 2), 
                max: Math.min(1, centerY + widthY / 2) 
            }
        };
        
        console.log('Movement zone expanded:', this.settings.movementZone);
    }
    
    /**
     * Get current hand data
     */
    getCurrentHands() {
        return this.currentHands;
    }
    
    /**
     * Get hand count
     */
    getHandCount() {
        return this.currentHands.length;
    }
    
    /**
     * Check if tracking is active
     */
    isActive() {
        return this.isTracking;
    }
}

// Export for use in main application
window.HandTracker = HandTracker;
