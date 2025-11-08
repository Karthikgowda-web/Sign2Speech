# Advanced Sign to Speech Converter - ML Powered

A comprehensive, production-ready sign language to speech converter using **Neural Networks**, **Machine Learning**, and **Big Data** principles. This system enables full communication for the sign language community.

## 🚀 Features

### Core Capabilities
- **🤖 Neural Network Architecture**: Deep learning model with multiple hidden layers
- **📊 Full ASL Recognition**: Support for complete alphabet (A-Z, 0-9) and custom words
- **🎯 Real-time Recognition**: Live camera feed with instant sign detection
- **🗣️ Text-to-Speech**: High-quality speech synthesis with multiple voices
- **📝 Sentence Building**: Word-by-word composition for complete sentences
- **💾 Model Training**: Built-in data collection and model training system
- **📦 Data Management**: Export/import training data for collaboration

### Technical Features
- **TensorFlow.js**: Browser-based neural network inference
- **MediaPipe Hands**: Advanced hand tracking and landmark detection
- **Feature Extraction**: 126-dimensional feature vectors from hand landmarks
- **Temporal Smoothing**: Prediction history for stable recognition
- **Model Persistence**: Save/load trained models locally
- **Big Data Ready**: Scalable architecture for large datasets

## 📋 Architecture

### Neural Network Model
```
Input Layer (126 features)
    ↓
Dense Layer (128 units, ReLU) + Dropout (0.3)
    ↓
Dense Layer (256 units, ReLU) + Dropout (0.3)
    ↓
Dense Layer (128 units, ReLU) + Dropout (0.2)
    ↓
Output Layer (N classes, Softmax)
```

### Feature Extraction
- **126-dimensional vectors**: 21 landmarks × 2 hands × 3 coordinates (x, y, z)
- **Normalized coordinates**: Relative to wrist position
- **Scale normalization**: Distance-based scaling
- **Geometric features**: Finger distances and angles

### Data Pipeline
1. **Hand Detection** → MediaPipe Hands
2. **Feature Extraction** → Normalized landmark vectors
3. **ML Prediction** → Neural network inference
4. **Temporal Smoothing** → History-based filtering
5. **Text Composition** → Word and sentence building
6. **Speech Synthesis** → Web Speech API

## 🛠️ Setup & Installation

### Quick Start

1. **Clone or download the project**
   ```bash
   cd sign-to-speech-converter
   ```

2. **Start a local server** (choose one):
   
   **Option A: Python**
   ```bash
   python -m http.server 8000
   ```
   
   **Option B: Node.js**
   ```bash
   npx http-server -p 8000
   ```
   
   **Option C: VS Code Live Server**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Requirements
- Modern web browser (Chrome, Edge, Firefox recommended)
- Camera access
- Internet connection (for CDN resources)
- JavaScript enabled

## 📖 Usage Guide

### Recognition Mode

1. **Load or Train Model**
   - Click "Load Model" to use a saved model
   - Or train a new model in Training Mode

2. **Start Camera**
   - Click "Start Camera"
   - Allow camera permissions
   - Position hands in frame

3. **Perform Signs**
   - Show sign language gestures
   - Recognized letters/words appear in real-time
   - Build words and sentences automatically

4. **Build Sentences**
   - Letters form words automatically
   - Click "Add Space" to add words to sentence
   - Use "Backspace" to correct mistakes

5. **Speak Text**
   - Click "Speak Text" to hear the translation
   - Adjust speed and voice as needed

### Training Mode

1. **Collect Training Data**
   - Enter sign label (e.g., "A", "B", "HELLO")
   - Set number of samples (recommended: 50-100)
   - Click "Start Collecting Data"
   - Perform the sign repeatedly until collection completes

2. **Train Model**
   - Collect data for multiple signs (at least 2)
   - Click "Train Model"
   - Wait for training to complete (may take a few minutes)

3. **Save Model**
   - Click "Save Model" to store locally
   - Or "Download Model" to save files

