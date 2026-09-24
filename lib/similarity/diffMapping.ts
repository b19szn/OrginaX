import { cosineSimilarity } from "./cosine";
import { preprocessText } from "../preprocessing/text";
import { preprocessCode } from "../preprocessing/code";
import { extractImageFeatures, NormalizedImageResult } from "../preprocessing/image";

export interface TextDiffSpan {
  id: string;
  sourceText: string;
  targetText?: string;
  similarity: number;
  status: "matched" | "modified" | "unique";
}

export interface TextDiffReport {
  overallSimilarity: number;
  matchedCount: number;
  modifiedCount: number;
  uniqueCount: number;
  spansA: TextDiffSpan[];
  spansB: TextDiffSpan[];
}

export interface CodeDiffLine {
  lineNumber: number;
  content: string;
  status: "identical" | "refactored" | "unique";
  similarity: number;
  matchedLineNumber?: number;
}

export interface CodeDiffReport {
  overallSimilarity: number;
  structuralSimilarity: number;
  identicalLinesCount: number;
  refactoredLinesCount: number;
  uniqueLinesCount: number;
  linesA: CodeDiffLine[];
  linesB: CodeDiffLine[];
}

export interface ImageHeatmapCell {
  index: number;
  row: number;
  col: number;
  similarity: number; // 0 - 1
  isHotspot: boolean; // >= 0.75
}

export interface ImageDiffReport {
  gridSize: number;
  overallVisualSimilarity: number;
  hotspotsCount: number;
  cells: ImageHeatmapCell[];
}

