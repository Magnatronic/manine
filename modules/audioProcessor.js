/**
 * Audio Processor Module
 * Handles microphone input and audio analysis for music therapy
 */

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isActive = false;
        
        // Audio analysis data
        this.frequencyData = null;
        this.timeDomainData = null;
        this.bufferLength = 0;
        
        // Audio features
        this.volume = 0;
        this.pitch = 0;
        this.beat = false;
        this.spectrum = [];
        
        // Beat detection
        this.beatThreshold = 0.3;
        this.beatDecay = 0.98;
        this.beatMin = 0.15;
        this.beatLastTime = 0;
        this.beatCooldown = 300; // ms
        
        // Volume smoothing
        this.volumeHistory = [];
        this.volumeHistoryLength = 10;
        
        // Frequency bands for visualization
        this.frequencyBands = {
            bass: { start: 0, end: 4 },
            lowMid: { start: 4, end: 16 },
            mid: { start: 16, end: 64 },
            highMid: { start: 64, end: 256 },
            treble: { start: 256, end: 512 }
        };
        
        // Settings
        this.settings = {
            enabled: false,
            sensitivity: 1.0,
            beatDetection: true,
            volumeSmoothing: true,
            frequencyAnalysis: true
        };
        
        // Callbacks
        this.onBeatDetected = null;
        this.onVolumeChange = null;
        this.onSpectrumUpdate = null;
        this.onError = null;
    }
    
    /**
     * Initialize audio context and request microphone access
     */
    async initialize() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100
                }
            });
            
            // Create audio nodes
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            
            // Configure analyser
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            this.bufferLength = this.analyser.frequencyBinCount;
            
            // Create data arrays
            this.frequencyData = new Uint8Array(this.bufferLength);
            this.timeDomainData = new Uint8Array(this.bufferLength);
            
            // Connect audio nodes
            this.microphone.connect(this.analyser);
            
            console.log('Audio processor initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            if (this.onError) {
                this.onError('Failed to access microphone. Please check permissions.');
            }
            return false;
        }
    }
    
    /**
     * Start audio analysis
     */
    start() {
        if (!this.audioContext || !this.analyser) {
            console.error('Audio processor not initialized');
            return false;
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isActive = true;
        this.settings.enabled = true;
        this.analyzeAudio();
        
        console.log('Audio analysis started');
        return true;
    }
    
    /**
     * Stop audio analysis
     */
    stop() {
        this.isActive = false;
        this.settings.enabled = false;
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.suspend();
        }
        
        // Reset values
        this.volume = 0;
        this.pitch = 0;
        this.beat = false;
        this.spectrum = [];
        
        console.log('Audio analysis stopped');
    }
    
    /**
     * Main audio analysis loop
     */
    analyzeAudio() {
        if (!this.isActive || !this.settings.enabled) return;
        
        // Get frequency and time domain data
        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.timeDomainData);
        
        // Analyze volume
        this.analyzeVolume();
        
        // Analyze frequency spectrum
        if (this.settings.frequencyAnalysis) {
            this.analyzeSpectrum();
        }
        
        // Detect beats
        if (this.settings.beatDetection) {
            this.detectBeat();
        }
        
        // Detect pitch
        this.detectPitch();
        
        // Trigger callbacks
        this.triggerCallbacks();
        
        // Continue analysis
        requestAnimationFrame(() => this.analyzeAudio());
    }
    
    /**
     * Analyze volume level
     */
    analyzeVolume() {
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += this.frequencyData[i] * this.frequencyData[i];
        }
        
        const rms = Math.sqrt(sum / this.bufferLength) / 255;
        const volume = rms * this.settings.sensitivity;
        
        if (this.settings.volumeSmoothing) {
            this.volumeHistory.push(volume);
            if (this.volumeHistory.length > this.volumeHistoryLength) {
                this.volumeHistory.shift();
            }
            
            // Calculate smoothed volume
            const smoothedVolume = this.volumeHistory.reduce((a, b) => a + b, 0) / this.volumeHistory.length;
            this.volume = smoothedVolume;
        } else {
            this.volume = volume;
        }
    }
    
    /**
     * Analyze frequency spectrum
     */
    analyzeSpectrum() {
        this.spectrum = [];
        
        // Analyze frequency bands
        for (const [bandName, band] of Object.entries(this.frequencyBands)) {
            let sum = 0;
            let count = 0;
            
            for (let i = band.start; i < Math.min(band.end, this.bufferLength); i++) {
                sum += this.frequencyData[i];
                count++;
            }
            
            const average = count > 0 ? (sum / count) / 255 : 0;
            this.spectrum.push({
                name: bandName,
                value: average * this.settings.sensitivity,
                frequency: bandName
            });
        }
    }
    
    /**
     * Detect beats in the audio
     */
    detectBeat() {
        const now = Date.now();
        
        // Calculate energy in low frequency range (bass)
        let bassEnergy = 0;
        const bassEnd = Math.min(this.frequencyBands.bass.end, this.bufferLength);
        
        for (let i = this.frequencyBands.bass.start; i < bassEnd; i++) {
            bassEnergy += this.frequencyData[i] / 255;
        }
        
        bassEnergy /= (bassEnd - this.frequencyBands.bass.start);
        
        // Check for beat
        if (bassEnergy > this.beatThreshold && 
            now - this.beatLastTime > this.beatCooldown) {
            
            this.beat = true;
            this.beatLastTime = now;
            
            if (this.onBeatDetected) {
                this.onBeatDetected(bassEnergy);
            }
        } else {
            this.beat = false;
        }
        
        // Decay threshold
        this.beatThreshold *= this.beatDecay;
        this.beatThreshold = Math.max(this.beatThreshold, this.beatMin);
    }
    
    /**
     * Detect dominant pitch/frequency
     */
    detectPitch() {
        // Simple pitch detection using autocorrelation
        let maxAmplitude = 0;
        let dominantFrequency = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            if (this.frequencyData[i] > maxAmplitude) {
                maxAmplitude = this.frequencyData[i];
                dominantFrequency = i;
            }
        }
        
        // Convert bin to frequency
        const nyquist = this.audioContext.sampleRate / 2;
        this.pitch = (dominantFrequency / this.bufferLength) * nyquist;
    }
    
    /**
     * Trigger callbacks with current audio data
     */
    triggerCallbacks() {
        if (this.onVolumeChange) {
            this.onVolumeChange(this.volume);
        }
        
        if (this.onSpectrumUpdate) {
            this.onSpectrumUpdate(this.spectrum, this.frequencyData);
        }
    }
    
    /**
     * Get current audio features
     */
    getAudioFeatures() {
        return {
            volume: this.volume,
            pitch: this.pitch,
            beat: this.beat,
            spectrum: this.spectrum,
            isActive: this.isActive,
            timestamp: Date.now()
        };
    }
    
    /**
     * Get frequency data for visualization
     */
    getFrequencyData() {
        return this.frequencyData;
    }
    
    /**
     * Get time domain data for waveform visualization
     */
    getTimeDomainData() {
        return this.timeDomainData;
    }
    
    /**
     * Get volume level (0-1)
     */
    getVolume() {
        return this.volume;
    }
    
    /**
     * Get beat detection status
     */
    isBeat() {
        return this.beat;
    }
    
    /**
     * Get spectrum analysis
     */
    getSpectrum() {
        return this.spectrum;
    }
    
    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // Apply settings that affect analysis
        if (this.analyser) {
            if (newSettings.sensitivity !== undefined) {
                // Sensitivity is applied during analysis
            }
            
            if (newSettings.beatDetection !== undefined) {
                this.beat = false; // Reset beat state
            }
        }
    }
    
    /**
     * Set beat detection threshold
     */
    setBeatThreshold(threshold) {
        this.beatThreshold = Math.max(0.1, Math.min(1.0, threshold));
    }
    
    /**
     * Get audio context state
     */
    getState() {
        return {
            isInitialized: !!this.audioContext,
            isActive: this.isActive,
            contextState: this.audioContext ? this.audioContext.state : 'null',
            sampleRate: this.audioContext ? this.audioContext.sampleRate : 0
        };
    }
    
    /**
     * Create audio visualization data
     */
    getVisualizationData() {
        if (!this.isActive) return null;
        
        return {
            frequencyData: Array.from(this.frequencyData),
            timeDomainData: Array.from(this.timeDomainData),
            volume: this.volume,
            spectrum: this.spectrum,
            beat: this.beat,
            pitch: this.pitch
        };
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        this.stop();
        
        if (this.microphone) {
            this.microphone.disconnect();
        }
        
        if (this.analyser) {
            this.analyser.disconnect();
        }
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        
        // Clear callbacks
        this.onBeatDetected = null;
        this.onVolumeChange = null;
        this.onSpectrumUpdate = null;
        this.onError = null;
        
        console.log('Audio processor cleaned up');
    }
}

// Export for use in main application
window.AudioProcessor = AudioProcessor;
