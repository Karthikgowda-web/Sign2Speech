// Text to Sign Language Converter using ML
class TextToSignConverter {
    constructor() {
        this.mlModel = null;
        this.classNames = [];
        this.currentSequence = [];
        this.playbackSpeed = 1.0;
        this.isPlaying = false;
        this.currentIndex = 0;
        
        this.initializeModel();
        this.setupEventListeners();
    }

    async initializeModel() {
        try {
            // Try to load existing model from multiple sources
            // 1. Check model metadata (primary source)
            const metadata = localStorage.getItem('signLanguageModelMetadata');
            if (metadata) {
                const parsed = JSON.parse(metadata);
                if (parsed.classNames && Array.isArray(parsed.classNames)) {
                    this.classNames = parsed.classNames;
                    console.log('✅ Loaded class names from model metadata:', this.classNames);
                    return;
                }
            }
            
            // 2. Check localStorage for saved model (legacy format)
            const modelData = localStorage.getItem('signLanguageModel');
            if (modelData) {
                const parsed = JSON.parse(modelData);
                if (parsed.classNames && Array.isArray(parsed.classNames)) {
                    this.classNames = parsed.classNames;
                    console.log('✅ Loaded class names from saved model:', this.classNames);
                    return;
                }
            }
            
            // 3. Check for training data
            const trainingData = localStorage.getItem('signLanguageTrainingData');
            if (trainingData) {
                const parsed = JSON.parse(trainingData);
                if (parsed.classNames && Array.isArray(parsed.classNames)) {
                    this.classNames = parsed.classNames;
                    console.log('✅ Loaded class names from training data:', this.classNames);
                    return;
                }
            }
            
            // 4. Use default ASL alphabet as fallback
            this.classNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
            console.log('ℹ️ Using default ASL alphabet (no trained model found)');
            console.log('💡 Tip: Train a model in Home page to enable custom signs!');
        } catch (error) {
            console.error('Error initializing model:', error);
            this.classNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
        }
    }

