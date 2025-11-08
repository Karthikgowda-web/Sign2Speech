// Main Application - Sign to Speech Converter with ML
let camera = null;
let hands = null;
let isRunning = false;
let currentMode = 'recognition'; // 'recognition' or 'training'

// ML Components
let mlModel = null;
let featureExtractor = null;
let dataCollector = null;

// Recognition state
let currentWord = '';
let currentSentence = '';
let lastPrediction = null;
let predictionHistory = [];

// Speech synthesis
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// ASL Alphabet
const ASL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

// Initialize application (called after all scripts are loaded)
function initializeApp() {
    try {
        // Show loading message
        if (typeof updateStatus === 'function') {
            updateStatus('Initializing application...');
        }
        
        // Initialize components with delays to prevent blocking
        setTimeout(() => {
            try {
                initializeComponents();
                setupEventListeners();
                loadVoices();
                initializeAlphabetDisplay();
                
                // Load saved data after a brief delay
                setTimeout(() => {
                    try {
                        loadSavedData();
                        if (typeof updateStatus === 'function') {
                            updateStatus('Ready! Switch to Training Mode to import Excel or collect data.');
                        }
                    } catch (error) {
                        console.error('Error loading saved data:', error);
                    }
                }, 500);
                
                if (speechSynthesis && speechSynthesis.onvoiceschanged !== undefined) {
                    speechSynthesis.onvoiceschanged = loadVoices;
                }
                
                // Force reload voices after a delay (some browsers load voices asynchronously)
                setTimeout(() => {
                    loadVoices();
                }, 1000);
            } catch (error) {
                console.error('Initialization error:', error);
                alert('Error initializing application. Please refresh the page.');
            }
        }, 100);
    } catch (error) {
        console.error('App initialization error:', error);
    }
}

// Note: initializeApp will be called by loader.js after all scripts are loaded
// This prevents double initialization

// Initialize ML components
function initializeComponents() {
    mlModel = new SignLanguageModel();
    featureExtractor = new FeatureExtractor();
    dataCollector = new DataCollector();
    
    console.log('ML components initialized');
}

// Initialize MediaPipe Hands
function initializeMediaPipe() {
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onHandResults);
}

// Handle hand detection results
function onHandResults(results) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('video');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks) {
        // Draw hand landmarks
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
            });
            drawLandmarks(ctx, landmarks, {
                color: '#FF0000',
                lineWidth: 1,
                radius: 3
            });
        }
        
        // Process based on mode
        if (currentMode === 'recognition') {
            processRecognition(results.multiHandLandmarks);
        } else if (currentMode === 'training') {
            processTraining(results.multiHandLandmarks);
        }
    } else {
        updateStatus('No hands detected');
        updateConfidence('');
    }
    
    ctx.restore();
}

// Process recognition mode
async function processRecognition(landmarks) {
    if (!mlModel || !mlModel.model) {
        updateStatus('⚠️ No model loaded. Switch to Training Mode to train a model first!');
        showTrainingPrompt();
        return;
    }

    try {
        // Extract features
        const features = featureExtractor.extractFeatures(landmarks);
        
        // Predict
        const prediction = await mlModel.predict(features);
        
        if (prediction && prediction.confidence > 0.7) {
            updatePrediction(prediction);
        } else {
            updateConfidence('Low confidence');
        }
    } catch (error) {
        console.error('Recognition error:', error);
    }
}

// Update prediction display
function updatePrediction(prediction) {
    if (!prediction) return;

    const confidencePercent = (prediction.confidence * 100).toFixed(1);
    updateConfidence(`Confidence: ${confidencePercent}%`);
    
    // Use temporal smoothing
    predictionHistory.push(prediction);
    if (predictionHistory.length > 10) {
        predictionHistory.shift();
    }
    
    // Get most common prediction in recent history
    const recentPredictions = predictionHistory.slice(-5);
    const predictionCounts = {};
    recentPredictions.forEach(p => {
        const key = p.className;
        predictionCounts[key] = (predictionCounts[key] || 0) + 1;
    });
    
    const mostCommon = Object.keys(predictionCounts).reduce((a, b) => 
        predictionCounts[a] > predictionCounts[b] ? a : b
    );
    
    if (mostCommon && mostCommon !== currentWord) {
        currentWord = mostCommon;
        updateWordDisplay(currentWord);
        updateAlphabetHighlight(mostCommon);
    }
}

