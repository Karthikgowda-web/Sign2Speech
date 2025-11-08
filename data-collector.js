// Data Collection System for Training
class DataCollector {
    constructor() {
        this.trainingData = [];
        this.labels = [];
        this.classNames = [];
        this.currentLabel = null;
        this.isCollecting = false;
        this.samplesCollected = 0;
        this.targetSamples = 0;
        this.collectionInterval = null;
    }

    // Start collecting data for a specific label
    startCollection(label, targetSamples) {
        if (this.isCollecting) {
            console.warn('Already collecting data. Stop current collection first.');
            return;
        }

        this.currentLabel = label;
        this.targetSamples = targetSamples;
        this.samplesCollected = 0;
        this.isCollecting = true;

        // Add label to class names if new
        if (!this.classNames.includes(label)) {
            this.classNames.push(label);
        }

        console.log(`Started collecting ${targetSamples} samples for label: ${label}`);
    }

    // Add a sample
    addSample(features) {
        if (!this.isCollecting || !this.currentLabel) {
            return false;
        }

        if (features && features.length > 0) {
            this.trainingData.push(features);
            const labelIndex = this.classNames.indexOf(this.currentLabel);
            this.labels.push(labelIndex);
            this.samplesCollected++;

            return true;
        }

        return false;
    }

    // Stop collection
    stopCollection() {
        this.isCollecting = false;
        this.currentLabel = null;
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
    }

    // Check if collection is complete
    isCollectionComplete() {
        return this.samplesCollected >= this.targetSamples;
    }

    // Get collection progress
    getProgress() {
        if (this.targetSamples === 0) return 0;
        return (this.samplesCollected / this.targetSamples) * 100;
    }

    // Get statistics
    getStatistics() {
        const stats = {};
        
        this.classNames.forEach((className, index) => {
            const count = this.labels.filter(label => label === index).length;
            stats[className] = count;
        });

        return {
            totalSamples: this.trainingData.length,
            numClasses: this.classNames.length,
            classNames: this.classNames,
            samplesPerClass: stats
        };
    }

    // Clear all data
    clearData() {
        this.trainingData = [];
        this.labels = [];
        this.classNames = [];
        this.currentLabel = null;
        this.samplesCollected = 0;
        this.targetSamples = 0;
        this.stopCollection();
    }

    // Export data as JSON
    exportData() {
        const data = {
            trainingData: this.trainingData,
            labels: this.labels,
            classNames: this.classNames,
            timestamp: new Date().toISOString(),
            numSamples: this.trainingData.length,
            numClasses: this.classNames.length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sign-language-training-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return data;
    }

    // Import data from JSON or converted Excel data
    importData(jsonData, merge = false) {
        try {
            if (typeof jsonData === 'string') {
                jsonData = JSON.parse(jsonData);
            }

            if (!jsonData.trainingData || !jsonData.labels || !jsonData.classNames) {
                throw new Error('Invalid data format');
            }

            if (merge && this.trainingData.length > 0) {
                // Merge with existing data
                const existingClassMap = {};
                this.classNames.forEach((name, idx) => {
                    existingClassMap[name] = idx;
                });

                // Add new classes and remap labels
                jsonData.classNames.forEach(className => {
                    if (!existingClassMap.hasOwnProperty(className)) {
                        existingClassMap[className] = this.classNames.length;
                        this.classNames.push(className);
                    }
                });

                // Remap new labels
                const remappedLabels = jsonData.labels.map(oldLabel => {
                    const className = jsonData.classNames[oldLabel];
                    return existingClassMap[className];
                });

                // Merge data
                this.trainingData = this.trainingData.concat(jsonData.trainingData);
                this.labels = this.labels.concat(remappedLabels);
            } else {
                // Replace existing data
                this.trainingData = jsonData.trainingData;
                this.labels = jsonData.labels;
                this.classNames = jsonData.classNames;
            }

            console.log(`Imported ${jsonData.trainingData.length} samples for ${jsonData.classNames.length} classes`);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Save to localStorage
    saveToLocalStorage() {
        try {
            const data = {
                trainingData: this.trainingData,
                labels: this.labels,
                classNames: this.classNames,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('signLanguageTrainingData', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    // Load from localStorage
    loadFromLocalStorage() {
        try {
            const dataStr = localStorage.getItem('signLanguageTrainingData');
            if (!dataStr) {
                return false;
            }

            return this.importData(JSON.parse(dataStr));
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return false;
        }
    }

    // Get training data for model
    getTrainingData() {
        return {
            features: this.trainingData,
            labels: this.labels,
            classNames: this.classNames
        };
    }
}

// Export for use in other scripts
window.DataCollector = DataCollector;
