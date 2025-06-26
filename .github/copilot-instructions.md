<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions for Music Therapy Movement Visualizer

## Project Overview
This is a web-based movement visualization application designed specifically for music therapy sessions with students who have physical and learning disabilities. The application uses MediaPipe Hands for real-time hand tracking and creates interactive visual effects that respond to hand movements and audio input.

## Key Context for AI Assistance

### Target Audience
- **Primary Users**: Students with physical and learning disabilities in music therapy sessions
- **Secondary Users**: Music therapists, occupational therapists, special education teachers
- **Accessibility Requirements**: Must support users with limited mobility, visual impairments, and cognitive differences

### Core Technologies
- **Hand Tracking**: MediaPipe Hands (web-based, no server required)
- **Audio Processing**: Web Audio API for microphone input and beat detection
- **Graphics**: HTML5 Canvas for smooth 60fps visual effects
- **Architecture**: Vanilla JavaScript modules (no frameworks for simplicity and performance)

### Therapeutic Goals
When suggesting code improvements or new features, consider these therapeutic objectives:
1. **Bilateral Coordination**: Activities that encourage both hands working together
2. **Cause and Effect Understanding**: Immediate, clear visual feedback
3. **Motor Skill Development**: Both gross and fine motor skill practice
4. **Sensory Integration**: Multi-modal feedback (visual, audio, movement)
5. **Emotional Expression**: Movement as a form of self-expression
6. **Social Interaction**: Features that can support group activities

### Development Principles

#### Accessibility First
- Always consider users with varying physical abilities
- Provide alternative interaction methods (keyboard, touch, single-hand)
- Use high contrast colors and clear visual indicators
- Implement ARIA labels and semantic HTML
- Ensure compatibility with assistive technologies

#### Performance Critical
- Target 60fps for smooth real-time interactions
- Optimize canvas operations and minimize redraws
- Use efficient algorithms for hand tracking and visual effects
- Consider device limitations (tablets, older hardware)

#### Privacy and Security
- No data collection or storage of personal information
- All processing happens locally in the browser
- No external API calls that could compromise privacy
- Clear permission requests for camera/microphone access

#### Therapeutic Value
- Every feature should have clear therapeutic benefit
- Provide positive reinforcement and encouragement
- Scale difficulty appropriately for different ability levels
- Include progress indicators and achievement systems

### Code Guidelines

#### File Structure
- `app.js`: Main application coordinator
- `modules/handTracking.js`: MediaPipe Hands integration
- `modules/visualEffects.js`: Canvas-based visual effects
- `modules/audioProcessor.js`: Web Audio API processing
- `modules/therapeuticActivities.js`: Specialized therapy exercises

#### Naming Conventions
- Use descriptive names that indicate therapeutic purpose
- Include accessibility considerations in variable names
- Follow camelCase for JavaScript, kebab-case for CSS classes

#### Error Handling
- Provide clear, user-friendly error messages
- Include fallback options for accessibility
- Log technical details for debugging while showing simple messages to users
- Handle camera/microphone permission gracefully

#### Comments
- Explain therapeutic rationale for features
- Document accessibility considerations
- Include performance optimization notes
- Reference relevant research or best practices

### When Adding New Features

#### Questions to Consider
1. How does this benefit users with disabilities?
2. Can this be operated with limited mobility?
3. Is the feedback immediate and clear?
4. Does this scale across different ability levels?
5. How does this integrate with existing therapeutic activities?

#### Testing Considerations
- Test with different hand positions and ranges of motion
- Verify performance on tablets and lower-end devices
- Check accessibility with keyboard-only navigation
- Validate visual clarity in different lighting conditions
- Consider users with tremors or involuntary movements

### Common Patterns

#### Hand Tracking Data Processing
```javascript
// Always check for hand presence and validate data
if (hands && hands.length > 0) {
    for (const hand of hands) {
        // Validate confidence levels
        if (hand.confidence < threshold) continue;
        
        // Apply therapeutic processing
        processTherapeuticMovement(hand);
    }
}
```

#### Visual Feedback
```javascript
// Provide immediate, clear visual feedback
function createVisualFeedback(hand, achievement) {
    // Use high contrast colors
    // Scale effects based on movement
    // Include celebration animations for achievements
}
```

#### Accessibility
```javascript
// Always provide keyboard alternatives
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case ' ': // Spacebar for primary action
        case 'Enter': // Enter for confirmation
        case 'Escape': // Escape for cancel/back
    }
});
```

### Integration Guidelines

#### MediaPipe Hands
- Use confidence thresholds appropriate for therapeutic use
- Implement smoothing for users with tremors
- Support both single and dual hand modes
- Provide clear hand identification (left/right)

#### Web Audio API
- Handle microphone permissions gracefully
- Implement volume and beat detection for rhythm activities
- Provide visual feedback for audio input levels
- Support different audio sources (music, instruments, voice)

#### Canvas Optimization
- Use requestAnimationFrame for smooth animations
- Implement efficient particle systems
- Clear only necessary canvas areas
- Use appropriate blending modes for effects

### Therapeutic Activities Framework
When implementing new therapeutic activities:

1. **Extend TherapeuticActivity base class**
2. **Define clear therapeutic goals**
3. **Implement progressive difficulty levels**
4. **Provide immediate positive feedback**
5. **Track meaningful progress metrics**
6. **Include celebration and achievement systems**

### Browser Compatibility
- Target modern browsers with WebRTC support
- Provide graceful degradation for older browsers
- Test on Chrome, Firefox, Safari, and Edge
- Optimize for tablet and touch interfaces
- Consider mobile device limitations

### Documentation Standards
- Include therapeutic rationale in code comments
- Document accessibility features and keyboard shortcuts
- Provide clear setup instructions for therapists
- Include troubleshooting guides for common issues
- Maintain up-to-date browser compatibility information

Remember: Every line of code should contribute to creating an inclusive, therapeutic experience that empowers users with disabilities to explore movement and creativity through technology.
