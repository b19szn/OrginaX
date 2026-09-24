/**
 * Plagiarism Confidence Scoring and Classification
 * Maps raw cosine embeddings to calibrated 0-100% confidence scores with thesis threshold tiers.
 */

export type SimilarityTier = "HIGH" | "MODERATE" | "LOW";

export interface ConfidenceScoreResult {
  rawCosine: number;
  confidenceScore: number; // 0 - 100
  tier: SimilarityTier;
  label: string;
  description: string;
  badgeColor: {
    bg: string;
    border: string;
    text: string;
  };
}

export function calculateConfidenceScore(rawCosine: number): ConfidenceScoreResult {
  // Normalize cosine (-1 to 1 or 0 to 1) to a 0-100 percentage
  // In dense embedding spaces, negative cosine is rare for related content
  const clamped = Math.max(0, Math.min(1, rawCosine));
  const confidenceScore = Math.round(clamped * 1000) / 10; // e.g. 87.5%

  if (confidenceScore >= 85) {
    return {
      rawCosine,
      confidenceScore,
      tier: "HIGH",
      label: "High Similarity (Potential Plagiarism)",
      description:
        "Extensive semantic, structural, or visual overlap detected. Significant risk of unauthorized reproduction or verbatim cloning.",
      badgeColor: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
      },
    };
  } else if (confidenceScore >= 60) {
    return {
      rawCosine,
      confidenceScore,
      tier: "MODERATE",
      label: "Moderate Similarity (Paraphrased / Refactored)",
      description:
        "Partial overlap identified with evidence of structural rearrangement, heavy paraphrasing, or renamed identifiers.",
      badgeColor: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
      },
    };
  } else {
    return {
      rawCosine,
      confidenceScore,
      tier: "LOW",
      label: "Low Similarity (Original Work)",
      description:
        "Nominal or incidental similarity within expected independent baseline bounds. Content appears substantially original.",
      badgeColor: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
      },
    };
  }
}