// Process training mode
function processTraining(landmarks) {
    if (!dataCollector.isCollecting) {
        return;
    }

    const features = featureExtractor.extractFeatures(landmarks);
    const added = dataCollector.addSample(features);
    
    if (added) {
        const progress = dataCollector.getProgress();
        updateTrainingProgress(progress, dataCollector.samplesCollected, dataCollector.targetSamples);
        
        if (dataCollector.isCollectionComplete()) {
            dataCollector.stopCollection();
            updateStatus(`✅ Collection complete! Collected ${dataCollector.targetSamples} samples for "${dataCollector.currentLabel}".`);
            document.getElementById('startTrainingBtn').disabled = false;
            
            const stats = dataCollector.getStatistics();
            if (stats.numClasses >= 2) {
                document.getElementById('trainModelBtn').disabled = false;
                updateStatus(`✅ Ready to train! You have ${stats.numClasses} signs. Click "Train Model" when ready.`);
            } else {
                updateStatus(`✅ Collected! Need at least 2 different signs to train. Collect another sign.`);
            }
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mode switching
    document.getElementById('recognitionMode').addEventListener('click', () => switchMode('recognition'));
    document.getElementById('trainingMode').addEventListener('click', () => switchMode('training'));
    
    // Camera controls
    document.getElementById('startBtn').addEventListener('click', startCamera);
    document.getElementById('stopBtn').addEventListener('click', stopCamera);
    document.getElementById('clearBtn').addEventListener('click', clearText);
    
    // Model controls
    document.getElementById('loadModelBtn').addEventListener('click', loadModel);
    document.getElementById('saveModelBtn').addEventListener('click', saveModel);
    document.getElementById('downloadModelBtn').addEventListener('click', downloadModel);
    
    // Training controls
    document.getElementById('startTrainingBtn').addEventListener('click', startTraining);
    document.getElementById('trainModelBtn').addEventListener('click', trainModel);
    document.getElementById('exportDataBtn').addEventListener('click', exportTrainingData);
    document.getElementById('importDataBtn').addEventListener('click', importTrainingData);
    document.getElementById('importExcelBtn').addEventListener('click', importExcelData);
    
    // Word builder
    document.getElementById('addSpaceBtn').addEventListener('click', addSpace);
    document.getElementById('backspaceBtn').addEventListener('click', backspace);
    document.getElementById('addWordBtn').addEventListener('click', addWordToSentence);
    
    // Speech controls
    const speakBtn = document.getElementById('speakBtn');
    if (speakBtn) {
        speakBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Speak button clicked');
            speakText();
        });
    } else {
        console.warn('Speak button not found');
    }
    
    const speedRange = document.getElementById('speedRange');
    if (speedRange) {
        speedRange.addEventListener('input', (e) => {
            const speedValue = document.getElementById('speedValue');
            if (speedValue) {
                speedValue.textContent = e.target.value;
            }
        });
    }
}

// Switch between recognition and training modes (global for onclick)
window.switchMode = function(mode) {
    currentMode = mode;
    
    document.getElementById('recognitionMode').classList.toggle('active', mode === 'recognition');
    document.getElementById('trainingMode').classList.toggle('active', mode === 'training');
    document.getElementById('recognitionPanel').classList.toggle('active', mode === 'recognition');
    document.getElementById('trainingPanel').classList.toggle('active', mode === 'training');
    
    updateStatus(`Switched to ${mode} mode`);
    
    if (mode === 'training') {
        // Show helpful message in training mode
        updateStatus('Training Mode: Enter a sign label and start collecting data!');
    } else {
        hideTrainingPrompt();
        // Check if model exists when switching to recognition
        if (!mlModel || !mlModel.model) {
            loadModel();
        }
    }
}

