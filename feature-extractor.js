// Feature Extraction from Hand Landmarks
class FeatureExtractor {
    constructor() {
        this.featureSize = 126; // 21 landmarks * 2 hands * 3 coordinates
    }

    // Extract features from hand landmarks
    extractFeatures(landmarks) {
        if (!landmarks || landmarks.length === 0) {
            return this.getEmptyFeatures();
        }

        // Normalize landmarks relative to wrist
        const normalizedLandmarks = this.normalizeLandmarks(landmarks);
        
        // Extract features
        const features = [];
        
        // Add normalized coordinates
        for (const hand of normalizedLandmarks) {
            for (const landmark of hand) {
                features.push(landmark.x);
                features.push(landmark.y);
                features.push(landmark.z || 0);
            }
        }

        // Pad if only one hand detected
        if (normalizedLandmarks.length === 1) {
            const emptyHand = Array(21).fill({ x: 0, y: 0, z: 0 });
            for (const landmark of emptyHand) {
                features.push(landmark.x);
                features.push(landmark.y);
                features.push(landmark.z);
            }
        }

        // Ensure correct size
        while (features.length < this.featureSize) {
            features.push(0);
        }

        return features.slice(0, this.featureSize);
    }

    // Normalize landmarks relative to wrist (landmark 0)
    normalizeLandmarks(landmarks) {
        return landmarks.map(hand => {
            if (!hand || hand.length === 0) return [];
            
            const wrist = hand[0];
            const normalized = hand.map(landmark => ({
                x: landmark.x - wrist.x,
                y: landmark.y - wrist.y,
                z: (landmark.z || 0) - (wrist.z || 0)
            }));

            // Calculate scale (distance from wrist to middle finger MCP)
            const scale = Math.sqrt(
                Math.pow(normalized[9].x, 2) + 
                Math.pow(normalized[9].y, 2) + 
                Math.pow(normalized[9].z, 2)
            ) || 1;

            // Normalize by scale
            return normalized.map(landmark => ({
                x: landmark.x / scale,
                y: landmark.y / scale,
                z: landmark.z / scale
            }));
        });
    }

    // Get empty features (no hands detected)
    getEmptyFeatures() {
        return Array(this.featureSize).fill(0);
    }

    // Extract additional geometric features
    extractGeometricFeatures(landmarks) {
        if (!landmarks || landmarks.length === 0) {
            return [];
        }

        const features = [];
        const hand = landmarks[0];

        // Finger distances
        const thumbTip = hand[4];
        const indexTip = hand[8];
        const middleTip = hand[12];
        const ringTip = hand[16];
        const pinkyTip = hand[20];

        // Distances between fingertips
        features.push(this.distance(thumbTip, indexTip));
        features.push(this.distance(indexTip, middleTip));
        features.push(this.distance(middleTip, ringTip));
        features.push(this.distance(ringTip, pinkyTip));
        features.push(this.distance(thumbTip, pinkyTip));

        // Finger angles
        features.push(this.angle(hand[2], hand[3], hand[4])); // Thumb
        features.push(this.angle(hand[5], hand[6], hand[8])); // Index
        features.push(this.angle(hand[9], hand[10], hand[12])); // Middle
        features.push(this.angle(hand[13], hand[14], hand[16])); // Ring
        features.push(this.angle(hand[17], hand[18], hand[20])); // Pinky

        return features;
    }

    // Calculate distance between two points
    distance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = (point1.z || 0) - (point2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // Calculate angle between three points
    angle(point1, point2, point3) {
        const v1 = {
            x: point1.x - point2.x,
            y: point1.y - point2.y,
            z: (point1.z || 0) - (point2.z || 0)
        };
        const v2 = {
            x: point3.x - point2.x,
            y: point3.y - point2.y,
            z: (point3.z || 0) - (point2.z || 0)
        };

        const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

        if (mag1 === 0 || mag2 === 0) return 0;
        return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
    }

    // Extract hand pose features (simplified ASL alphabet detection)
    extractPoseFeatures(landmarks) {
        if (!landmarks || landmarks.length === 0) {
            return null;
        }

        const hand = landmarks[0];
        const features = {
            fingersExtended: [],
            fingerAngles: [],
            handOpen: false
        };

        // Check which fingers are extended
        const fingerTips = [4, 8, 12, 16, 20];
        const fingerMCPs = [2, 5, 9, 13, 17];

        fingerTips.forEach((tipIdx, fingerIdx) => {
            const tip = hand[tipIdx];
            const mcp = hand[fingerMCPs[fingerIdx]];
            features.fingersExtended.push(tip.y < mcp.y);
        });

        return features;
    }
}

// Export for use in other scripts
window.FeatureExtractor = FeatureExtractor;
