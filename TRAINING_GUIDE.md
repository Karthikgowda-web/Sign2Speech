# Training Guide - Sign Language Model

## Quick Start Training

### Step 1: Prepare Your Environment
1. Open the application in your browser
2. Ensure good lighting
3. Position camera at eye level
4. Use a plain background (optional but recommended)

### Step 2: Collect Training Data

#### For ASL Alphabet (A-Z)
1. Switch to **Training Mode**
2. Enter letter label (e.g., "A")
3. Set samples to **50-100** (more = better accuracy)
4. Click **"Start Collecting Data"**
5. Perform the sign consistently
6. Vary slightly (different angles, distances)
7. Wait for collection to complete
8. Repeat for each letter you want to recognize

#### For Words (HELLO, THANK YOU, etc.)
1. Enter word label (e.g., "HELLO")
2. Set samples to **100-200** (words are more complex)
3. Perform the complete word sign
4. Maintain consistent timing
5. Collect samples from different angles

### Step 3: Train the Model
1. After collecting data for **at least 2 signs**
2. Click **"Train Model"**
3. Wait for training to complete (2-5 minutes)
4. Model will auto-save when done

### Step 4: Test Recognition
1. Switch to **Recognition Mode**
2. Click **"Load Model"** (if not auto-loaded)
3. Start camera
4. Perform trained signs
5. Check recognition accuracy

## Best Practices

### Data Collection
- ✅ **Consistency**: Perform signs the same way each time
- ✅ **Variation**: Slight variations help model generalize
- ✅ **Lighting**: Consistent, good lighting
- ✅ **Distance**: Maintain similar distance from camera
- ✅ **Hands**: Keep both hands visible when needed
- ❌ **Avoid**: Extreme angles, poor lighting, occlusions

### Training Tips
- **Minimum**: 2 classes, 50 samples each
- **Recommended**: 10+ classes, 100+ samples each
- **Optimal**: 26 classes (A-Z), 150+ samples each
- **Balance**: Similar number of samples per class

### Improving Accuracy
1. **More Data**: Collect more samples per sign
2. **Better Data**: Ensure consistent, clear signs
3. **More Classes**: Train on more signs simultaneously
4. **Retraining**: Add more data and retrain
5. **Fine-tuning**: Adjust model architecture if needed

## Training Workflow Example

### Day 1: Basic Alphabet
```
1. Collect A, B, C (50 samples each)
2. Train model
3. Test recognition
4. If good, continue; if not, collect more samples
```

### Day 2: Expand Alphabet
```
1. Collect D, E, F, G, H (50 samples each)
2. Import previous training data
3. Add new data
4. Retrain model
5. Test on all letters
```

### Day 3: Words
```
1. Collect HELLO, THANK YOU, PLEASE (100 samples each)
2. Import alphabet data
3. Add word data
4. Retrain model
5. Test complete system
```

## Data Management

### Exporting Data
- Click **"Export Training Data"**
- Saves as JSON file
- Share with others for collaboration
- Backup your training data regularly

### Importing Data
- Click **"Import Training Data"**
- Select JSON file
- Data merges with existing data
- Retrain model after importing

### Model Management
- **Save Model**: Stores in browser (IndexedDB)
- **Download Model**: Saves model files locally
- **Load Model**: Loads from browser storage

## Troubleshooting

### Low Recognition Accuracy
- **Problem**: Model not recognizing signs correctly
- **Solution**: 
  - Collect more training samples
  - Ensure consistent sign performance
  - Check lighting and camera position
  - Retrain with more data

### Training Fails
- **Problem**: Model training errors
- **Solution**:
  - Ensure at least 2 classes with data
  - Check browser console for errors
  - Try with fewer samples first
  - Clear browser cache and retry

### Slow Performance
- **Problem**: Recognition is slow
- **Solution**:
  - Reduce model complexity (edit ml-model.js)
  - Use fewer classes
  - Close other browser tabs
  - Use a more powerful device

## Advanced Training

### Custom Model Architecture
Edit `ml-model.js` to modify:
- Layer sizes
- Number of layers
- Dropout rates
- Learning rate
- Batch size
- Number of epochs

### Feature Engineering
Edit `feature-extractor.js` to add:
- Additional geometric features
- Temporal features (if using video)
- Hand shape descriptors
- Motion features

### Collaborative Training
1. Multiple users collect data
2. Export individual datasets
3. Combine into one dataset
4. Train shared model
5. Distribute trained model

## Expected Results

### With 50 samples per class (10 classes)
- Accuracy: ~70-80%
- Recognition: Good for basic signs
- Speed: Real-time

### With 100 samples per class (26 classes)
- Accuracy: ~85-90%
- Recognition: Excellent for alphabet
- Speed: Real-time

### With 200+ samples per class (26+ classes)
- Accuracy: ~90-95%
- Recognition: Production-ready
- Speed: Real-time

## Next Steps

After training a basic model:
1. Test extensively
2. Collect more data for low-accuracy signs
3. Add more signs/words
4. Fine-tune architecture if needed
5. Deploy for community use

---

**Remember**: Quality training data is more important than quantity. Focus on consistent, clear signs!

