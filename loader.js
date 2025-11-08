// Resource Loader - Loads all scripts asynchronously to prevent page blocking
(function() {
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContainer = document.getElementById('mainContainer');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingBar = document.getElementById('loadingBar');
    
    let loadedCount = 0;
    const totalScripts = 9;
    
    function updateProgress(message, percent) {
        if (loadingStatus) loadingStatus.textContent = message;
        if (loadingBar) loadingBar.style.width = percent + '%';
    }
    
    function loadScript(src, onLoad, onError) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                loadedCount++;
                updateProgress(`Loading... (${loadedCount}/${totalScripts})`, (loadedCount / totalScripts) * 100);
                if (onLoad) onLoad();
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load:', src);
                if (onError) onError();
                reject(new Error('Failed to load: ' + src));
            };
            document.head.appendChild(script);
        });
    }
    
    async function loadAllResources() {
        try {
            updateProgress('Loading TensorFlow.js...', 10);
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js');
            
            updateProgress('Loading Excel library...', 30);
            await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
            
            updateProgress('Loading MediaPipe Hands...', 40);
            await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
            
            updateProgress('Loading MediaPipe Camera...', 50);
            await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
            
            updateProgress('Loading MediaPipe Drawing...', 60);
            await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
            
            updateProgress('Loading ML Model...', 70);
            await loadScript('ml-model.js');
            
            updateProgress('Loading Feature Extractor...', 75);
            await loadScript('feature-extractor.js');
            
            updateProgress('Loading Data Collector...', 80);
            await loadScript('data-collector.js');
            
            updateProgress('Loading Excel Converter...', 85);
            await loadScript('excel-converter.js');
            
            updateProgress('Loading Application...', 90);
            await loadScript('app.js');
            
            updateProgress('Initializing...', 95);
            
            // Wait a moment for app to initialize, then call initializeApp if it exists
            setTimeout(() => {
                if (typeof initializeApp === 'function') {
                    try {
                        initializeApp();
                    } catch (error) {
                        console.error('Error calling initializeApp:', error);
                    }
                }
                
                updateProgress('Ready!', 100);
                setTimeout(() => {
                    if (loadingScreen) loadingScreen.style.display = 'none';
                    if (mainContainer) mainContainer.style.display = 'block';
                }, 500);
            }, 500);
            
        } catch (error) {
            console.error('Loading error:', error);
            updateProgress('Error loading resources. Please refresh the page.', 0);
            
            // Show error message
            if (loadingStatus) {
                loadingStatus.innerHTML = `
                    <div style="color: #e74c3c; margin-top: 20px;">
                        <strong>Error:</strong> ${error.message}<br>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Reload Page
                        </button>
                    </div>
                `;
            }
        }
    }
    
    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllResources);
    } else {
        loadAllResources();
    }
    
    // Timeout safety - if loading takes more than 60 seconds, show error
    setTimeout(() => {
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            updateProgress('Loading is taking longer than expected...', 0);
            loadingStatus.innerHTML = `
                <div style="color: #f39c12; margin-top: 20px;">
                    <strong>Slow Connection Detected</strong><br>
                    The page is still loading. This may take a few minutes on slow connections.<br>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }, 60000); // 60 second timeout
})();

