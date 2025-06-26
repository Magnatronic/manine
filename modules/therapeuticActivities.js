/**
 * Therapeutic Activities Module
 * Specialized activities and games for music therapy sessions
 */

class TherapeuticActivities {
    constructor(visualEffects, audioProcessor) {
        this.visualEffects = visualEffects;
        this.audioProcessor = audioProcessor;
        
        // Current activity
        this.currentActivity = null;
        this.isActive = false;
        
        // Available activities - initialize with error handling
        this.activities = {};
        
        try {
            this.activities = {
                'bilateral-coordination': new BilateralCoordination(visualEffects),
                'cause-effect': new CauseEffectActivity(visualEffects, audioProcessor),
                'large-movement': new LargeMovementReward(visualEffects),
                'fine-motor': new FineMotorSkills(visualEffects),
                'rhythm-sync': new RhythmSynchronization(visualEffects, audioProcessor),
                'emotional-expression': new EmotionalExpression(visualEffects, audioProcessor)
            };
        } catch (error) {
            console.error('Error initializing therapeutic activities:', error);
            // Initialize with empty activities if there's an error
            this.activities = {};
        }
        
        // Activity settings
        this.settings = {
            difficulty: 'medium', // 'easy', 'medium', 'hard'
            encouragementLevel: 'high', // 'low', 'medium', 'high'
            adaptiveMode: true,
            sessionTime: 0,
            celebrationIntensity: 'medium'
        };
        
        // Progress tracking
        this.sessionData = {
            startTime: null,
            activities: [],
            achievements: [],
            totalMovements: 0,
            bilateralCoordination: 0,
            largeMovements: 0,
            fineMovements: 0
        };
        
        // Callbacks
        this.onAchievement = null;
        this.onProgressUpdate = null;
    }
    
    /**
     * Start a therapeutic activity
     */
    startActivity(activityName, customSettings = {}) {
        if (this.activities[activityName]) {
            // Stop current activity
            this.stopActivity();
            
            // Start new activity
            this.currentActivity = this.activities[activityName];
            this.currentActivity.start({ ...this.settings, ...customSettings });
            this.isActive = true;
            
            // Track session data
            if (!this.sessionData.startTime) {
                this.sessionData.startTime = Date.now();
            }
            
            this.sessionData.activities.push({
                name: activityName,
                startTime: Date.now(),
                settings: { ...this.settings, ...customSettings }
            });
            
            console.log(`Started therapeutic activity: ${activityName}`);
            return true;
        }
        
        console.error(`Unknown activity: ${activityName}`);
        return false;
    }
    
    /**
     * Stop current activity
     */
    stopActivity() {
        if (this.currentActivity && this.isActive) {
            this.currentActivity.stop();
            
            // Update session data
            const currentActivityData = this.sessionData.activities[this.sessionData.activities.length - 1];
            if (currentActivityData) {
                currentActivityData.endTime = Date.now();
                currentActivityData.duration = currentActivityData.endTime - currentActivityData.startTime;
            }
            
            this.isActive = false;
            this.currentActivity = null;
            
            console.log('Stopped therapeutic activity');
        }
    }
    
    /**
     * Process hand data for therapeutic activities
     */
    processHands(hands) {
        if (!this.isActive || !this.currentActivity) return;
        
        // Update total movements
        this.sessionData.totalMovements += hands.length;
        
        // Let current activity process the hands
        const activityResult = this.currentActivity.processHands(hands);
        
        // Check for achievements
        if (activityResult && activityResult.achievement) {
            this.handleAchievement(activityResult.achievement);
        }
        
        // Update progress
        if (activityResult && activityResult.progress) {
            this.updateProgress(activityResult.progress);
        }
    }
    
    /**
     * Handle achievement events
     */
    handleAchievement(achievement) {
        this.sessionData.achievements.push({
            ...achievement,
            timestamp: Date.now()
        });
        
        // Trigger celebration effect
        this.triggerCelebration(achievement);
        
        // Callback
        if (this.onAchievement) {
            this.onAchievement(achievement);
        }
        
        console.log('Achievement unlocked:', achievement.name);
    }
    
    /**
     * Update progress tracking
     */
    updateProgress(progress) {
        // Update specific progress counters
        if (progress.bilateral) {
            this.sessionData.bilateralCoordination += progress.bilateral;
        }
        if (progress.largeMovement) {
            this.sessionData.largeMovements += progress.largeMovement;
        }
        if (progress.fineMovement) {
            this.sessionData.fineMovements += progress.fineMovement;
        }
        
        // Callback
        if (this.onProgressUpdate) {
            this.onProgressUpdate(this.sessionData);
        }
    }
    
