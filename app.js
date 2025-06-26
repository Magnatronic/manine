/**
 * Music Therapy Movement Visualizer - Main Application
 * Designed for students with disabilities in music therapy sessions
 */

class MusicTherapyApp {
    constructor() {
        // Core components
        this.handTracker = null;
        this.visualEffects = null;
        this.audioProcessor = null;
        this.therapeuticActivities = null;
        
        // DOM elements
        this.elements = {
            video: document.getElementById('inputVideo'),
            outputCanvas: document.getElementById('outputCanvas'),
            visualCanvas: document.getElementById('visualCanvas'),
            loadingScreen: document.getElementById('loadingScreen'),
            errorModal: document.getElementById('errorModal'),
            errorMessage: document.getElementById('errorMessage'),
            
            // Camera preview elements
            cameraPreview: document.getElementById('cameraPreview'),
            previewVideo: document.getElementById('previewVideo'),
            previewCanvas: document.getElementById('previewCanvas'),
            zoneStatus: document.getElementById('zoneStatus'),
            togglePreview: document.getElementById('togglePreview'),
            
            // Controls
            toggleCamera: document.getElementById('toggleCamera'),
            clearCanvas: document.getElementById('clearCanvas'),
            visualMode: document.getElementById('visualMode'),
            handMode: document.getElementById('handMode'),
            
            // Status
            cameraStatus: document.getElementById('cameraStatus'),
            handsStatus: document.getElementById('handsStatus'),
            modeStatus: document.getElementById('modeStatus'),
            
            // Settings
            settingsPanel: document.getElementById('settingsPanel'),
            toggleSettings: document.getElementById('toggleSettings'),
            sensitivity: document.getElementById('sensitivity'),
            sensitivityValue: document.getElementById('sensitivityValue'),
            trailLength: document.getElementById('trailLength'),
            trailLengthValue: document.getElementById('trailLengthValue'),
            brushSize: document.getElementById('brushSize'),
            brushSizeValue: document.getElementById('brushSizeValue'),
            colorMode: document.getElementById('colorMode'),
            audioEnabled: document.getElementById('audioEnabled'),
            symmetryMode: document.getElementById('symmetryMode'),
            
            closeError: document.getElementById('closeError')
        };
        
        // Application state
        this.state = {
            isInitialized: false,
            cameraActive: false,
            handsDetected: 0,
            currentMode: 'drawing',
            audioEnabled: false,
            errors: []
        };
        
        // Performance monitoring
        this.performance = {
            frameCount: 0,
            lastFpsTime: 0,
            fps: 0
        };
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Music Therapy Movement Visualizer...');
            
            // Show loading screen
            this.showLoadingScreen('Initializing application...');
            
            // Initialize components
            await this.initializeComponents();
            
            console.log('Setting up event listeners...');
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('Setting up canvas...');
            // Set up canvas
            this.setupCanvas();
            
            console.log('Updating UI...');
            // Initial UI update
            this.updateUI();
            
            this.state.isInitialized = true;
            this.hideLoadingScreen();
            
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application: ' + error.message);
        }
    }
    
    /**
     * Initialize core components
     */
    async initializeComponents() {
        try {
            console.log('Starting component initialization...');
            
            // Ensure DOM elements are available
            if (!this.elements.visualCanvas) {
                throw new Error('Visual canvas element not found');
            }
            console.log('Visual canvas element found');
            
            // Initialize hand tracker
            console.log('Initializing hand tracker...');
            this.handTracker = new HandTracker();
            
            // Debug: check what methods are available on this instance
            console.log('Available methods on this:', Object.getOwnPropertyNames(Object.getPrototypeOf(this)));
            console.log('Type of onHandsDetected:', typeof this.onHandsDetected);
            
            // Check if callback methods exist before binding
            console.log('Binding hand tracking callbacks...');
            if (typeof this.onHandsDetected === 'function') {
                this.handTracker.onHandsDetected = this.onHandsDetected.bind(this);
                console.log('onHandsDetected bound');
            } else {
                console.error('onHandsDetected method not found on this:', this);
            }
            if (typeof this.onHandLost === 'function') {
                this.handTracker.onHandLost = this.onHandLost.bind(this);
                console.log('onHandLost bound');
            } else {
                console.error('onHandLost method not found');
            }
            if (typeof this.onError === 'function') {
                this.handTracker.onError = this.onError.bind(this);
                console.log('onError bound');
            } else {
                console.error('onError method not found');
            }
            console.log('Hand tracker initialized');
            
            // Initialize visual effects
            console.log('Initializing visual effects...');
            this.visualEffects = new VisualEffects(this.elements.visualCanvas);
            console.log('Visual effects initialized');
            
            // Initialize audio processor
            console.log('Initializing audio processor...');
            this.audioProcessor = new AudioProcessor();
            
            // Safely bind onError callback
            if (typeof this.onError === 'function') {
                this.audioProcessor.onError = this.onError.bind(this);
                console.log('Audio onError bound');
            } else {
                console.error('onError method not found for audio processor');
            }
            
            // Check if callback methods exist before binding
            console.log('Binding audio callbacks...');
            if (typeof this.onBeatDetected === 'function') {
                this.audioProcessor.onBeatDetected = this.onBeatDetected.bind(this);
                console.log('onBeatDetected bound');
            } else {
                console.error('onBeatDetected method not found');
            }
            if (typeof this.onVolumeChange === 'function') {
                this.audioProcessor.onVolumeChange = this.onVolumeChange.bind(this);
                console.log('onVolumeChange bound');
            } else {
                console.error('onVolumeChange method not found');
            }
            console.log('Audio processor initialized');
            
            // Initialize therapeutic activities
            console.log('Initializing therapeutic activities...');
            this.therapeuticActivities = new TherapeuticActivities(
                this.visualEffects, 
                this.audioProcessor
            );
            console.log('Therapeutic activities initialized');
            
            // Check if callback methods exist before binding
            console.log('Binding therapeutic callbacks...');
            if (typeof this.onAchievement === 'function') {
                this.therapeuticActivities.onAchievement = this.onAchievement.bind(this);
                console.log('onAchievement bound');
            } else {
                console.error('onAchievement method not found');
            }
            if (typeof this.onProgressUpdate === 'function') {
                this.therapeuticActivities.onProgressUpdate = this.onProgressUpdate.bind(this);
                console.log('onProgressUpdate bound');
            } else {
                console.error('onProgressUpdate method not found');
            }
            console.log('All components initialized successfully');
            
        } catch (error) {
            console.error('Error in component initialization:', error);
            throw error;
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Camera control
        this.elements.toggleCamera.addEventListener('click', this.toggleCamera.bind(this));
        
        // Camera preview controls
        if (this.elements.togglePreview) {
            this.elements.togglePreview.addEventListener('click', this.togglePreview.bind(this));
        }
        
        // Canvas control
        this.elements.clearCanvas.addEventListener('click', this.clearCanvas.bind(this));
        
        // Mode selection
        this.elements.visualMode.addEventListener('change', this.onVisualModeChange.bind(this));
        this.elements.handMode.addEventListener('change', this.onHandModeChange.bind(this));
        
        // Settings panel
        this.elements.toggleSettings.addEventListener('click', this.toggleSettings.bind(this));
        
        // Settings controls
        this.elements.sensitivity.addEventListener('input', this.onSensitivityChange.bind(this));
        this.elements.trailLength.addEventListener('input', this.onTrailLengthChange.bind(this));
        this.elements.brushSize.addEventListener('input', this.onBrushSizeChange.bind(this));
        this.elements.colorMode.addEventListener('change', this.onColorModeChange.bind(this));
        this.elements.audioEnabled.addEventListener('change', this.onAudioToggle.bind(this));
        this.elements.symmetryMode.addEventListener('change', this.onSymmetryToggle.bind(this));
        
        // Error modal
        this.elements.closeError.addEventListener('click', this.hideError.bind(this));
        
        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        
        // Touch/click interactions for accessibility
        this.elements.visualCanvas.addEventListener('click', this.onCanvasClick.bind(this));
    }
    
    /**
     * Set up canvas
     */
    setupCanvas() {
        // Resize canvases to fit container
        this.onWindowResize();
        
        // Set up drawing context
        const ctx = this.elements.outputCanvas.getContext('2d');
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        console.log('Canvas setup complete. Visual canvas size:', this.elements.visualCanvas.width, 'x', this.elements.visualCanvas.height);
    }
    
    /**
     * Toggle camera on/off
     */
    async toggleCamera() {
        if (!this.state.cameraActive) {
            await this.startCamera();
        } else {
            this.stopCamera();
        }
    }
    
    /**
     * Start camera and hand tracking
     */
    async startCamera() {
        try {
            this.showLoadingScreen('Starting camera and hand tracking...');
            
            // Start hand tracking with preview support
            await this.handTracker.startTracking(this.elements.video, this.elements.previewVideo);
            
            // Make camera preview visible
            if (this.elements.cameraPreview) {
                this.elements.cameraPreview.classList.remove('hidden');
            }
            
            // Start visual effects animation
            this.visualEffects.startAnimation();
            console.log('Visual effects animation started');
            
            // Start main loop
            this.startMainLoop();
            
            // Make movement zone more accessible
            this.handTracker.expandMovementZone(1.5);
            
            this.state.cameraActive = true;
            this.elements.toggleCamera.textContent = 'Stop Camera';
            this.elements.cameraStatus.textContent = 'Connected';
            
            this.hideLoadingScreen();
            
            console.log('Camera and hand tracking started');
            
        } catch (error) {
            console.error('Failed to start camera:', error);
            this.showError('Failed to start camera. Please check camera permissions and try again.');
            this.hideLoadingScreen();
        }
    }
    
    /**
     * Stop camera and hand tracking
     */
    stopCamera() {
        this.handTracker.stopTracking();
        this.visualEffects.stopAnimation();
        this.stopMainLoop();
        
        this.state.cameraActive = false;
        this.state.handsDetected = 0;
        
        this.elements.toggleCamera.textContent = 'Start Camera';
        this.elements.cameraStatus.textContent = 'Not Connected';
        this.elements.handsStatus.textContent = '0';
        
        // Update preview status but don't hide the preview itself
        if (this.elements.zoneStatus) {
            this.elements.zoneStatus.textContent = 'Camera stopped';
            this.elements.zoneStatus.className = 'zone-status';
        }
        
        // Clear canvases
        this.clearCanvas();
        
        console.log('Camera and hand tracking stopped');
    }
    
    /**
     * Start main application loop
     */
    startMainLoop() {
        const loop = () => {
            if (this.state.cameraActive) {
                this.updatePerformance();
                requestAnimationFrame(loop);
            }
        };
        loop();
    }
    
    /**
     * Stop main application loop
     */
    stopMainLoop() {
        // Loop will stop when cameraActive becomes false
    }
    
    /**
     * Handle detected hands
     */
    onHandsDetected(hands) {
        console.log('onHandsDetected called with', hands.length, 'hands');
        this.state.handsDetected = hands.length;
        
        // Update UI
        this.elements.handsStatus.textContent = hands.length.toString();
        
        // Update zone status for user feedback
        if (this.elements.zoneStatus) {
            if (hands.length > 0) {
                this.elements.zoneStatus.textContent = `${hands.length} hand${hands.length > 1 ? 's' : ''} detected`;
                this.elements.zoneStatus.className = 'zone-status hands-detected';
            } else {
                this.elements.zoneStatus.textContent = 'Searching for hands...';
                this.elements.zoneStatus.className = 'zone-status';
            }
        }
        
        // Process hands for visual effects
        this.visualEffects.processHands(hands);
        
        // Process hands for therapeutic activities
        this.therapeuticActivities.processHands(hands);
        
        // Draw hand landmarks on output canvas
        this.drawHandLandmarks(hands);
    }
    
    /**
     * Handle hand lost event
     */
    onHandLost() {
        this.state.handsDetected = 0;
        this.elements.handsStatus.textContent = '0';
    }
    
    /**
     * Handle errors from modules
     */
    onError(error) {
        console.error('Module error:', error);
        this.showError(error.message || 'An error occurred in the application');
    }
    
    /**
     * Draw hand landmarks on overlay canvas and preview canvas
     */
    drawHandLandmarks(hands) {
        // Draw on main output canvas
        const canvas = this.elements.outputCanvas;
        const ctx = canvas.getContext('2d');
        
        // Clear previous landmarks
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw landmarks for each hand
        for (const hand of hands) {
            const color = hand.label === 'left' ? '#ff6b6b' : '#4ecdc4';
            
            // Draw hand outline
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            
            // Draw hand center
            const centerX = hand.center.x * canvas.width;
            const centerY = hand.center.y * canvas.height;
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw gesture indicator
            let gestureText = '';
            if (hand.gestures.isPointing) gestureText = '👉';
            else if (hand.gestures.isFist) gestureText = '✊';
            else if (hand.gestures.isOpen) gestureText = '✋';
            else if (hand.gestures.isPinching) gestureText = '🤏';
            
            if (gestureText) {
                ctx.font = '24px Arial';
                ctx.fillText(gestureText, centerX + 15, centerY - 15);
            }
            
            // Draw hand label
            ctx.font = '16px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(
                hand.label.toUpperCase(), 
                centerX - 20, 
                centerY + 30
            );
        }
        
        ctx.globalAlpha = 1.0;
        
        // Also draw on preview canvas for diagnostic purposes
        this.drawPreviewLandmarks(hands);
    }
    
    /**
     * Draw hand landmarks on preview canvas for diagnostic purposes
     */
    drawPreviewLandmarks(hands) {
        const canvas = this.elements.previewCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match preview video
        if (canvas.width !== 320 || canvas.height !== 240) {
            canvas.width = 320;
            canvas.height = 240;
        }
        
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!hands || hands.length === 0) return;
        
        // Hand landmark connections (simplified skeleton)
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17] // Palm connections
        ];
        
        for (const hand of hands) {
            const landmarks = hand.landmarks;
            const confidence = hand.confidence;
            
            // Choose colors based on confidence and hand
            const handColor = hand.label === 'left' ? '#4ecdc4' : '#ff6b6b';
            const confidenceColor = confidence > 0.8 ? '#00ff00' : confidence > 0.6 ? '#ffff00' : '#ff0000';
            
            // Draw connections (skeleton)
            ctx.strokeStyle = handColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            
            ctx.beginPath();
            for (const [start, end] of connections) {
                if (landmarks[start] && landmarks[end]) {
                    const startX = landmarks[start].x * canvas.width;
                    const startY = landmarks[start].y * canvas.height;
                    const endX = landmarks[end].x * canvas.width;
                    const endY = landmarks[end].y * canvas.height;
                    
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                }
            }
            ctx.stroke();
            
            // Draw landmarks (joints)
            for (let i = 0; i < landmarks.length; i++) {
                const landmark = landmarks[i];
                const x = landmark.x * canvas.width;
                const y = landmark.y * canvas.height;
                
                // Different sizes for different landmark types
                let radius = 3;
                if (i === 0) radius = 6; // Wrist - larger
                if ([4, 8, 12, 16, 20].includes(i)) radius = 5; // Fingertips - medium
                
                // Draw landmark
                ctx.fillStyle = confidenceColor;
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw small outline
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 1;
                ctx.stroke();
            }
            
            // Draw hand label and confidence
            const centerX = hand.center.x * canvas.width;
            const centerY = hand.center.y * canvas.height;
            
            ctx.fillStyle = handColor;
            ctx.globalAlpha = 1;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${hand.label.toUpperCase()}`, centerX, centerY - 20);
            ctx.font = '10px Arial';
            ctx.fillText(`${(confidence * 100).toFixed(0)}%`, centerX, centerY - 8);
            
            // Draw gesture indicator
            if (hand.gestures.isPointing) {
                ctx.fillText('👉 POINTING', centerX, centerY + 15);
            } else if (hand.gestures.isFist) {
                ctx.fillText('✊ FIST', centerX, centerY + 15);
            } else if (hand.gestures.isOpen) {
                ctx.fillText('✋ OPEN', centerX, centerY + 15);
            } else if (hand.gestures.isPinching) {
                ctx.fillText('🤏 PINCH', centerX, centerY + 15);
            }
        }
        
        ctx.globalAlpha = 1;
    }

    /**
     * Event handlers
     */
    onVisualModeChange(event) {
        const mode = event.target.value;
        this.state.currentMode = mode;
        
        this.visualEffects.updateSettings({ mode: mode });
        this.elements.modeStatus.textContent = this.capitalizeFirst(mode);
        
        // Clear canvas when switching modes
        this.clearCanvas();
    }
    
    onHandModeChange(event) {
        const singleHandMode = event.target.value === 'single';
        this.handTracker.updateSettings({ singleHandMode });
    }
    
    onSensitivityChange(event) {
        const sensitivity = parseFloat(event.target.value);
        this.elements.sensitivityValue.textContent = sensitivity.toFixed(1);
        
        this.handTracker.updateSettings({ sensitivity });
        
        if (this.audioProcessor) {
            this.audioProcessor.updateSettings({ sensitivity });
        }
    }
    
    onTrailLengthChange(event) {
        const trailLength = parseInt(event.target.value);
        this.elements.trailLengthValue.textContent = trailLength.toString();
        
        this.visualEffects.updateSettings({ trailLength });
    }
    
    onBrushSizeChange(event) {
        const brushSize = parseInt(event.target.value);
        this.elements.brushSizeValue.textContent = brushSize.toString();
        
        this.visualEffects.updateSettings({ brushSize });
    }
    
    onColorModeChange(event) {
        const colorMode = event.target.value;
        this.visualEffects.updateSettings({ colorMode });
    }
    
    async onAudioToggle(event) {
        const enabled = event.target.checked;
        
        if (enabled && !this.state.audioEnabled) {
            try {
                this.showLoadingScreen('Requesting microphone access...');
                
                const initialized = await this.audioProcessor.initialize();
                if (initialized) {
                    this.audioProcessor.start();
                    this.state.audioEnabled = true;
                    
                    // Connect audio to visual effects
                    this.audioProcessor.onSpectrumUpdate = (spectrum, frequencyData) => {
                        const intensity = this.audioProcessor.getVolume();
                        this.visualEffects.setAudioData(frequencyData, intensity);
                    };
                }
                
                this.hideLoadingScreen();
                
            } catch (error) {
                console.error('Failed to enable audio:', error);
                this.showError('Failed to enable audio. Please check microphone permissions.');
                event.target.checked = false;
                this.hideLoadingScreen();
            }
        } else if (!enabled && this.state.audioEnabled) {
            this.audioProcessor.stop();
            this.state.audioEnabled = false;
        }
    }
    
    onSymmetryToggle(event) {
        const enabled = event.target.checked;
        this.visualEffects.updateSettings({ symmetryMode: enabled });
    }
    
    onBeatDetected(intensity) {
        // Visual feedback for beat detection
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.background = `rgba(255, 255, 255, ${intensity * 0.2})`;
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '999';
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 100);
    }
    
    onVolumeChange(volume) {
        // Could be used for volume-based visual effects
        // Already handled in visual effects module
    }
    
    onAchievement(achievement) {
        // Show achievement notification
        this.showAchievement(achievement);
    }
    
    onProgressUpdate(progress) {
        // Could update a progress display
        console.log('Progress update:', progress);
    }
    
    onKeyDown(event) {
        // Keyboard shortcuts for accessibility
        switch (event.key) {
            case ' ': // Spacebar - toggle camera
                event.preventDefault();
                this.toggleCamera();
                break;
            case 'c': // C - clear canvas
                this.clearCanvas();
                break;
            case 's': // S - toggle settings
                this.toggleSettings();
                break;
            case 'Escape': // Escape - close modals
                this.hideError();
                break;
        }
    }
    
    onCanvasClick(event) {
        // Accessibility feature - clicking canvas can trigger effects
        const rect = this.elements.visualCanvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        
        // Create a manual interaction point
        const fakeHand = {
            center: { x, y },
            velocity: { x: 0, y: 0, magnitude: 0.5 },
            id: 'click_interaction',
            label: 'interaction'
        };
        
        this.visualEffects.processHands([fakeHand]);
    }
    
    onWindowResize() {
        // Resize canvases
        const container = document.querySelector('.canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.elements.outputCanvas.width = width;
        this.elements.outputCanvas.height = height;
        
        if (this.visualEffects) {
            this.visualEffects.resizeCanvas();
        }
    }
    
    /**
     * UI helper methods
     */
    clearCanvas() {
        if (this.visualEffects) {
            this.visualEffects.clear();
        }
        
        const ctx = this.elements.outputCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.elements.outputCanvas.width, this.elements.outputCanvas.height);
    }
    
    /**
     * Toggle settings panel visibility
     */
    toggleSettings() {
        this.elements.settingsPanel.classList.toggle('open');
    }
    
    /**
     * Toggle camera preview visibility
     */
    togglePreview() {
        if (this.elements.cameraPreview) {
            this.elements.cameraPreview.classList.toggle('hidden');
            const isHidden = this.elements.cameraPreview.classList.contains('hidden');
            if (this.elements.togglePreview) {
                this.elements.togglePreview.textContent = isHidden ? 'Show Preview' : 'Hide Preview';
            }
        }
    }
    
    /**
     * Show loading screen with message
     */
    showLoadingScreen(message) {
        this.elements.loadingScreen.classList.remove('hidden');
        const loadingText = this.elements.loadingScreen.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
    
    hideLoadingScreen() {
        this.elements.loadingScreen.classList.add('hidden');
    }
    
    /**
     * Show error message to user
     */
    showError(message) {
        // Create or update error display
        let errorElement = document.getElementById('error-display');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'error-display';
            errorElement.className = 'error-message';
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'assertive');
            
            // Insert at the top of the main container
            const container = document.querySelector('.container');
            if (container && container.firstChild) {
                container.insertBefore(errorElement, container.firstChild);
            }
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }, 5000);
    }

    hideError() {
        this.elements.errorModal.classList.add('hidden');
    }
    
    showAchievement(achievement) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <h4>🎉 ${achievement.name}</h4>
            <p>${achievement.description}</p>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            z-index: 1000;
            max-width: 300px;
            border: 2px solid #4ecdc4;
            animation: slideIn 0.5s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 5000);
    }
    
    updatePerformance() {
        this.performance.frameCount++;
        const now = Date.now();
        
        if (now - this.performance.lastFpsTime >= 1000) {
            this.performance.fps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastFpsTime = now;
        }
    }
    
    updateUI() {
        // Update status displays
        this.elements.cameraStatus.textContent = this.state.cameraActive ? 'Connected' : 'Not Connected';
        this.elements.handsStatus.textContent = this.state.handsDetected.toString();
        this.elements.modeStatus.textContent = this.capitalizeFirst(this.state.currentMode);
        
        // Update setting values
        this.elements.sensitivityValue.textContent = this.elements.sensitivity.value;
        this.elements.trailLengthValue.textContent = this.elements.trailLength.value;
        this.elements.brushSizeValue.textContent = this.elements.brushSize.value;
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.state.isInitialized,
            cameraActive: this.state.cameraActive,
            handsDetected: this.state.handsDetected,
            audioEnabled: this.state.audioEnabled,
            currentMode: this.state.currentMode,
            fps: this.performance.fps,
            errors: this.state.errors
        };
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.handTracker) {
            this.handTracker.stopTracking();
        }
        
        if (this.visualEffects) {
            this.visualEffects.stopAnimation();
        }
        
        if (this.audioProcessor) {
            this.audioProcessor.cleanup();
        }
        
        console.log('Application cleaned up');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations for achievements
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Create and start the application
    window.musicTherapyApp = new MusicTherapyApp();
    
    // Global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (window.musicTherapyApp) {
            window.musicTherapyApp.showError('An unexpected error occurred: ' + event.error.message);
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.musicTherapyApp) {
            window.musicTherapyApp.cleanup();
        }
    });
});

console.log('Music Therapy Movement Visualizer loaded successfully');