4. **Export/Import Data**
   - Export training data for sharing
   - Import data from other users
   - Collaborate to build larger datasets

## 🎓 Training Best Practices

### Data Collection
- **Minimum samples**: 50 per sign (100+ recommended)
- **Variation**: Perform signs from different angles
- **Lighting**: Ensure good, consistent lighting
- **Background**: Use plain background when possible
- **Hands**: Keep both hands visible when needed

### Model Training
- **Multiple classes**: Train at least 5-10 different signs
- **Balanced data**: Similar number of samples per class
- **Validation**: System uses 20% for validation automatically
- **Epochs**: Default 50 epochs (adjustable in code)

### Improving Accuracy
1. Collect more training data
2. Ensure consistent sign performance
3. Train with diverse lighting conditions
4. Include multiple users in training data
5. Fine-tune model architecture if needed

## 📊 Model Architecture Details

### Input Features
- **Size**: 126 dimensions
- **Source**: MediaPipe hand landmarks (21 per hand)
- **Normalization**: Wrist-relative, scale-normalized
- **Missing hands**: Zero-padded

### Network Layers
- **Layer 1**: 128 units, ReLU, L2 regularization, 30% dropout
- **Layer 2**: 256 units, ReLU, L2 regularization, 30% dropout
- **Layer 3**: 128 units, ReLU, L2 regularization, 20% dropout
- **Output**: N units (one per class), Softmax activation

### Training Parameters
- **Optimizer**: Adam (learning rate: 0.001)
- **Loss**: Categorical Crossentropy
- **Metrics**: Accuracy
- **Batch Size**: 32
- **Epochs**: 50
- **Validation Split**: 20%

## 🔧 Customization

### Adding New Signs
1. Go to Training Mode
2. Enter new sign label
3. Collect samples
4. Retrain model

### Modifying Model Architecture
Edit `ml-model.js`:
```javascript
// Adjust layer sizes, add/remove layers
tf.layers.dense({
    units: 256,  // Change this
    activation: 'relu'
})
```

### Adjusting Recognition Threshold
Edit `app.js`:
```javascript
// Change confidence threshold (currently 0.7)
if (prediction && prediction.confidence > 0.7) {
    // ...
}
```

## 📁 Project Structure

```
sign-to-speech-converter/
├── index.html          # Main HTML structure
├── styles.css          # Styling and layout
├── app.js              # Main application logic
├── ml-model.js         # Neural network model
├── feature-extractor.js # Feature extraction
├── data-collector.js   # Training data management
├── package.json        # Project configuration
└── README.md          # This file
```

## 🌐 Browser Compatibility

- ✅ **Chrome/Edge** (Recommended - best performance)
- ✅ **Firefox** (Full support)
- ✅ **Safari** (Full support)
- ⚠️ **Text-to-Speech**: Varies by browser

## 🚧 Limitations & Future Enhancements

### Current Limitations
- Requires training data collection
- Browser-based (limited by browser memory)
- Single-user training recommended
- Real-time performance depends on hardware

### Planned Enhancements
- [ ] Pre-trained models for common signs
- [ ] Cloud-based model training
- [ ] Multi-sign language support (BSL, etc.)
- [ ] Sentence-level grammar recognition
- [ ] Offline mode with service workers
- [ ] Mobile app version
- [ ] Community model sharing platform
- [ ] Advanced gesture recognition (facial expressions)

## 📝 License

This project is open source and available for educational and commercial use.

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Model architecture optimization
- Additional feature extraction methods
- Pre-trained model weights
- UI/UX enhancements
- Documentation improvements

## 📞 Support

For issues, questions, or contributions:
1. Check existing documentation
2. Review code comments
3. Test with different browsers
4. Collect diverse training data

## 🎯 Use Cases

- **Accessibility**: Enable communication for deaf/hard-of-hearing community
- **Education**: Sign language learning and practice
- **Research**: Sign language recognition studies
- **Integration**: Embed in larger applications
- **Community**: Build shared model databases

---

**Built with ❤️ for the Sign Language Community**
