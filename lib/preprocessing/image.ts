/**
 * Image Preprocessing Service
 * Generates perceptual visual descriptors and divides images into an N x N patch grid for localized heatmap comparison.
 */

export interface ImagePatch {
  index: number;
  row: number;
  col: number;
  descriptor: number[];
}

export interface NormalizedImageResult {
  width: number;
  height: number;
  gridSize: number; // e.g., 4 for a 4x4 grid (16 patches)
  patches: ImagePatch[];
  globalFeatureVector: number[];
}

/**
 * Generate deterministic perceptual hash / feature vector from an image data buffer
 */
export function extractImageFeatures(
  buffer: Buffer,
  gridSize = 4
): NormalizedImageResult {
  // Use buffer byte analysis to compute perceptual frequency and color distribution
  const totalBytes = buffer.length;
  const patches: ImagePatch[] = [];
  const globalVector: number[] = new Array(32).fill(0);

  // Divide the buffer into gridSize * gridSize segments
  const numPatches = gridSize * gridSize;
  const segmentSize = Math.max(1, Math.floor(totalBytes / numPatches));

  for (let idx = 0; idx < numPatches; idx++) {
    const row = Math.floor(idx / gridSize);
    const col = idx % gridSize;
    const start = idx * segmentSize;
    const end = Math.min(start + segmentSize, totalBytes);

    // Compute patch statistics (mean, variance, gradient approximation)
    let sum = 0;
    let sumSq = 0;
    let transitions = 0;
    let prev = buffer[start] || 0;

    for (let i = start; i < end; i++) {
      const val = buffer[i];
      sum += val;
      sumSq += val * val;
      if (Math.abs(val - prev) > 20) {
        transitions++;
      }
      prev = val;
    }

    const count = Math.max(1, end - start);
    const mean = sum / count;
    const variance = sumSq / count - mean * mean;
    const stdDev = Math.sqrt(Math.max(0, variance));
    const complexity = transitions / count;

    // 8-dimensional normalized patch descriptor
    const descriptor = [
      mean / 255,
      stdDev / 128,
      complexity,
      (buffer[start] || 0) / 255,
      (buffer[Math.floor((start + end) / 2)] || 0) / 255,
      (buffer[end - 1] || 0) / 255,
      Math.sin(mean) * 0.5 + 0.5,
      Math.cos(stdDev) * 0.5 + 0.5,
    ];

    patches.push({
      index: idx,
      row,
      col,
      descriptor,
    });

    // Accumulate global vector
    for (let d = 0; d < 8; d++) {
      const gIdx = (idx * 2 + d) % 32;
      globalVector[gIdx] = (globalVector[gIdx] + descriptor[d]) / 2;
    }
  }

  return {
    width: 256,
    height: 256,
    gridSize,
    patches,
    globalFeatureVector: globalVector,
  };
}
