# Little Hands

A web-based movement visualization application designed specifically for music therapy sessions with students who have physical and learning disabilities. The app uses MediaPipe Hands for real-time hand tracking and creates interactive visual effects that respond to hand movements and audio input.

## Features

### Core Functionality
- **Real-time Hand Tracking**: Uses MediaPipe Hands for smooth, accurate hand detection
- **Multiple Visual Modes**: Drawing, particles, and shape manipulation
- **Audio Responsiveness**: Microphone input creates visual effects synchronized with music
- **Accessibility Focused**: Designed for students with varying physical abilities

### Therapeutic Features
- **Bilateral Coordination**: Activities that encourage both hands working together
- **Cause and Effect**: Immediate visual feedback for every movement
- **Large Movement Rewards**: Bigger gestures create more dramatic effects
- **Fine Motor Support**: Precision activities for detailed control
- **Rhythm Synchronization**: Visual effects that sync with music beats
- **Emotional Expression**: Movement interpretation for self-awareness

### Accessibility Features
- **Single Hand Mode**: For users with limited mobility
- **Adjustable Sensitivity**: Customizable movement thresholds
- **Movement Zones**: Define active areas within camera range
- **High Contrast Support**: Enhanced visibility options
- **Keyboard Navigation**: Full keyboard accessibility
- **Touch-Friendly UI**: Optimized for tablets and touch screens

## Technology Stack

- **Hand Tracking**: MediaPipe Hands
- **Audio Processing**: Web Audio API
- **Graphics**: HTML5 Canvas
- **UI Framework**: Vanilla JavaScript (lightweight and fast)
- **Deployment**: GitHub Pages ready

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/music-therapy-app.git
   cd music-therapy-app
   ```

2. **Open in a web server**
   - For development: Use VS Code Live Server extension
   - For production: Deploy to any web server

3. **Access the application**
   - Open `index.html` in a modern web browser
   - Allow camera and microphone permissions when prompted

## Usage Instructions

### Getting Started
1. Click "Start Camera" to begin hand tracking
2. Allow camera access when prompted
3. Hold your hands in front of the camera (2m distance recommended)
4. Move your hands to create visual effects

### Controls
- **Space Bar**: Toggle camera on/off
- **C Key**: Clear canvas
- **S Key**: Toggle settings panel
- **Settings Icon**: Open/close settings panel

### Visual Modes
- **Drawing Mode**: Hand movements leave colorful trails
- **Particle Mode**: Movements generate flowing particle effects
- **Shape Mode**: Hand gestures create different geometric shapes

### Therapeutic Activities
Access specialized activities through the application interface:
- **Bilateral Coordination**: Practice using both hands together
- **Cause and Effect**: Clear visual feedback for understanding
- **Large Movement Rewards**: Encouragement for gross motor skills
- **Fine Motor Skills**: Precision exercises for detailed control
- **Rhythm Synchronization**: Move in time with music
- **Emotional Expression**: Express feelings through movement

## Configuration

### Hand Tracking Settings
- **Sensitivity**: Adjust movement detection threshold
- **Single/Dual Hand Mode**: Choose based on user capabilities
- **Movement Zones**: Define active screen areas
- **Smoothing**: Enable/disable position smoothing

### Visual Settings
- **Brush Size**: Size of drawing trails
- **Trail Length**: How long trails persist
- **Color Modes**: Rainbow, speed-based, position-based, audio-responsive
- **Symmetry Mode**: Mirror movements for bilateral coordination

### Audio Settings
- **Enable Audio Input**: Turn microphone processing on/off
- **Beat Detection**: Sync visual effects with music rhythm
- **Volume Sensitivity**: Adjust audio response levels

## Development

### Project Structure
```
music-therapy-app/
├── index.html              # Main HTML file
├── app.js                  # Main application logic
├── styles.css              # Styling and responsive design
├── modules/
│   ├── handTracking.js     # MediaPipe Hands integration
│   ├── visualEffects.js    # Canvas-based visual effects
│   ├── audioProcessor.js   # Web Audio API processing
│   └── therapeuticActivities.js # Specialized therapy activities
├── assets/                 # Images and other assets
└── docs/                   # Documentation
```

### Key Classes
- **HandTracker**: Manages MediaPipe Hands integration
- **VisualEffects**: Handles canvas drawing and animations
- **AudioProcessor**: Processes microphone input and beat detection
- **TherapeuticActivities**: Implements specialized therapy exercises
- **MusicTherapyApp**: Main application coordinator

### Development Guidelines
- **Accessibility First**: Always consider users with disabilities
- **Performance**: Maintain 60fps for smooth interactions
- **Privacy**: No data collection or storage
- **Offline Capable**: Works without internet after initial load

## Browser Requirements

### Supported Browsers
- Chrome 80+ (recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

### Required Features
- WebRTC (camera access)
- Web Audio API (microphone access)
- HTML5 Canvas
- ES6 JavaScript support

### Recommended Hardware
- **Camera**: Built-in webcam or external USB camera
- **Microphone**: Built-in or external microphone
- **Display**: Tablet or laptop screen (projection compatible)
- **Processor**: Modern CPU for real-time processing

## Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via `https://yourusername.github.io/music-therapy-app`

### Web Server
1. Upload files to any web server
2. Ensure HTTPS for camera/microphone access
3. No server-side processing required

### Local Development
1. Use VS Code with Live Server extension
2. Or run `python -m http.server` in project directory
3. Access via `http://localhost:5500` or similar

## Privacy and Security

- **No Data Storage**: No personal data is collected or stored
- **Local Processing**: All hand tracking and audio analysis happens locally
- **Secure Connections**: HTTPS required for camera/microphone access
- **Permission-Based**: Users must explicitly grant camera/microphone access

## Troubleshooting

### Camera Issues
- Check browser permissions for camera access
- Ensure no other applications are using the camera
- Try refreshing the page and re-granting permissions
- Test with different browsers

### Performance Issues
- Close other browser tabs and applications
- Lower video resolution in browser settings
- Disable unnecessary visual effects
- Use Chrome for best performance

### Hand Tracking Issues
- Ensure good lighting conditions
- Keep hands within 2-meter range of camera
- Avoid busy backgrounds
- Clean camera lens

## Contributing

### Bug Reports
1. Check existing issues first
2. Provide detailed description and steps to reproduce
3. Include browser version and device information
4. Add screenshots or videos if helpful

### Feature Requests
1. Describe the therapeutic benefit
2. Consider accessibility implications
3. Provide use case examples
4. Suggest implementation approach

### Code Contributions
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Test thoroughly
5. Submit pull request with detailed description

## License

MIT License - see LICENSE file for details

## Acknowledgments

- **MediaPipe Team**: For excellent hand tracking technology
- **Music Therapists**: For guidance on therapeutic requirements
- **Accessibility Community**: For invaluable feedback and testing
- **Web Audio API Community**: For audio processing insights

## Support

For questions, issues, or feature requests:
- Create GitHub issues for bugs and features
- Contact project maintainers for therapy-specific questions
- Check documentation for common problems

## Version History

### v1.0.0 (Current)
- Initial release with core hand tracking
- Basic visual effects (drawing, particles, shapes)
- Audio integration with beat detection
- Therapeutic activities framework
- Accessibility features and keyboard navigation
- Mobile/tablet optimization

### Planned Features
- More therapeutic activities and games
- Progress tracking and session reports
- Customizable difficulty levels
- Multi-user support for group sessions
- Integration with therapy planning tools