    setupEventListeners() {
        const convertBtn = document.getElementById('convertBtn');
        const clearBtn = document.getElementById('clearBtn');
        const textInput = document.getElementById('textInput');
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');

        convertBtn.addEventListener('click', () => this.convertText());
        clearBtn.addEventListener('click', () => this.clearAll());
        
        speedSlider.addEventListener('input', (e) => {
            this.playbackSpeed = parseFloat(e.target.value);
            speedValue.textContent = this.playbackSpeed.toFixed(1) + 'x';
        });

        // Convert on Enter (Ctrl+Enter)
        textInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.convertText();
            }
        });
    }

    convertText() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value.toUpperCase().trim();

        if (!text) {
            alert('Please enter some text to convert');
            return;
        }

        // Clear previous sequence
        this.currentSequence = [];
        const signSequence = document.getElementById('signSequence');
        signSequence.innerHTML = '';

        // Convert each character to sign
        const characters = text.split('');
        let recognizedCount = 0;
        let unknownCount = 0;

        characters.forEach((char, index) => {
            if (char === ' ') {
                // Add space indicator
                this.addSignItem('SPACE', ' ', index, false);
            } else if (this.classNames.includes(char)) {
                // Known sign
                this.addSignItem(char, char, index, true);
                recognizedCount++;
            } else {
                // Unknown character
                this.addSignItem('?', char, index, false);
                unknownCount++;
            }
        });

        // Update statistics
        this.updateStatistics(text.length, characters.filter(c => c !== ' ').length, recognizedCount, unknownCount);

        // Auto-play sequence
        if (this.currentSequence.length > 0) {
            setTimeout(() => this.playSequence(), 500);
        }
    }

    addSignItem(signLabel, originalChar, index, isRecognized) {
        const signSequence = document.getElementById('signSequence');
        
        const signItem = document.createElement('div');
        signItem.className = `sign-item ${isRecognized ? 'recognized' : 'unknown'}`;
        signItem.id = `sign-${index}`;
        signItem.dataset.index = index;
        signItem.dataset.sign = signLabel;

        // Create hand pose canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'hand-canvas';
        canvas.width = 200;
        canvas.height = 200;

        // Draw sign visualization
        this.drawSignVisualization(canvas, signLabel, isRecognized);

        signItem.innerHTML = `
            <div class="sign-character">${signLabel === 'SPACE' ? '␣' : signLabel === '?' ? '?' : signLabel}</div>
            <div class="sign-label">${signLabel === 'SPACE' ? 'Space' : signLabel === '?' ? `Unknown: ${originalChar}` : signLabel}</div>
        `;
        signItem.appendChild(canvas);

        signSequence.appendChild(signItem);
        this.currentSequence.push({
            element: signItem,
            sign: signLabel,
            index: index,
            isRecognized: isRecognized
        });
    }

    drawSignVisualization(canvas, signLabel, isRecognized) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!isRecognized) {
            // Draw question mark for unknown
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 3;
            ctx.font = '80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText('?', canvas.width / 2, canvas.height / 2);
            return;
        }

        if (signLabel === 'SPACE') {
            // Draw space indicator
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(20, canvas.height / 2 - 10, canvas.width - 40, 20);
            return;
        }

        // Draw hand pose based on sign
        // This is a simplified visualization - in production, you'd use actual hand landmark data
        ctx.strokeStyle = '#667eea';
        ctx.fillStyle = '#667eea';
        ctx.lineWidth = 2;

        // Draw hand outline based on sign
        this.drawHandPose(ctx, canvas.width / 2, canvas.height / 2, signLabel);
    }

    drawHandPose(ctx, centerX, centerY, signLabel) {
        // Simplified hand pose visualization
        // In a real implementation, you'd use the trained model's feature vectors
        // to generate hand landmark positions

        const radius = 60;
        
        // Draw palm (circle)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Draw fingers based on sign
        // This is a placeholder - actual implementation would use ML-generated landmarks
        const fingerPositions = this.getFingerPositions(signLabel);
        
        fingerPositions.forEach((pos, index) => {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(pos.angle) * radius * pos.length,
                centerY + Math.sin(pos.angle) * radius * pos.length
            );
            ctx.stroke();
            
            // Draw finger tip
            ctx.beginPath();
            ctx.arc(
                centerX + Math.cos(pos.angle) * radius * pos.length,
                centerY + Math.sin(pos.angle) * radius * pos.length,
                5, 0, Math.PI * 2
            );
            ctx.fill();
        });
    }

    getFingerPositions(signLabel) {
        // Simplified finger positions for different signs
        // In production, this would come from the ML model's reverse mapping
        const signPoses = {
            'A': [{angle: -Math.PI/2, length: 0.3}, {angle: -Math.PI/4, length: 0.3}, {angle: 0, length: 0.3}, {angle: Math.PI/4, length: 0.3}, {angle: Math.PI/2, length: 0.8}],
            'B': [{angle: -Math.PI/2, length: 0.8}, {angle: -Math.PI/4, length: 0.8}, {angle: 0, length: 0.8}, {angle: Math.PI/4, length: 0.8}, {angle: Math.PI/2, length: 0.3}],
            'C': [{angle: -Math.PI/3, length: 0.6}, {angle: -Math.PI/6, length: 0.6}, {angle: 0, length: 0.6}, {angle: Math.PI/6, length: 0.6}, {angle: Math.PI/3, length: 0.6}],
            // Add more poses as needed
        };

        return signPoses[signLabel] || [
            {angle: -Math.PI/2, length: 0.5},
            {angle: -Math.PI/4, length: 0.5},
            {angle: 0, length: 0.5},
            {angle: Math.PI/4, length: 0.5},
            {angle: Math.PI/2, length: 0.5}
        ];
    }

    async playSequence() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        const playBtn = document.getElementById('convertBtn');
        playBtn.disabled = true;
        playBtn.textContent = 'Playing...';

        for (let i = 0; i < this.currentSequence.length; i++) {
            this.currentIndex = i;
            const item = this.currentSequence[i];
            
            // Highlight current sign
            item.element.classList.add('active', 'animating');
            
            // Scroll into view
            item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Wait before next sign
            await this.delay(1000 / this.playbackSpeed);

            // Remove animation class
            item.element.classList.remove('animating');
        }

        // Clear all highlights
        this.currentSequence.forEach(item => {
            item.element.classList.remove('active');
        });

        this.isPlaying = false;
        playBtn.disabled = false;
        playBtn.textContent = 'Convert to Signs';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateStatistics(totalChars, totalSigns, recognized, unknown) {
        document.getElementById('totalChars').textContent = totalChars;
        document.getElementById('totalSigns').textContent = totalSigns;
        document.getElementById('recognizedSigns').textContent = recognized;
        document.getElementById('unknownSigns').textContent = unknown;
    }

    clearAll() {
        document.getElementById('textInput').value = '';
        document.getElementById('signSequence').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👋</div>
                <p style="font-size: 1.2em;">Enter text above to see sign language conversion</p>
            </div>
        `;
        this.currentSequence = [];
        this.updateStatistics(0, 0, 0, 0);
    }

    // Load model data from existing trained model (called periodically)
    loadModelData() {
        try {
            // Check for model updates (check metadata first, then fallback)
            const metadata = localStorage.getItem('signLanguageModelMetadata');
            const modelData = localStorage.getItem('signLanguageModel');
            const trainingData = localStorage.getItem('signLanguageTrainingData');
            
            let newClassNames = null;
            
            if (metadata) {
                const parsed = JSON.parse(metadata);
                if (parsed.classNames && Array.isArray(parsed.classNames)) {
                    newClassNames = parsed.classNames;
                }
            } else if (modelData) {
                const parsed = JSON.parse(modelData);
                if (parsed.classNames && Array.isArray(parsed.classNames)) {
                    newClassNames = parsed.classNames;
                }
            } else if (trainingData) {
                const parsed = JSON.parse(trainingData);
                if (parsed.classNames && Array.isArray(parsed.classNames)) {
                    newClassNames = parsed.classNames;
                }
            }
            
            if (newClassNames && JSON.stringify(newClassNames) !== JSON.stringify(this.classNames)) {
                this.classNames = newClassNames;
                console.log('🔄 Updated class names:', this.classNames);
                return true;
            }
        } catch (error) {
            console.error('Error loading model data:', error);
        }
        return false;
    }
    
    // Get available signs for display
    getAvailableSigns() {
        return this.classNames;
    }
    
    // Check if a character can be converted
    canConvert(char) {
        return this.classNames.includes(char.toUpperCase());
    }
}

// Initialize converter when page loads
let textToSignConverter;

document.addEventListener('DOMContentLoaded', () => {
    textToSignConverter = new TextToSignConverter();
    
    // Try to load model data periodically (in case model is trained while page is open)
    setTimeout(() => {
        textToSignConverter.loadModelData();
    }, 500);
    
    // Check for model updates every 2 seconds
    setInterval(() => {
        if (textToSignConverter && textToSignConverter.loadModelData()) {
            // Model was updated, show notification
            const textInput = document.getElementById('textInput');
            if (textInput && textInput.value) {
                // If there's text, offer to reconvert
                console.log('🔄 Model updated! You can reconvert your text with new signs.');
            }
        }
    }, 2000);
});

