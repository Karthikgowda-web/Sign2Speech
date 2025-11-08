// Excel to Training Data Converter
class ExcelConverter {
    constructor() {
        this.featureSize = 126; // Expected feature vector size
    }

    // Convert Excel file to training data format
    async convertExcelFile(file, progressCallback = null) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    if (progressCallback) progressCallback(0, 100, 'Reading Excel file...');
                    
                    const data = new Uint8Array(e.target.result);
                    if (progressCallback) progressCallback(10, 100, 'Parsing workbook...');
                    
                    // Use async parsing for large files
                    await new Promise(resolve => setTimeout(resolve, 0));
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    if (progressCallback) progressCallback(20, 100, 'Converting data...');
                    
                    // Try different conversion strategies
                    const result = await this.convertFromWorkbook(workbook, progressCallback);
                    
                    if (result) {
                        if (progressCallback) progressCallback(100, 100, 'Complete!');
                        resolve(result);
                    } else {
                        reject(new Error('Could not parse Excel file. Please check the format.'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsArrayBuffer(file);
        });
    }

    // Convert workbook to training data (async for large files)
    async convertFromWorkbook(workbook, progressCallback = null) {
        // Strategy 1: Single sheet with all data
        if (workbook.SheetNames.length === 1) {
            return await this.convertFromSingleSheet(workbook.Sheets[workbook.SheetNames[0]], progressCallback);
        }
        
        // Strategy 2: Multiple sheets (one per class)
        if (workbook.SheetNames.length > 1) {
            return await this.convertFromMultipleSheets(workbook, progressCallback);
        }
        
        return null;
    }

