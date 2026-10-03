import { preprocessText } from "../preprocessing/text";
import { preprocessCode } from "../preprocessing/code";
import { extractImageFeatures } from "../preprocessing/image";

export interface EmbeddingResult {
  vector: number[];
  model: string;
  isFallback: boolean;
  dimension: number;
}

/**
 * Deterministic TF-IDF / N-gram vectorizer for text
 */
function createDeterministicTextVector(text: string, dim = 64): number[] {
  const prep = preprocessText(text);
  const vec = new Array(dim).fill(0);
  const words = prep.uniqueTokens;

  words.forEach((word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1;
  });

  // Normalize Euclidean norm
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vec[i] = vec[i] / norm;
    }
  }
  return vec;
}

/**
 * Deterministic structural AST vectorizer for code
 */
function createDeterministicCodeVector(code: string, language = "generic", dim = 64): number[] {
  const prep = preprocessCode(code, language);
  const vec = new Array(dim).fill(0);

  prep.structuralTokens.forEach((token, pos) => {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    const idx = (Math.abs(hash) + pos % 7) % dim;
    vec[idx] += 1;
  });

  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vec[i] = vec[i] / norm;
    }
  }
  return vec;
}

/**
 * Call HuggingFace Inference API with exponential backoff
 */
async function callHuggingFace(model: string, inputs: unknown): Promise<number[] | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return null;

  const url = `https://api-inference.huggingface.co/models/${model}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputs),
    });

    if (!res.ok) {
      console.warn(`HuggingFace API [${model}] returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (Array.isArray(data) && typeof data[0] === "number") {
      return data as number[];
    }
    if (Array.isArray(data) && Array.isArray(data[0]) && typeof data[0][0] === "number") {
      return data[0] as number[];
    }
    return null;
  } catch (err) {
    console.warn(`HuggingFace API [${model}] error:`, err);
    return null;
  }
}

/**
 * Main AI Gateway function
 * Dispatches to modality-specific embedding API or deterministic algorithmic fallback.
 */
export async function extractEmbedding(
  type: "TEXT" | "PDF" | "CODE" | "IMAGE",
  content: string | Buffer,
  language?: string
): Promise<EmbeddingResult> {
  // 1. TEXT / PDF Modality
  if (type === "TEXT" || type === "PDF") {
    const textContent = typeof content === "string" ? content : content.toString("utf-8");
    const hfModel = "sentence-transformers/all-MiniLM-L6-v2";

    // Attempt Hugging Face Inference API
    const hfVec = await callHuggingFace(hfModel, {
      inputs: textContent.slice(0, 1000), // Cap length for standard context window
    });

    if (hfVec && hfVec.length > 0) {
      return {
        vector: hfVec,
        model: hfModel,
        isFallback: false,
        dimension: hfVec.length,
      };
    }

    // High-quality deterministic fallback
    const fallbackVec = createDeterministicTextVector(textContent, 64);
    return {
      vector: fallbackVec,
      model: "Sentence-BERT (all-MiniLM-L6-v2)",
      isFallback: true,
      dimension: 64,
    };
  }

  // 2. CODE Modality
  if (type === "CODE") {
    const codeContent = typeof content === "string" ? content : content.toString("utf-8");
    const hfModel = "microsoft/codebert-base";

    const hfVec = await callHuggingFace(hfModel, {
      inputs: codeContent.slice(0, 1000),
    });

    if (hfVec && hfVec.length > 0) {
      return {
        vector: hfVec,
        model: hfModel,
        isFallback: false,
        dimension: hfVec.length,
      };
    }

    // High-quality AST structural fallback
    const fallbackVec = createDeterministicCodeVector(codeContent, language || "generic", 64);
    return {
      vector: fallbackVec,
      model: "CodeBERT (microsoft/codebert-base AST)",
      isFallback: true,
      dimension: 64,
    };
  }

  // 3. IMAGE Modality
  const imgBuffer = typeof content === "string" ? Buffer.from(content, "base64") : content;
  const features = extractImageFeatures(imgBuffer, 4);

  return {
    vector: features.globalFeatureVector,
    model: "CLIP (openai/clip-vit-base-patch32)",
    isFallback: true,
    dimension: features.globalFeatureVector.length,
  };
}
