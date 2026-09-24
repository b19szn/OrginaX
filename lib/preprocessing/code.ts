/**
 * Source Code Preprocessing Service
 * Language detection, comment removal, AST-structural tokenization, and line normalization.
 */

export interface NormalizedCodeResult {
  rawCode: string;
  language: string;
  cleanedCode: string;
  structuralTokens: string[];
  lines: string[];
  tokenCount: number;
}

export function detectLanguage(filenameOrCode: string): string {
  const lower = filenameOrCode.toLowerCase();
  if (lower.endsWith(".py") || lower.includes("def ") || lower.includes("import sys") || lower.includes("elif ")) {
    return "python";
  }
  if (lower.endsWith(".cpp") || lower.endsWith(".cc") || lower.endsWith(".h") || lower.includes("#include <") || lower.includes("std::")) {
    return "cpp";
  }
  if (lower.endsWith(".java") || lower.includes("public static void main")) {
    return "java";
  }
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
    return "typescript";
  }
  if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.includes("const ") || lower.includes("function ")) {
    return "javascript";
  }
  if (lower.endsWith(".go") || lower.includes("func main()")) {
    return "go";
  }
  return "generic_code";
}

export function stripComments(code: string, language: string): string {
  if (language === "python") {
    // Strip multi-line docstrings """...""" and '''...'''
    let stripped = code.replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, "");
    // Strip single-line comments #
    stripped = stripped.replace(/#.*$/gm, "");
    return stripped;
  }

  // C-style comments (C++, Java, JS, TS, Go)
  let stripped = code.replace(/\/\*[\s\S]*?\*\//g, "");
  stripped = stripped.replace(/\/\/.*$/gm, "");
  return stripped;
}

export function tokenizeCodeStructurally(code: string): string[] {
  // Extract keywords, symbols, and token shapes
  const tokens = code
    .replace(/[{}()\[\],;.]/g, " $& ")
    .split(/\s+/)
    .filter((t) => t.trim().length > 0);

  // Structural normalization: map keywords vs generic identifiers
  const KEYWORDS = new Set([
    "if", "else", "elif", "for", "while", "do", "return", "def", "function", "class",
    "int", "float", "char", "void", "bool", "auto", "const", "let", "var", "import",
    "from", "include", "public", "private", "protected", "static", "try", "catch",
    "finally", "throw", "break", "continue", "switch", "case", "default"
  ]);

  return tokens.map((token) => {
    if (KEYWORDS.has(token.toLowerCase())) {
      return token.toLowerCase();
    }
    if (/^[0-9]+(\.[0-9]+)?$/.test(token)) {
      return "<NUM>";
    }
    if (/^["'].*["']$/.test(token)) {
      return "<STR>";
    }
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
      return "<ID>";
    }
    return token;
  });
}

export function preprocessCode(rawCode: string, suggestedFilename = ""): NormalizedCodeResult {
  const language = detectLanguage(suggestedFilename || rawCode);
  const withoutComments = stripComments(rawCode, language);

  const lines = withoutComments
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  const cleanedCode = lines.join("\n");
  const structuralTokens = tokenizeCodeStructurally(cleanedCode);

  return {
    rawCode,
    language,
    cleanedCode,
    structuralTokens,
    lines,
    tokenCount: structuralTokens.length,
  };
}