    /**
     * Trigger celebration visual effects
     */
    triggerCelebration(achievement) {
        const intensity = this.settings.celebrationIntensity;
        
        // Create celebration particles
        for (let i = 0; i < (intensity === 'high' ? 50 : intensity === 'medium' ? 30 : 15); i++) {
            const x = Math.random() * this.visualEffects.width;
            const y = Math.random() * this.visualEffects.height;
            
            this.visualEffects.createParticle(x, y, {
                center: { x: x / this.visualEffects.width, y: y / this.visualEffects.height },
                velocity: { x: 0, y: 0, magnitude: 1 }
            });
        }
        
        // Flash effect
        this.visualEffects.ctx.globalCompositeOperation = 'lighter';
        this.visualEffects.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.visualEffects.ctx.fillRect(0, 0, this.visualEffects.width, this.visualEffects.height);
    }
    
    /**
     * Get available activities
     */
    getAvailableActivities() {
        return Object.keys(this.activities).map(name => ({
            name,
            displayName: this.activities[name].getDisplayName(),
            description: this.activities[name].getDescription(),
            difficulty: this.activities[name].getDifficulty(),
            therapeutic_goals: this.activities[name].getTherapeuticGoals()
        }));
    }
    
    /**
     * Get current activity status
     */
    getCurrentActivityStatus() {
        if (!this.isActive || !this.currentActivity) {
            return { active: false };
        }
        
        return {
            active: true,
            name: this.currentActivity.getName(),
            status: this.currentActivity.getStatus(),
            progress: this.currentActivity.getProgress()
        };
    }
    
    /**
     * Get session summary
     */
    getSessionSummary() {
        const now = Date.now();
        const sessionDuration = this.sessionData.startTime ? now - this.sessionData.startTime : 0;
        
        return {
            ...this.sessionData,
            sessionDuration,
            activitiesCompleted: this.sessionData.activities.filter(a => a.endTime).length,
            achievementsCount: this.sessionData.achievements.length,
            averageMovementsPerMinute: sessionDuration > 0 ? 
                (this.sessionData.totalMovements / (sessionDuration / 60000)) : 0
        };
    }
    
    /**
     * Update activity settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        if (this.currentActivity && this.isActive) {
            this.currentActivity.updateSettings(this.settings);
        }
    }
    
    /**
     * Reset session data
     */
    resetSession() {
        this.sessionData = {
            startTime: null,
            activities: [],
            achievements: [],
            totalMovements: 0,
            bilateralCoordination: 0,
            largeMovements: 0,
            fineMovements: 0
        };
    }
}

/**
 * Base class for therapeutic activities
 */
class TherapeuticActivity {
    constructor(visualEffects, audioProcessor = null) {
        this.visualEffects = visualEffects;
        this.audioProcessor = audioProcessor;
        this.isActive = false;
        this.settings = {};
        this.progress = {};
    }
    
    start(settings = {}) {
        this.settings = settings;
        this.isActive = true;
        this.progress = {};
    }
    
    stop() {
        this.isActive = false;
    }
    
    processHands(hands) {
        // Override in subclasses
        return null;
    }
    
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }
    
    getName() { return 'base-activity'; }
    getDisplayName() { return 'Base Activity'; }
    getDescription() { return 'Base therapeutic activity'; }
    getDifficulty() { return 'medium'; }
    getTherapeuticGoals() { return []; }
    getStatus() { return this.isActive ? 'active' : 'inactive'; }
    getProgress() { return this.progress; }
}

/**
 * Bilateral Coordination Activity
 */
class BilateralCoordination extends TherapeuticActivity {
    constructor(visualEffects) {
        super(visualEffects);
        this.targetDistance = 0.3; // Target distance between hands
        this.tolerance = 0.1;
        this.successCount = 0;
        this.requiredSuccess = 10;
    }
    
    getName() { return 'bilateral-coordination'; }
    getDisplayName() { return 'Bilateral Coordination'; }
    getDescription() { return 'Practice using both hands together in coordinated movements'; }
    getTherapeuticGoals() { return ['bilateral coordination', 'motor planning', 'crossing midline']; }
    