// Word-level Jaccard / Token Overlap
function tokenJaccard(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;

  setA.forEach((t) => {
    if (setB.has(t)) intersection++;
  });

  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function generateTextDiff(rawA: string, rawB: string): TextDiffReport {
  const prepA = preprocessText(rawA);
  const prepB = preprocessText(rawB);

  const sentsA = prepA.sentences.length > 0 ? prepA.sentences : [rawA];
  const sentsB = prepB.sentences.length > 0 ? prepB.sentences : [rawB];

  const spansA: TextDiffSpan[] = [];
  let totalScoreA = 0;
  let matchedCount = 0;
  let modifiedCount = 0;
  let uniqueCount = 0;

  sentsA.forEach((sentA, idx) => {
    const tokensA = sentA.toLowerCase().split(/\s+/);
    let bestSim = 0;
    let bestSentB = "";

    sentsB.forEach((sentB) => {
      const tokensB = sentB.toLowerCase().split(/\s+/);
      const sim = tokenJaccard(tokensA, tokensB);
      if (sim > bestSim) {
        bestSim = sim;
        bestSentB = sentB;
      }
    });

    totalScoreA += bestSim;
    let status: "matched" | "modified" | "unique" = "unique";
    if (bestSim >= 0.7) {
      status = "matched";
      matchedCount++;
    } else if (bestSim >= 0.35) {
      status = "modified";
      modifiedCount++;
    } else {
      uniqueCount++;
    }

    spansA.push({
      id: `span-a-${idx}`,
      sourceText: sentA,
      targetText: bestSentB || undefined,
      similarity: Math.round(bestSim * 100),
      status,
    });
  });

  const spansB: TextDiffSpan[] = sentsB.map((sentB, idx) => {
    const tokensB = sentB.toLowerCase().split(/\s+/);
    let bestSim = 0;
    let bestSentA = "";

    sentsA.forEach((sentA) => {
      const tokensA = sentA.toLowerCase().split(/\s+/);
      const sim = tokenJaccard(tokensB, tokensA);
      if (sim > bestSim) {
        bestSim = sim;
        bestSentA = sentA;
      }
    });

    let status: "matched" | "modified" | "unique" = "unique";
    if (bestSim >= 0.7) status = "matched";
    else if (bestSim >= 0.35) status = "modified";

    return {
      id: `span-b-${idx}`,
      sourceText: sentB,
      targetText: bestSentA || undefined,
      similarity: Math.round(bestSim * 100),
      status,
    };
  });

  const avgSim = spansA.length > 0 ? totalScoreA / spansA.length : 0;

  return {
    overallSimilarity: Math.round(avgSim * 1000) / 10,
    matchedCount,
    modifiedCount,
    uniqueCount,
    spansA,
    spansB,
  };
}

export function generateCodeDiff(rawA: string, rawB: string, language = "generic"): CodeDiffReport {
  const prepA = preprocessCode(rawA, language);
  const prepB = preprocessCode(rawB, language);

  const linesA = prepA.lines.length > 0 ? prepA.lines : rawA.split(/\r?\n/);
  const linesB = prepB.lines.length > 0 ? prepB.lines : rawB.split(/\r?\n/);

  let identicalCount = 0;
  let refactoredCount = 0;
  let uniqueCount = 0;

  const diffLinesA: CodeDiffLine[] = linesA.map((lineA, idx) => {
    const trimmedA = lineA.trim();
    let bestSim = 0;
    let matchedLineNum: number | undefined;

    linesB.forEach((lineB, bIdx) => {
      const trimmedB = lineB.trim();
      if (trimmedA === trimmedB) {
        bestSim = 1.0;
        matchedLineNum = bIdx + 1;
      } else {
        const tokensA = trimmedA.split(/\s+/);
        const tokensB = trimmedB.split(/\s+/);
        const sim = tokenJaccard(tokensA, tokensB);
        if (sim > bestSim) {
          bestSim = sim;
          matchedLineNum = bIdx + 1;
        }
      }
    });

    let status: "identical" | "refactored" | "unique" = "unique";
    if (bestSim >= 0.95) {
      status = "identical";
      identicalCount++;
    } else if (bestSim >= 0.45) {
      status = "refactored";
      refactoredCount++;
    } else {
      uniqueCount++;
    }

    return {
      lineNumber: idx + 1,
      content: lineA,
      status,
      similarity: Math.round(bestSim * 100),
      matchedLineNumber: matchedLineNum,
    };
  });

  const diffLinesB: CodeDiffLine[] = linesB.map((lineB, idx) => {
    const trimmedB = lineB.trim();
    let bestSim = 0;
    let matchedLineNum: number | undefined;

    linesA.forEach((lineA, aIdx) => {
      const trimmedA = lineA.trim();
      if (trimmedA === trimmedB) {
        bestSim = 1.0;
        matchedLineNum = aIdx + 1;
      } else {
        const tokensA = trimmedA.split(/\s+/);
        const tokensB = trimmedB.split(/\s+/);
        const sim = tokenJaccard(tokensB, tokensA);
        if (sim > bestSim) {
          bestSim = sim;
          matchedLineNum = aIdx + 1;
        }
      }
    });

    let status: "identical" | "refactored" | "unique" = "unique";
    if (bestSim >= 0.95) status = "identical";
    else if (bestSim >= 0.45) status = "refactored";

    return {
      lineNumber: idx + 1,
      content: lineB,
      status,
      similarity: Math.round(bestSim * 100),
      matchedLineNumber: matchedLineNum,
    };
  });

  // Structural AST token similarity
  const structSim = tokenJaccard(prepA.structuralTokens, prepB.structuralTokens);
  const lineSim = (identicalCount + refactoredCount * 0.7) / Math.max(1, linesA.length);
  const overall = (structSim * 0.5 + lineSim * 0.5) * 100;

  return {
    overallSimilarity: Math.round(overall * 10) / 10,
    structuralSimilarity: Math.round(structSim * 1000) / 10,
    identicalLinesCount: identicalCount,
    refactoredLinesCount: refactoredCount,
    uniqueLinesCount: uniqueCount,
    linesA: diffLinesA,
    linesB: diffLinesB,
  };
}

export function generateImageDiff(bufA: Buffer, bufB: Buffer, gridSize = 4): ImageDiffReport {
  const imgA = extractImageFeatures(bufA, gridSize);
  const imgB = extractImageFeatures(bufB, gridSize);

  const numPatches = gridSize * gridSize;
  const cells: ImageHeatmapCell[] = [];
  let totalSim = 0;
  let hotspotsCount = 0;

  for (let idx = 0; idx < numPatches; idx++) {
    const patchA = imgA.patches[idx];
    const patchB = imgB.patches[idx];
    const sim = cosineSimilarity(patchA.descriptor, patchB.descriptor);
    const normalizedSim = Math.max(0, Math.min(1, (sim + 1) / 2)); // map -1..1 to 0..1

    totalSim += normalizedSim;
    const isHotspot = normalizedSim >= 0.75;
    if (isHotspot) hotspotsCount++;

    cells.push({
      index: idx,
      row: patchA.row,
      col: patchA.col,
      similarity: Math.round(normalizedSim * 100) / 100,
      isHotspot,
    });
  }

  const globalCos = cosineSimilarity(imgA.globalFeatureVector, imgB.globalFeatureVector);
  const avgPatchSim = totalSim / numPatches;
  const overall = ((globalCos + 1) / 2 * 0.6 + avgPatchSim * 0.4) * 100;

  return {
    gridSize,
    overallVisualSimilarity: Math.round(overall * 10) / 10,
    hotspotsCount,
    cells,
  };
}
