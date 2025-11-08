# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Start the Server
```bash
cd sign-to-speech-converter
python -m http.server 8000
```

### 2. Open in Browser
Navigate to: `http://localhost:8000`

### 3. First Time Setup

#### Option A: Train Your Own Model (Recommended)
1. Click **"Training Mode"**
2. Enter sign label: **"A"**
3. Set samples: **50**
4. Click **"Start Camera"**
5. Click **"Start Collecting Data"**
6. Perform the "A" sign 50 times
7. Repeat for **"B"** (at least 2 signs needed)
8. Click **"Train Model"**
9. Wait 2-5 minutes for training
10. Switch to **"Recognition Mode"**
11. Click **"Load Model"**
12. Start signing!

#### Option B: Use Pre-trained Model (If Available)
1. Click **"Recognition Mode"**
2. Click **"Load Model"**
3. If model exists, it will load automatically
4. Click **"Start Camera"**
5. Start signing!

### 4. Using Recognition Mode
- **Show signs** → Letters appear automatically
- **Build words** → Letters combine into words
- **Add space** → Add word to sentence
- **Speak** → Click "Speak Text" to hear

## 📋 Minimum Requirements

- **Training**: 2 signs, 50 samples each
- **Basic Use**: 5-10 signs, 100 samples each
- **Production**: 26 signs (A-Z), 150+ samples each

## 🎯 Quick Tips

1. **Good Lighting**: Essential for accuracy
2. **Consistent Signs**: Same gesture each time
3. **Camera Position**: Eye level, 2-3 feet away
4. **Both Hands**: Keep visible when needed
5. **Patience**: Training takes time but improves accuracy

## ⚡ Common Commands

```bash
# Start server (Python)
python -m http.server 8000

# Start server (Node.js)
npx http-server -p 8000

# View in browser
http://localhost:8000
```

## 🆘 Troubleshooting

**Camera not working?**
- Check browser permissions
- Try different browser (Chrome recommended)
- Check camera is not in use by another app

**Model not loading?**
- Train a model first in Training Mode
- Check browser console for errors
- Clear browser cache and retry

**Low accuracy?**
- Collect more training samples
- Ensure consistent sign performance
- Check lighting conditions

## 📚 Next Steps

1. Read `README.md` for full documentation
2. Read `TRAINING_GUIDE.md` for detailed training
3. Start collecting data for your signs
4. Train and improve your model
5. Share with the community!

---

**Ready to go!** Start with 2-3 signs, then expand as you get comfortable.