    processHands(hands) {
        if (hands.length !== 2) return null;
        
        const leftHand = hands.find(h => h.label === 'left');
        const rightHand = hands.find(h => h.label === 'right');
        
        if (!leftHand || !rightHand) return null;
        
        // Calculate distance between hands
        const distance = Math.sqrt(
            Math.pow(leftHand.center.x - rightHand.center.x, 2) +
            Math.pow(leftHand.center.y - rightHand.center.y, 2)
        );
        
        // Check if hands are at target distance
        const isCoordinated = Math.abs(distance - this.targetDistance) < this.tolerance;
        
        if (isCoordinated) {
            this.successCount++;
            
            // Visual feedback for successful coordination
            this.visualEffects.ctx.strokeStyle = '#00ff00';
            this.visualEffects.ctx.lineWidth = 5;
            this.visualEffects.ctx.beginPath();
            this.visualEffects.ctx.moveTo(
                leftHand.center.x * this.visualEffects.width,
                leftHand.center.y * this.visualEffects.height
            );
            this.visualEffects.ctx.lineTo(
                rightHand.center.x * this.visualEffects.width,
                rightHand.center.y * this.visualEffects.height
            );
            this.visualEffects.ctx.stroke();
            
            // Check for achievement
            if (this.successCount >= this.requiredSuccess) {
                this.successCount = 0;
                return {
                    achievement: {
                        name: 'Bilateral Coordination Master',
                        description: 'Successfully coordinated both hands!',
                        type: 'bilateral'
                    },
                    progress: { bilateral: 1 }
                };
            }
        }
        
        this.progress = {
            distance: distance,
            target: this.targetDistance,
            successCount: this.successCount,
            required: this.requiredSuccess
        };
        
        return { progress: { bilateral: isCoordinated ? 0.1 : 0 } };
    }
}

/**
 * Cause and Effect Activity
 */
class CauseEffectActivity extends TherapeuticActivity {
    constructor(visualEffects, audioProcessor) {
        super(visualEffects, audioProcessor);
        this.effectsTriggered = 0;
        this.lastEffectTime = 0;
        this.minEffectInterval = 500; // ms
    }
    
    getName() { return 'cause-effect'; }
    getDisplayName() { return 'Cause and Effect'; }
    getDescription() { return 'Clear visual feedback for every movement to understand cause and effect'; }
    getTherapeuticGoals() { return ['cause and effect understanding', 'motor motivation', 'visual tracking']; }
    
    processHands(hands) {
        const now = Date.now();
        
        if (hands.length > 0 && now - this.lastEffectTime > this.minEffectInterval) {
            // Trigger immediate visual effect
            for (const hand of hands) {
                const x = hand.center.x * this.visualEffects.width;
                const y = hand.center.y * this.visualEffects.height;
                
                // Create ripple effect
                this.createRippleEffect(x, y, hand.velocity.magnitude);
            }
            
            this.effectsTriggered++;
            this.lastEffectTime = now;
            
            if (this.effectsTriggered % 25 === 0) {
                return {
                    achievement: {
                        name: 'Cause and Effect Explorer',
                        description: 'Discovered the power of movement!',
                        type: 'exploration'
                    }
                };
            }
        }
        
        return null;
    }
    
    createRippleEffect(x, y, intensity) {
        const ctx = this.visualEffects.ctx;
        const maxRadius = 100 * intensity;
        
        ctx.strokeStyle = `rgba(78, 205, 196, ${0.8 - intensity * 0.3})`;
        ctx.lineWidth = 3;
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                ctx.beginPath();
                ctx.arc(x, y, (i + 1) * maxRadius / 3, 0, Math.PI * 2);
                ctx.stroke();
            }, i * 100);
        }
    }
}

/**
 * Large Movement Reward Activity
 */
class LargeMovementReward extends TherapeuticActivity {
    constructor(visualEffects) {
        super(visualEffects);
        this.movementThreshold = 0.05;
        this.largeMovements = 0;
        this.rewardInterval = 5;
    }
    
    getName() { return 'large-movement'; }
    getDisplayName() { return 'Large Movement Rewards'; }
    getDescription() { return 'Big movements create bigger, more dramatic visual effects'; }
    getTherapeuticGoals() { return ['gross motor skills', 'range of motion', 'movement motivation']; }
    
    processHands(hands) {
        for (const hand of hands) {
            if (hand.velocity.magnitude > this.movementThreshold) {
                this.largeMovements++;
                
                // Scale visual effects based on movement size
                const scaleFactor = Math.min(hand.velocity.magnitude * 5, 3);
                const originalBrushSize = this.visualEffects.brushSize;
                
                this.visualEffects.brushSize = originalBrushSize * scaleFactor;
                
                // Reset after a frame
                setTimeout(() => {
                    this.visualEffects.brushSize = originalBrushSize;
                }, 16);
                
                if (this.largeMovements % this.rewardInterval === 0) {
                    return {
                        achievement: {
                            name: 'Movement Master',
                            description: 'Amazing large movements!',
                            type: 'large-movement'
                        },
                        progress: { largeMovement: 1 }
                    };
                }
            }
        }
        
        return null;
    }
}

/**
 * Fine Motor Skills Activity
 */
class FineMotorSkills extends TherapeuticActivity {
    constructor(visualEffects) {
        super(visualEffects);
        this.precisionThreshold = 0.02;
        this.preciseMovements = 0;
        this.targetReached = 0;
    }
    
    getName() { return 'fine-motor'; }
    getDisplayName() { return 'Fine Motor Skills'; }
    getDescription() { return 'Practice precise, controlled movements for detailed work'; }
    getTherapeuticGoals() { return ['fine motor control', 'precision', 'hand stability']; }
    
