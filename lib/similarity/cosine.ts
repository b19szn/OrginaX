/**
 * Vector Cosine Similarity Engine
 * Computes standard inner product normalized by vector Euclidean norms.
 */

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }

  const minLen = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  // Account for tail elements if lengths differ
  for (let i = minLen; i < vecA.length; i++) {
    normA += vecA[i] * vecA[i];
  }
  for (let i = minLen; i < vecB.length; i++) {
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const rawCosine = dotProduct / denominator;
  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, rawCosine));
}
