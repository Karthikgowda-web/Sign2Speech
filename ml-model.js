// Neural Network Model for Sign Language Recognition
class SignLanguageModel {
    constructor() {
        this.model = null;
        this.isTraining = false;
        this.numClasses = 0;
        this.classNames = [];
        this.inputSize = 126; // 21 landmarks * 2 hands * 3 coordinates (x, y, z)
    }

    // Create neural network architecture
    createModel(numClasses) {
        this.numClasses = numClasses;
        
        const model = tf.sequential({
            layers: [
                // Input layer
                tf.layers.dense({
                    inputShape: [this.inputSize],
                    units: 128,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
                }),
                tf.layers.dropout({ rate: 0.3 }),
                
                // Hidden layers
                tf.layers.dense({
                    units: 256,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
                }),
                tf.layers.dropout({ rate: 0.3 }),
                
                tf.layers.dense({
                    units: 128,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
                }),
                tf.layers.dropout({ rate: 0.2 }),
                
                // Output layer
                tf.layers.dense({
                    units: numClasses,
                    activation: 'softmax'
                })
            ]
        });

        // Compile model
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        this.model = model;
        return model;
    }

    // Train the model
    async train(trainingData, labels, epochs = 50, batchSize = 32, callbacks = {}) {
        if (!this.model) {
            throw new Error('Model not initialized. Call createModel() first.');
        }

        this.isTraining = true;

        try {
            // Convert data to tensors
            const xs = tf.tensor2d(trainingData);
            const ys = tf.oneHot(tf.tensor1d(labels, 'int32'), this.numClasses);

            // Training callbacks
            const onEpochEnd = (epoch, logs) => {
                if (callbacks.onEpochEnd) {
                    callbacks.onEpochEnd(epoch, logs);
                }
            };

            // Train model
            const history = await this.model.fit(xs, ys, {
                epochs: epochs,
                batchSize: batchSize,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochEnd: onEpochEnd
                }
            });

            // Cleanup
            xs.dispose();
            ys.dispose();

            this.isTraining = false;
            return history;
        } catch (error) {
            this.isTraining = false;
            throw error;
        }
    }

    // Predict sign from features
    async predict(features) {
        if (!this.model) {
            return null;
        }

        try {
            const input = tf.tensor2d([features]);
            const prediction = this.model.predict(input);
            const probabilities = await prediction.data();
            const predictedClass = tf.argMax(prediction, 1).dataSync()[0];
            const confidence = probabilities[predictedClass];

            // Cleanup
            input.dispose();
            prediction.dispose();

            return {
                class: predictedClass,
                className: this.classNames[predictedClass] || 'Unknown',
                confidence: confidence,
                probabilities: Array.from(probabilities)
            };
        } catch (error) {
            console.error('Prediction error:', error);
            return null;
        }
    }

    // Save model to browser storage
    async saveModel() {
        if (!this.model) {
            throw new Error('No model to save');
        }

        try {
            // Save model architecture and weights
            const saveResult = await this.model.save('indexeddb://sign-language-model');
            
            // Save metadata
            const metadata = {
                numClasses: this.numClasses,
                classNames: this.classNames,
                inputSize: this.inputSize,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('signLanguageModelMetadata', JSON.stringify(metadata));

            return saveResult;
        } catch (error) {
            console.error('Error saving model:', error);
            throw error;
        }
    }

    // Load model from browser storage
    async loadModel() {
        try {
            // Load metadata
            const metadataStr = localStorage.getItem('signLanguageModelMetadata');
            if (!metadataStr) {
                // No saved model - this is expected for first-time users, not an error
                return {
                    success: false,
                    error: 'No saved model found',
                    isExpected: true // Flag to indicate this is normal, not an error
                };
            }

            const metadata = JSON.parse(metadataStr);
            this.numClasses = metadata.numClasses;
            this.classNames = metadata.classNames;
            this.inputSize = metadata.inputSize;

            // Load model
            this.model = await tf.loadLayersModel('indexeddb://sign-language-model');
            
            return {
                success: true,
                metadata: metadata
            };
        } catch (error) {
            // Only log actual errors, not "no model found" cases
            const isNoModelError = error.message && (
                error.message.includes('No saved model found') ||
                error.message.includes('No model') ||
                error.message.includes('not found')
            );
            
            if (!isNoModelError) {
                console.error('Error loading model:', error);
            }
            
            return {
                success: false,
                error: error.message,
                isExpected: isNoModelError
            };
        }
    }

    // Download model as files
    async downloadModel() {
        if (!this.model) {
            throw new Error('No model to download');
        }

        try {
            // Download model
            await this.model.save('downloads://sign-language-model');
            
            // Download metadata
            const metadata = {
                numClasses: this.numClasses,
                classNames: this.classNames,
                inputSize: this.inputSize,
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'model-metadata.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading model:', error);
            throw error;
        }
    }

    // Get model summary
    getModelInfo() {
        if (!this.model) {
            return null;
        }

        const trainableParams = this.model.countParams();
        const layers = this.model.layers.length;

        return {
            layers: layers,
            trainableParams: trainableParams,
            numClasses: this.numClasses,
            classNames: this.classNames,
            inputSize: this.inputSize
        };
    }

    // Set class names
    setClassNames(classNames) {
        this.classNames = classNames;
        this.numClasses = classNames.length;
    }
}

// Export for use in other scripts
window.SignLanguageModel = SignLanguageModel;