    processHands(hands) {
        for (const hand of hands) {
            // Detect precise, controlled movements
            if (hand.velocity.magnitude < this.precisionThreshold && hand.velocity.magnitude > 0) {
                this.preciseMovements++;
                
                // Visual feedback for precision
                const x = hand.center.x * this.visualEffects.width;
                const y = hand.center.y * this.visualEffects.height;
                
                this.visualEffects.ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
                this.visualEffects.ctx.beginPath();
                this.visualEffects.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.visualEffects.ctx.fill();
                
                if (this.preciseMovements % 20 === 0) {
                    return {
                        achievement: {
                            name: 'Precision Master',
                            description: 'Excellent fine motor control!',
                            type: 'fine-motor'
                        },
                        progress: { fineMovement: 1 }
                    };
                }
            }
        }
        
        return null;
    }
}

/**
 * Rhythm Synchronization Activity
 */
class RhythmSynchronization extends TherapeuticActivity {
    constructor(visualEffects, audioProcessor) {
        super(visualEffects, audioProcessor);
        this.beatMatches = 0;
        this.lastBeatTime = 0;
        this.syncWindow = 200; // ms window for beat matching
    }
    
    getName() { return 'rhythm-sync'; }
    getDisplayName() { return 'Rhythm Synchronization'; }
    getDescription() { return 'Move in time with the music and rhythm'; }
    getTherapeuticGoals() { return ['rhythm awareness', 'timing', 'auditory processing']; }
    
    processHands(hands) {
        if (!this.audioProcessor || !this.audioProcessor.isActive) return null;
        
        const now = Date.now();
        const audioFeatures = this.audioProcessor.getAudioFeatures();
        
        if (audioFeatures.beat && hands.length > 0) {
            // Check if hand movement coincides with beat
            for (const hand of hands) {
                if (hand.velocity.magnitude > 0.03) {
                    const timeDiff = Math.abs(now - this.lastBeatTime);
                    
                    if (timeDiff < this.syncWindow) {
                        this.beatMatches++;
                        
                        // Visual feedback for rhythm match
                        const x = hand.center.x * this.visualEffects.width;
                        const y = hand.center.y * this.visualEffects.height;
                        
                        this.visualEffects.ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
                        this.visualEffects.ctx.beginPath();
                        this.visualEffects.ctx.arc(x, y, 20, 0, Math.PI * 2);
                        this.visualEffects.ctx.fill();
                        
                        if (this.beatMatches % 10 === 0) {
                            return {
                                achievement: {
                                    name: 'Rhythm Master',
                                    description: 'Perfect timing with the music!',
                                    type: 'rhythm'
                                }
                            };
                        }
                    }
                }
            }
            
            this.lastBeatTime = now;
        }
        
        return null;
    }
}

/**
 * Emotional Expression Activity
 */
class EmotionalExpression extends TherapeuticActivity {
    constructor(visualEffects, audioProcessor) {
        super(visualEffects, audioProcessor);
        this.expressions = 0;
        this.moodColors = {
            calm: '#4ecdc4',
            energetic: '#ff6b6b',
            happy: '#feca57',
            focused: '#45b7d1'
        };
    }
    
    getName() { return 'emotional-expression'; }
    getDisplayName() { return 'Emotional Expression'; }
    getDescription() { return 'Express emotions through movement and see them come alive'; }
    getTherapeuticGoals() { return ['emotional expression', 'self-awareness', 'mood regulation']; }
    
    processHands(hands) {
        for (const hand of hands) {
            // Interpret movement style as emotional expression
            let mood = 'calm';
            
            if (hand.velocity.magnitude > 0.1) {
                mood = 'energetic';
            } else if (hand.gestures.isOpen) {
                mood = 'happy';
            } else if (hand.velocity.magnitude < 0.02) {
                mood = 'focused';
            }
            
            // Change colors based on detected mood
            this.visualEffects.ctx.strokeStyle = this.moodColors[mood];
            this.expressions++;
            
            if (this.expressions % 30 === 0) {
                return {
                    achievement: {
                        name: 'Emotional Artist',
                        description: 'Beautiful emotional expression through movement!',
                        type: 'emotional'
                    }
                };
            }
        }
        
        return null;
    }
}

// Export for use in main application
window.TherapeuticActivities = TherapeuticActivities;
window.TherapeuticActivity = TherapeuticActivity;
window.BilateralCoordination = BilateralCoordination;
window.CauseEffectActivity = CauseEffectActivity;
window.LargeMovementReward = LargeMovementReward;
window.FineMotorSkills = FineMotorSkills;
window.RhythmSynchronization = RhythmSynchronization;
window.EmotionalExpression = EmotionalExpression;
