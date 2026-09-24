/**
 * Text & PDF Preprocessing Service
 * Handles text extraction, tokenization, stopword cleaning, and sentence segmentation.
 */

const COMMON_STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't",
  "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
  "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
  "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
  "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
  "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the",
  "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
  "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
  "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
  "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

export interface NormalizedTextResult {
  rawText: string;
  cleanedText: string;
  sentences: string[];
  tokenCount: number;
  uniqueTokens: string[];
}

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

export function segmentSentences(text: string): string[] {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return [];

  // Split on paragraph, line breaks, or sentence boundaries
  const rawSegments = normalized
    .split(/(?<=[.?!])\s+(?=[A-Z0-9"'])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return rawSegments;
}

export function tokenizeText(text: string, removeStopwords = true): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  if (!removeStopwords) return words;
  return words.filter((w) => !COMMON_STOPWORDS.has(w));
}

export function preprocessText(rawText: string): NormalizedTextResult {
  const normalized = normalizeWhitespace(rawText);
  const sentences = segmentSentences(normalized);
  const tokens = tokenizeText(normalized, true);
  const uniqueTokens = Array.from(new Set(tokens));

  return {
    rawText,
    cleanedText: normalized,
    sentences,
    tokenCount: tokens.length,
    uniqueTokens,
  };
}

/**
 * Production PDF and binary document text extraction using pdf2json and PDFParse
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeTypeOrFilename: string): Promise<string> {
  const isPdf =
    mimeTypeOrFilename.toLowerCase().includes("pdf") ||
    (buffer.length >= 4 && buffer.slice(0, 4).toString() === "%PDF");

  if (isPdf) {
    // Tier 1: Try pdf2json (pure Node stream parser without external worker requirements)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const PDFParser = require("pdf2json");
      const textFromPdf2Json = await new Promise<string>((resolve, reject) => {
        const parser = new PDFParser(null, 1);
        parser.on("pdfParser_dataError", (err: { parserError: unknown }) => reject(err.parserError));
        parser.on("pdfParser_dataReady", () => {
          resolve(parser.getRawTextContent() || "");
        });
        parser.parseBuffer(buffer);
      });

      if (textFromPdf2Json && textFromPdf2Json.trim().length > 0) {
        return textFromPdf2Json.trim();
      }
    } catch (err) {
      console.warn("pdf2json extraction error, attempting pdf-parse fallback:", err);
    }

    // Tier 2: Try pdf-parse
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParseModule = require("pdf-parse");
      const PDFParseClass = pdfParseModule.PDFParse || pdfParseModule;
      if (typeof PDFParseClass === "function") {
        const parser = new PDFParseClass({ data: buffer });
        const result = await parser.getText();
        await parser.destroy();
        if (result && result.text && result.text.trim().length > 0) {
          return result.text.trim();
        }
      }
    } catch (err) {
      console.warn("PDFParse extraction error, attempting stream regex fallback:", err);
    }

    // Tier 3: Secondary fallback for uncompressed text streams
    const raw = buffer.toString("utf-8");
    const textMatches = raw.match(/\(([^()]*)\)\s*Tj/g);
    if (textMatches && textMatches.length > 0) {
      return textMatches
        .map((m) => m.replace(/^\(|\)\s*Tj$/g, ""))
        .join(" ");
    }

    // If it's a PDF and all text extraction yielded nothing, don't return raw binary stream
    return "";
  }

  return buffer.toString("utf-8");
}