// Start camera
async function startCamera() {
    try {
        if (!hands) {
            initializeMediaPipe();
        }
        
        const video = document.getElementById('video');
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: 'user'
            }
        });
        
        video.srcObject = stream;
        isRunning = true;
        
        camera = new Camera(video, {
            onFrame: async () => {
                if (isRunning) {
                    await hands.send({ image: video });
                }
            },
            width: 640,
            height: 480
        });
        
        camera.start();
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        updateStatus('Camera started');
    } catch (error) {
        console.error('Error accessing camera:', error);
        updateStatus('Error: Could not access camera');
        alert('Could not access camera. Please check permissions.');
    }
}

// Stop camera
function stopCamera() {
    if (camera) {
        camera.stop();
        camera = null;
    }
    
    const video = document.getElementById('video');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    
    isRunning = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    updateStatus('Camera stopped');
    
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Load model
async function loadModel() {
    try {
        updateStatus('Loading model...');
        const result = await mlModel.loadModel();
        
        if (result.success) {
            mlModel.setClassNames(result.metadata.classNames);
            updateModelInfo();
            updateStatus('Model loaded successfully!');
            document.getElementById('saveModelBtn').disabled = false;
            document.getElementById('downloadModelBtn').disabled = false;
            hideTrainingPrompt();
        } else {
            // Check if this is an expected "no model" case
            if (result.isExpected) {
                // No model found - this is normal for first-time users
                // Don't show error, just silently handle it
                updateStatus('No saved model. Train a model in Training Mode.');
                showTrainingPrompt();
            } else {
                // Actual error occurred
                updateStatus('Failed to load model: ' + result.error);
                showTrainingPrompt();
                const proceed = confirm('Error loading model. Would you like to go to Training Mode to train one?\n\nClick OK to switch to Training Mode, or Cancel to stay here.');
                if (proceed) {
                    switchMode('training');
                }
            }
        }
    } catch (error) {
        console.error('Error loading model:', error);
        updateStatus('Error loading model');
        showTrainingPrompt();
    }
}

// Save model
async function saveModel() {
    try {
        updateStatus('Saving model...');
        await mlModel.saveModel();
        updateStatus('Model saved successfully!');
    } catch (error) {
        console.error('Error saving model:', error);
        updateStatus('Error saving model');
    }
}

// Download model
async function downloadModel() {
    try {
        updateStatus('Downloading model...');
        await mlModel.downloadModel();
        updateStatus('Model downloaded successfully!');
    } catch (error) {
        console.error('Error downloading model:', error);
        updateStatus('Error downloading model');
    }
}

// Start training data collection
function startTraining() {
    const label = document.getElementById('signLabel').value.trim().toUpperCase();
    const samples = parseInt(document.getElementById('samplesCount').value);
    
    if (!label) {
        alert('Please enter a sign label (e.g., "A", "B", "HELLO")');
        return;
    }
    
    if (samples < 10) {
        alert('Please collect at least 10 samples (30-50 recommended for better accuracy)');
        return;
    }
    
    if (!isRunning) {
        const startCam = confirm('Camera is not running. Would you like to start it now?');
        if (startCam) {
            startCamera().then(() => {
                // Wait a moment for camera to initialize
                setTimeout(() => {
                    dataCollector.startCollection(label, samples);
                    updateStatus(`Collecting ${samples} samples for "${label}"... Show the sign now!`);
                    document.getElementById('startTrainingBtn').disabled = true;
                }, 1000);
            });
        }
        return;
    }
    
    dataCollector.startCollection(label, samples);
    updateStatus(`✅ Collecting ${samples} samples for "${label}"... Show the sign repeatedly!`);
    document.getElementById('startTrainingBtn').disabled = true;
    
    // Show helpful tips
    const progressText = document.getElementById('progressText');
    progressText.innerHTML = `Performing sign "${label}" - Keep showing the sign until collection completes!`;
}

// Train model
async function trainModel() {
    const trainingData = dataCollector.getTrainingData();
    
    if (trainingData.features.length === 0) {
        alert('No training data collected. Please collect data first.');
        return;
    }
    
    if (trainingData.classNames.length < 2) {
        alert('Please collect data for at least 2 different signs.');
        return;
    }
    
    try {
        updateStatus('Training model... This may take a while.');
        document.getElementById('trainModelBtn').disabled = true;
        
        // Create model
        mlModel.setClassNames(trainingData.classNames);
        mlModel.createModel(trainingData.classNames.length);
        
        // Train model
        await mlModel.train(
            trainingData.features,
            trainingData.labels,
            50, // epochs
            32, // batch size
            {
                onEpochEnd: (epoch, logs) => {
                    updateStatus(`Training... Epoch ${epoch + 1}/50 - Loss: ${logs.loss.toFixed(4)}, Accuracy: ${logs.acc.toFixed(4)}`);
                }
            }
        );
        
        updateStatus('✅ Model trained successfully! You can now use Recognition Mode.');
        updateModelInfo();
        document.getElementById('trainModelBtn').disabled = false;
        document.getElementById('saveModelBtn').disabled = false;
        document.getElementById('downloadModelBtn').disabled = false;
        
        // Auto-save
        await mlModel.saveModel();
        dataCollector.saveToLocalStorage();
        
        // Show success message
        const successMsg = `🎉 Model Training Complete!\n\nYou can now:\n1. Switch to Recognition Mode\n2. Start Camera\n3. Perform your trained signs\n4. See real-time recognition!`;
        alert(successMsg);
    } catch (error) {
        console.error('Training error:', error);
        updateStatus('Error training model: ' + error.message);
        document.getElementById('trainModelBtn').disabled = false;
    }
}

// Export training data
function exportTrainingData() {
    dataCollector.exportData();
    updateStatus('Training data exported');
}

// Import training data (JSON)
function importTrainingData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const merge = confirm('Merge with existing data? (Click OK to merge, Cancel to replace)');
                const success = dataCollector.importData(event.target.result, merge);
                if (success) {
                    updateTrainingStats();
                    updateStatus('✅ Training data imported successfully!');
                    if (dataCollector.getStatistics().numClasses >= 2) {
                        document.getElementById('trainModelBtn').disabled = false;
                    }
                } else {
                    alert('Failed to import training data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Import Excel file
async function importExcelData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Disable button during import
        const importBtn = document.getElementById('importExcelBtn');
        const originalText = importBtn.textContent;
        importBtn.disabled = true;
        importBtn.textContent = 'Importing...';

        try {
            updateStatus('📊 Reading Excel file...');
            
            // Progress callback for UI updates
            const progressCallback = (current, total, message) => {
                const percent = Math.round((current / total) * 100);
                updateStatus(`📊 ${message} (${percent}%)`);
                updateTrainingProgress(percent, current, total);
            };

            const converter = new ExcelConverter();
            const convertedData = await converter.convertExcelFile(file, progressCallback);
            
            // Validate
            const validation = converter.validateData(convertedData);
            if (!validation.valid) {
                alert(`Validation error: ${validation.error}`);
                updateStatus('❌ Excel import failed: ' + validation.error);
                importBtn.disabled = false;
                importBtn.textContent = originalText;
                return;
            }

            // Ask user about merging
            const merge = confirm(
                `Found ${convertedData.numSamples} samples for ${convertedData.numClasses} classes.\n\n` +
                `Merge with existing data? (OK = merge, Cancel = replace)`
            );

            updateStatus('💾 Saving imported data...');
            await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause

            // Convert to expected format
            const importData = {
                trainingData: convertedData.trainingData,
                labels: convertedData.labels,
                classNames: convertedData.classNames
            };

            const success = dataCollector.importData(importData, merge);
            
            if (success) {
                updateTrainingStats();
                updateStatus(`✅ Excel imported successfully! ${convertedData.numSamples} samples, ${convertedData.numClasses} classes.`);
                
                const stats = dataCollector.getStatistics();
                if (stats.numClasses >= 2) {
                    document.getElementById('trainModelBtn').disabled = false;
                    updateStatus(`✅ Ready to train! You have ${stats.numClasses} classes with ${stats.totalSamples} total samples.`);
                }
            } else {
                alert('Failed to import Excel data');
                updateStatus('❌ Excel import failed');
            }
        } catch (error) {
            console.error('Excel import error:', error);
            alert(`Error importing Excel: ${error.message}\n\nPlease ensure:\n- File is in .xlsx or .xls format\n- Has a header row\n- Features are numeric\n- Label column is present`);
            updateStatus('❌ Excel import error: ' + error.message);
        } finally {
            importBtn.disabled = false;
            importBtn.textContent = originalText;
            // Reset progress bar
            document.getElementById('progressFill').style.width = '0%';
            document.getElementById('progressText').textContent = 'Ready to collect data';
        }
    };
    input.click();
}

// Update training progress
function updateTrainingProgress(progress, collected, target) {
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Collected ${collected}/${target} samples (${progress.toFixed(1)}%)`;
}

// Update training statistics
function updateTrainingStats() {
    const stats = dataCollector.getStatistics();
    const statsDisplay = document.getElementById('statsDisplay');
    
    let html = `<div class="stat-item"><strong>Total Samples:</strong> ${stats.totalSamples}</div>`;
    html += `<div class="stat-item"><strong>Number of Classes:</strong> ${stats.numClasses}</div>`;
    html += `<div class="stat-item"><strong>Classes:</strong> ${stats.classNames.join(', ')}</div>`;
    html += '<div class="stat-item"><strong>Samples per Class:</strong></div>';
    html += '<ul class="stat-list">';
    for (const [className, count] of Object.entries(stats.samplesPerClass)) {
        html += `<li>${className}: ${count} samples</li>`;
    }
    html += '</ul>';
    
    statsDisplay.innerHTML = html;
}

// Update model info
function updateModelInfo() {
    const info = mlModel.getModelInfo();
    if (!info) {
        document.getElementById('modelInfo').innerHTML = '<p>No model loaded</p>';
        return;
    }
    
    let html = `<p><strong>Layers:</strong> ${info.layers}</p>`;
    html += `<p><strong>Trainable Parameters:</strong> ${info.trainableParams.toLocaleString()}</p>`;
    html += `<p><strong>Classes:</strong> ${info.numClasses}</p>`;
    html += `<p><strong>Class Names:</strong> ${info.classNames.join(', ')}</p>`;
    
    document.getElementById('modelInfo').innerHTML = html;
}

// Initialize alphabet display
function initializeAlphabetDisplay() {
    const container = document.getElementById('alphabetDisplay');
    ASL_ALPHABET.forEach(letter => {
        const div = document.createElement('div');
        div.className = 'alphabet-item';
        div.id = `letter-${letter}`;
        div.textContent = letter;
        container.appendChild(div);
    });
}

// Update alphabet highlight
function updateAlphabetHighlight(letter) {
    document.querySelectorAll('.alphabet-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const letterElement = document.getElementById(`letter-${letter}`);
    if (letterElement) {
        letterElement.classList.add('active');
    }
}

// Word builder functions
function updateWordDisplay(word) {
    document.getElementById('wordDisplay').textContent = word || '';
}

function addSpace() {
    if (currentWord) {
        currentSentence += currentWord + ' ';
        currentWord = '';
        updateWordDisplay('');
        updateRecognizedText(currentSentence.trim());
    }
}

function backspace() {
    if (currentWord.length > 0) {
        currentWord = currentWord.slice(0, -1);
        updateWordDisplay(currentWord);
    } else if (currentSentence.length > 0) {
        currentSentence = currentSentence.trim().split(' ').slice(0, -1).join(' ');
        if (currentSentence) currentSentence += ' ';
        updateRecognizedText(currentSentence.trim() || 'No signs detected yet...');
    }
}

function addWordToSentence() {
    if (currentWord) {
        addSpace();
    }
}

// Clear text
function clearText() {
    currentWord = '';
    currentSentence = '';
    predictionHistory = [];
    updateWordDisplay('');
    updateRecognizedText('No signs detected yet...');
    document.getElementById('speakBtn').disabled = true;
    document.querySelectorAll('.alphabet-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Update recognized text
function updateRecognizedText(text) {
    const textBox = document.getElementById('recognizedText');
    textBox.textContent = text || 'No signs detected yet...';
    textBox.style.borderColor = text ? '#667eea' : '#e0e0e0';
    document.getElementById('speakBtn').disabled = !text || text === 'No signs detected yet...';
}

// Load voices with Kannada language support
function loadVoices() {
    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    
    if (!voiceSelect) return;
    
    // Clear existing options
    voiceSelect.innerHTML = '<option value="">Select Voice (Default)</option>';
    
    // Separate voices by language
    const kannadaVoices = [];
    const englishVoices = [];
    const otherVoices = [];
    
    voices.forEach((voice, index) => {
        const lang = voice.lang.toLowerCase();
        if (lang.includes('kn') || lang.includes('kannada')) {
            kannadaVoices.push({ voice, index });
        } else if (lang.includes('en') || lang.includes('english')) {
            englishVoices.push({ voice, index });
        } else {
            otherVoices.push({ voice, index });
        }
    });
    
    // Add Kannada voices first (prioritized)
    if (kannadaVoices.length > 0) {
        const kannadaGroup = document.createElement('optgroup');
        kannadaGroup.label = '🇮🇳 Kannada (ಕನ್ನಡ)';
        kannadaVoices.forEach(({ voice, index }) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            option.dataset.lang = 'kn';
            kannadaGroup.appendChild(option);
        });
        voiceSelect.appendChild(kannadaGroup);
    }
    
    // Add English voices
    if (englishVoices.length > 0) {
        const englishGroup = document.createElement('optgroup');
        englishGroup.label = '🇬🇧 English';
        englishVoices.forEach(({ voice, index }) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            option.dataset.lang = 'en';
            englishGroup.appendChild(option);
        });
        voiceSelect.appendChild(englishGroup);
    }
    
    // Add other languages
    if (otherVoices.length > 0) {
        const otherGroup = document.createElement('optgroup');
        otherGroup.label = '🌍 Other Languages';
        otherVoices.forEach(({ voice, index }) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            otherGroup.appendChild(option);
        });
        voiceSelect.appendChild(otherGroup);
    }
    
    // If no voices found, show message
    if (voices.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No voices available';
        option.disabled = true;
        voiceSelect.appendChild(option);
    }
    
    // Auto-select first Kannada voice if available
    if (kannadaVoices.length > 0) {
        const firstKannadaOption = voiceSelect.querySelector('optgroup[label*="Kannada"] option');
        if (firstKannadaOption) {
            firstKannadaOption.selected = true;
            console.log('✅ Auto-selected Kannada voice:', firstKannadaOption.textContent);
        }
    }
}

// Speak text with language support (including Kannada)
function speakText() {
    try {
        // Check if speech synthesis is available
        if (!speechSynthesis) {
            alert('Text-to-speech is not supported in this browser.');
            console.error('SpeechSynthesis API not available');
            return;
        }

        const textElement = document.getElementById('recognizedText');
        if (!textElement) {
            console.error('recognizedText element not found');
            return;
        }

        const text = textElement.textContent.trim();
        
        if (!text || text === 'No signs detected yet...' || text === '') {
            alert('No text to speak. Please convert some signs to text first.');
            return;
        }
        
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        // Wait a bit for cancel to complete
        setTimeout(() => {
            try {
                currentUtterance = new SpeechSynthesisUtterance(text);
                
                const voiceSelect = document.getElementById('voiceSelect');
                const voices = speechSynthesis.getVoices();
                
                // Ensure voices are loaded
                if (voices.length === 0) {
                    console.warn('No voices available, loading...');
                    loadVoices();
                    // Try again after a short delay
                    setTimeout(() => {
                        speakText();
                    }, 500);
                    return;
                }
                
                if (voiceSelect && voiceSelect.value && voices[parseInt(voiceSelect.value)]) {
                    const selectedVoice = voices[parseInt(voiceSelect.value)];
                    currentUtterance.voice = selectedVoice;
                    
                    // Set language based on selected voice
                    const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
                    const lang = selectedOption ? (selectedOption.dataset.lang || selectedVoice.lang || 'en') : 'en';
                    
                    // Set language for better pronunciation
                    currentUtterance.lang = selectedVoice.lang || lang;
                    
                    // Show which language is being used
                    const langName = lang === 'kn' ? 'Kannada (ಕನ್ನಡ)' : 
                                    lang === 'en' ? 'English' : 
                                    selectedVoice.lang;
                    updateStatus(`Speaking in ${langName}...`);
                    updateSpeechStatus(`Using: ${selectedVoice.name} (${selectedVoice.lang})`);
                    console.log('Using voice:', selectedVoice.name, 'Language:', selectedVoice.lang);
                } else {
                    // Default to English if no voice selected
                    currentUtterance.lang = 'en-US';
                    updateStatus('Speaking (default voice)...');
                    updateSpeechStatus('Using default voice');
                    console.log('Using default voice');
                }
                
                // Get speed control
                const speedRange = document.getElementById('speedRange');
                currentUtterance.rate = speedRange ? parseFloat(speedRange.value) || 1.0 : 1.0;
                currentUtterance.pitch = 1;
                currentUtterance.volume = 1;
                
                // Add event listeners for better feedback
                currentUtterance.onstart = () => {
                    updateStatus('Speaking...');
                    updateSpeechStatus('Speaking now...');
                    console.log('Speech started');
                };
                
                currentUtterance.onend = () => {
                    updateStatus('Speech completed');
                    updateSpeechStatus('Completed');
                    console.log('Speech completed');
                };
                
                currentUtterance.onerror = (event) => {
                    console.error('Speech synthesis error:', event);
                    const errorMsg = event.error || 'Could not speak text';
                    updateStatus(`Error: ${errorMsg}`);
                    updateSpeechStatus(`Error: ${errorMsg}`);
                    alert(`Speech error: ${errorMsg}. Please try again or select a different voice.`);
                };
                
                // Speak the text
                speechSynthesis.speak(currentUtterance);
                console.log('Speech synthesis initiated for text:', text);
                
            } catch (error) {
                console.error('Error in speakText function:', error);
                updateStatus('Error: Could not speak text');
                alert('An error occurred while trying to speak. Please check the console for details.');
            }
        }, 100);
        
    } catch (error) {
        console.error('Error in speakText:', error);
        alert('An error occurred: ' + error.message);
        updateStatus('Error: ' + error.message);
    }
}

// Update status
function updateStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// Update speech status (separate from main status)
function updateSpeechStatus(message) {
    const speechStatusEl = document.getElementById('speechStatus');
    if (speechStatusEl) {
        speechStatusEl.textContent = message;
        if (message) {
            speechStatusEl.style.display = 'block';
        } else {
            speechStatusEl.style.display = 'none';
        }
    }
}

// Update confidence
function updateConfidence(message) {
    document.getElementById('confidence').textContent = message;
}

// Load saved data
function loadSavedData() {
    dataCollector.loadFromLocalStorage();
    updateTrainingStats();
    
    // Try to load model (silently handle "no model" case)
    loadModel().catch((error) => {
        // Only log if it's an actual error, not just "no model found"
        if (error && !error.message?.includes('No saved model')) {
            console.error('Error loading saved data:', error);
        }
        // showTrainingPrompt will be called by loadModel if needed
    });
}

// Show training prompt
function showTrainingPrompt() {
    const recognizedText = document.getElementById('recognizedText');
    if (recognizedText.textContent === 'No signs detected yet...' || 
        recognizedText.textContent.includes('No model')) {
        recognizedText.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #667eea; margin-bottom: 15px;">🚀 Get Started!</h3>
                <p style="margin-bottom: 15px;">No model trained yet. Follow these steps:</p>
                <ol style="text-align: left; display: inline-block; margin-bottom: 15px;">
                    <li>Click <strong>"Training Mode"</strong> button above</li>
                    <li>Enter a sign label (e.g., "A")</li>
                    <li>Set samples to 30-50</li>
                    <li>Click "Start Camera"</li>
                    <li>Click "Start Collecting Data"</li>
                    <li>Perform the sign repeatedly</li>
                    <li>Repeat for at least 2 signs</li>
                    <li>Click "Train Model"</li>
                </ol>
                <button onclick="switchMode('training')" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em;">
                    Go to Training Mode →
                </button>
            </div>
        `;
    }
}

// Hide training prompt
function hideTrainingPrompt() {
    const recognizedText = document.getElementById('recognizedText');
    if (recognizedText.innerHTML.includes('Get Started')) {
        recognizedText.textContent = 'No signs detected yet...';
    }
}