    // Convert from single sheet (chunked for large files)
    async convertFromSingleSheet(sheet, progressCallback = null) {
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
        
        if (jsonData.length < 2) {
            throw new Error('Excel file must have at least a header row and one data row');
        }

        const header = jsonData[0];
        const allRows = jsonData.slice(1);
        const rows = allRows.filter(row => row.some(cell => cell !== null));
        
        if (progressCallback) {
            progressCallback(0, rows.length, 'Processing rows...');
        }

        // Detect format
        // Format 1: Label in first column, features in rest
        // Format 2: Features first, label in last column
        // Format 3: Features only, label in separate column or sheet

        let labelIndex = -1;
        let featureStartIndex = 0;
        let featureEndIndex = header.length;

        // Find label column
        const labelColumnNames = ['label', 'class', 'sign', 'letter', 'word', 'target', 'y'];
        for (let i = 0; i < header.length; i++) {
            const colName = String(header[i] || '').toLowerCase().trim();
            if (labelColumnNames.includes(colName)) {
                labelIndex = i;
                break;
            }
        }

        // If no label column found, check if first column looks like labels
        if (labelIndex === -1) {
            // Check if first column contains string labels
            const firstColValues = rows.map(row => String(row[0] || '').trim()).filter(v => v);
            const isLabelColumn = firstColValues.every(v => 
                v.length <= 10 && /^[A-Z0-9\s]+$/i.test(v)
            );
            
            if (isLabelColumn && firstColValues.length > 0) {
                labelIndex = 0;
                featureStartIndex = 1;
            } else {
                // Assume label is in last column
                labelIndex = header.length - 1;
                featureEndIndex = header.length - 1;
            }
        } else {
            // Adjust feature indices based on label position
            if (labelIndex === 0) {
                featureStartIndex = 1;
            } else {
                featureEndIndex = labelIndex;
            }
        }

        // Extract data (chunked processing for large files)
        const trainingData = [];
        const labels = [];
        const classNames = [];
        const labelMap = {};
        
        const CHUNK_SIZE = 100; // Process 100 rows at a time
        let processed = 0;

        // Process in chunks to avoid blocking
        for (let chunkStart = 0; chunkStart < rows.length; chunkStart += CHUNK_SIZE) {
            const chunk = rows.slice(chunkStart, chunkStart + CHUNK_SIZE);
            
            for (const row of chunk) {
                // Skip empty rows
                if (!row || row.every(cell => cell === null || cell === '')) continue;

                // Extract label
                const labelValue = String(row[labelIndex] || '').trim().toUpperCase();
                if (!labelValue) continue;

                // Extract features
                const features = [];
                for (let i = featureStartIndex; i < featureEndIndex; i++) {
                    const value = row[i];
                    if (value === null || value === undefined || value === '') {
                        features.push(0);
                    } else {
                        const numValue = parseFloat(value);
                        features.push(isNaN(numValue) ? 0 : numValue);
                    }
                }

                // Validate feature size
                if (features.length !== this.featureSize) {
                    // Try to pad or truncate
                    if (features.length < this.featureSize) {
                        while (features.length < this.featureSize) {
                            features.push(0);
                        }
                    } else {
                        features.splice(this.featureSize);
                    }
                }

                // Map label to index
                if (!labelMap[labelValue]) {
                    labelMap[labelValue] = classNames.length;
                    classNames.push(labelValue);
                }

                trainingData.push(features);
                labels.push(labelMap[labelValue]);
                processed++;
            }
            
            // Update progress and yield to browser
            if (progressCallback && (chunkStart % (CHUNK_SIZE * 10) === 0 || chunkStart + CHUNK_SIZE >= rows.length)) {
                progressCallback(processed, rows.length, `Processing row ${processed} of ${rows.length}...`);
                // Yield to browser to prevent blocking
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        if (trainingData.length === 0) {
            throw new Error('No valid data rows found in Excel file');
        }

        return {
            trainingData,
            labels,
            classNames,
            numSamples: trainingData.length,
            numClasses: classNames.length
        };
    }

    // Convert from multiple sheets (one sheet per class)
    async convertFromMultipleSheets(workbook, progressCallback = null) {
        const trainingData = [];
        const labels = [];
        const classNames = [];
        let classIndex = 0;

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
            
            if (jsonData.length < 2) continue;

            const header = jsonData[0];
            const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null));

            // Class name from sheet name
            const className = sheetName.trim().toUpperCase();
            if (!classNames.includes(className)) {
                classNames.push(className);
                classIndex = classNames.length - 1;
            } else {
                classIndex = classNames.indexOf(className);
            }

            // Extract features from each row (chunked)
            const CHUNK_SIZE = 100;
            for (let chunkStart = 0; chunkStart < rows.length; chunkStart += CHUNK_SIZE) {
                const chunk = rows.slice(chunkStart, chunkStart + CHUNK_SIZE);
                
                for (const row of chunk) {
                    if (!row || row.every(cell => cell === null || cell === '')) continue;

                    const features = [];
                    for (let i = 0; i < header.length; i++) {
                        const value = row[i];
                        if (value === null || value === undefined || value === '') {
                            features.push(0);
                        } else {
                            const numValue = parseFloat(value);
                            features.push(isNaN(numValue) ? 0 : numValue);
                        }
                    }

                    // Validate and adjust feature size
                    if (features.length !== this.featureSize) {
                        if (features.length < this.featureSize) {
                            while (features.length < this.featureSize) {
                                features.push(0);
                            }
                        } else {
                            features.splice(this.featureSize);
                        }
                    }

                    trainingData.push(features);
                    labels.push(classIndex);
                }
                
                // Yield to browser periodically
                if (chunkStart % (CHUNK_SIZE * 10) === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
        }

        if (trainingData.length === 0) {
            throw new Error('No valid data found in Excel sheets');
        }

        return {
            trainingData,
            labels,
            classNames,
            numSamples: trainingData.length,
            numClasses: classNames.length
        };
    }

    // Validate converted data
    validateData(data) {
        if (!data.trainingData || !data.labels || !data.classNames) {
            return { valid: false, error: 'Missing required fields' };
        }

        if (data.trainingData.length !== data.labels.length) {
            return { valid: false, error: 'Mismatch between features and labels count' };
        }

        if (data.trainingData.length === 0) {
            return { valid: false, error: 'No training data' };
        }

        // Check feature size
        const firstFeatureSize = data.trainingData[0]?.length || 0;
        if (firstFeatureSize !== this.featureSize) {
            return { 
                valid: false, 
                error: `Feature size mismatch. Expected ${this.featureSize}, got ${firstFeatureSize}` 
            };
        }

        // Check label indices
        const maxLabel = Math.max(...data.labels);
        if (maxLabel >= data.classNames.length) {
            return { valid: false, error: 'Label index out of range' };
        }

        return { valid: true };
    }
}

// Export for use in other scripts
window.ExcelConverter = ExcelConverter;

