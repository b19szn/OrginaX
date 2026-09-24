# Implementation Plan
## AI Tool to Detect Plagiarism Beyond Text: A Multi-Modal Similarity Analysis Framework

**Stack:** Next.js (App Router) · MySQL · Prisma ORM · Pre-trained AI APIs (no custom model training)

This document is written to be handed directly to an AI coding assistant (e.g. Claude Code) as a build spec. It breaks the system into phases, each with concrete deliverables, file structure, database schema, and API contracts, so the assistant can implement it incrementally and testably.

---

## 1. Project Goal (recap)

Build a web platform where a user uploads two artifacts (any combination of **text/PDF, source code, or images**) and the system:
1. Normalizes/preprocesses each artifact by type.
2. Extracts feature embeddings using **existing pre-trained AI APIs** (no training from scratch).
3. Computes a similarity/confidence score between the two artifacts.
4. Produces a **Unified Originality Report** with visual mapping of where the overlap occurs (highlighted text diff, code AST diff, image region heatmap).

This maps directly to the architecture already defined in the thesis (Figure 1.1): Upload → Preprocessing → API Gateway → Modality-specific APIs → Cross-Artifact Feature Mapping → Similarity & Confidence Scoring → Unified Report.

---

## 2. Recommended AI APIs per Modality

Since the project's core design constraint is "leverage existing APIs, don't train new models," pick one primary provider per modality and one fallback:

| Modality | Primary API | What it gives you | Fallback |
|---|---|---|---|
| Text / PDF | HuggingFace Inference API — `sentence-transformers/all-MiniLM-L6-v2` (Sentence-BERT) | Sentence embeddings for semantic similarity | OpenAI `text-embedding-3-small` |
| Source Code | HuggingFace Inference API — `microsoft/codebert-base` or `Salesforce/codet5p-110m-embedding` | Code embeddings capturing structural/semantic similarity | AST-based structural diff (custom, using `tree-sitter` — not an AI model, just parsing) as a second signal |
| Images | HuggingFace Inference API or OpenAI — `openai/clip-vit-base-patch32` (CLIP) | Visual embeddings for perceptual/structural similarity | `imagehash` (perceptual hashing) as a lightweight fallback signal |

All embeddings are compared using **cosine similarity**, normalized to a 0–100 confidence score. Store the raw score, the normalized score, and which API/model version produced it (for reproducibility, which strengthens your thesis defense).

---

## 3. High-Level Architecture (Next.js implementation of Fig. 1.1)

```
[Next.js Frontend — Upload Dashboard]
        |
        v
[Next.js API Routes — /api/upload]  --> stores raw file in disk/S3, creates DB record
        |
        v
[Preprocessing Service]  --> per-type normalization (OCR/text extraction, AST parse, image resize+grayscale)
        |
        v
[API Gateway Layer — /lib/ai-gateway]  --> routes normalized data to the right external AI API
        |
        v
[Comparison Engine — /lib/similarity]  --> cosine similarity + confidence scoring across artifact pairs
        |
        v
[Report Generator — /api/report/[id]]  --> builds Unified Originality Report (JSON + rendered visualization)
        |
        v
[Next.js Frontend — Report/Visualization Page]
```

---

## 4. Database Schema (Prisma / MySQL)

```prisma
// schema.prisma

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ArtifactType {
  TEXT
  PDF
  CODE
  IMAGE
}

enum JobStatus {
  PENDING
  PREPROCESSING
  EXTRACTING
  COMPARING
  COMPLETE
  FAILED
}

model User {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  passwordHash String
  role         String        @default("STUDENT") // STUDENT | TEACHER | ADMIN
  submissions  Submission[]
  createdAt    DateTime      @default(now())
}

model Submission {
  id          String       @id @default(cuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  title       String
  artifacts   Artifact[]
  jobs        ComparisonJob[]
  createdAt   DateTime     @default(now())
}

model Artifact {
  id             String       @id @default(cuid())
  submissionId   String
  submission     Submission   @relation(fields: [submissionId], references: [id])
  type           ArtifactType
  originalFileUrl String
  normalizedText  String?     @db.Text   // extracted/cleaned text (for TEXT/PDF/CODE)
  language        String?                // for CODE, e.g. "python", "cpp"
  embedding       Json?                  // stored vector (array of floats) from AI API
  embeddingModel  String?                // e.g. "all-MiniLM-L6-v2"
  createdAt       DateTime     @default(now())

  comparisonsAsA ComparisonJob[] @relation("ArtifactA")
  comparisonsAsB ComparisonJob[] @relation("ArtifactB")
}

model ComparisonJob {
  id            String     @id @default(cuid())
  submissionId  String
  submission    Submission @relation(fields: [submissionId], references: [id])
  artifactAId   String
  artifactA     Artifact   @relation("ArtifactA", fields: [artifactAId], references: [id])
  artifactBId   String
  artifactB     Artifact   @relation("ArtifactB", fields: [artifactBId], references: [id])
  status        JobStatus  @default(PENDING)
  similarityScore Float?   // 0-100 normalized confidence score
  rawCosine       Float?
  reportJson      Json?    // structured report: overlap regions, diff spans, etc.
  errorMessage    String?
  createdAt       DateTime @default(now())
  completedAt     DateTime?
}
```

Run: `npx prisma migrate dev --name init`

---

## 5. Next.js Project Structure

```
/app
  /(auth)/login/page.tsx
  /(auth)/register/page.tsx
  /dashboard/page.tsx                 -> Upload Dashboard (Fig 1.1 entry point)
  /dashboard/submission/[id]/page.tsx -> Status + trigger comparison
  /report/[jobId]/page.tsx            -> Unified Originality Report view
  /api/auth/[...nextauth]/route.ts
  /api/upload/route.ts                -> handles multi-modal file upload
  /api/preprocess/route.ts            -> triggers preprocessing pipeline
  /api/compare/route.ts               -> triggers comparison job
  /api/report/[jobId]/route.ts        -> fetch report JSON
/lib
  /prisma.ts                          -> Prisma client singleton
  /preprocessing/
    text.ts                           -> OCR/PDF text extraction, stopword removal, normalization
    code.ts                           -> tokenization + AST parsing (tree-sitter)
    image.ts                          -> resize, grayscale, format normalization
  /ai-gateway/
    textEmbedding.ts                  -> calls Sentence-BERT API
    codeEmbedding.ts                  -> calls CodeBERT API
    imageEmbedding.ts                 -> calls CLIP API
    index.ts                          -> routes by ArtifactType to the right function
  /similarity/
    cosine.ts                         -> cosine similarity calculation
    scoring.ts                        -> normalizes raw cosine -> 0-100 confidence score
    diffMapping.ts                    -> generates overlap regions for visualization (text diff, AST diff, image patch comparison)
  /queue/
    jobRunner.ts                      -> orchestrates PENDING -> PREPROCESSING -> EXTRACTING -> COMPARING -> COMPLETE
/components
  UploadDashboard.tsx
  ArtifactCard.tsx
  SimilarityGauge.tsx                 -> visual confidence score (radial gauge)
  DiffViewer.tsx                      -> side-by-side text/code diff highlighting
  ImageHeatmapOverlay.tsx             -> highlights visually similar image regions
  ReportSummary.tsx
/prisma/schema.prisma
```

---

## 6. Build Phases (give these to your AI coding assistant one at a time)

### Phase 1 — Project Setup
- `npx create-next-app@latest` with TypeScript, App Router, Tailwind.
- Install: `prisma`, `@prisma/client`, `next-auth`, `zod`, `react-dropzone`, `pdf-parse`, `tree-sitter` (or `@babel/parser` for JS, `python-ast`/simple tokenizer for Python), `sharp` (image processing), `axios`.
- Set up MySQL locally or via PlanetScale/Railway; configure `DATABASE_URL` in `.env`.
- Run initial Prisma migration from the schema above.
- Set up basic auth (NextAuth credentials provider is enough for a capstone demo).

### Phase 2 — Upload Dashboard (Fig 1.1: "User Upload Dashboard")
- Build `/dashboard` page with `react-dropzone`, three upload zones matching the thesis figure: **Text & PDF**, **Source Code**, **Visual/Graphics**.
- `POST /api/upload`: accepts file + type, stores file (local `/uploads` dir for dev, or S3/Cloudinary for production), creates `Artifact` row with `originalFileUrl`.
- Validate file types server-side with `zod` + mime-type checks.

### Phase 3 — Preprocessing Pipeline (Fig 1.2)
Implement per-type normalization exactly as scoped in the thesis:
- **Text/PDF**: `pdf-parse` (or OCR via `tesseract.js` for scanned PDFs) → strip stopwords → normalize whitespace/casing → store in `Artifact.normalizedText`.
- **Source Code**: tokenize + parse to AST (use `tree-sitter` with language grammars for C++/Python per the thesis scope) → flatten AST to a normalized string/sequence → store in `Artifact.normalizedText`, set `Artifact.language`.
- **Image**: `sharp` to resize to a fixed dimension + convert to grayscale (or keep RGB if using CLIP, which expects RGB) → store normalized image alongside original.

Expose this as `POST /api/preprocess` which updates `ComparisonJob.status` to `PREPROCESSING` then `EXTRACTING`.

### Phase 4 — API Gateway / Embedding Extraction
- `lib/ai-gateway/index.ts`: given an `Artifact`, dispatch to the correct embedding function based on `type`.
- Each embedding function calls the HuggingFace Inference API (or OpenAI) with the normalized content, receives a vector, and stores it in `Artifact.embedding` (JSON array) + `Artifact.embeddingModel`.
- Wrap all external calls with try/catch → on failure set `ComparisonJob.status = FAILED` and store `errorMessage`.
- Add basic rate-limit/retry handling (exponential backoff) since free-tier inference APIs can be slow/rate-limited.

### Phase 5 — Cross-Artifact Comparison Engine
- `lib/similarity/cosine.ts`: standard cosine similarity between two embedding vectors.
- `lib/similarity/scoring.ts`: map cosine similarity (typically -1 to 1, in practice 0 to 1 for these models) to a 0–100 confidence score, with documented thresholds (e.g. >85 = high similarity, 60–85 = moderate, <60 = low) — this thresholding logic is worth documenting well since your thesis committee will likely ask about it.
- `lib/similarity/diffMapping.ts`:
  - Text/Code: use a sentence/line-level embedding comparison (not just one global vector) to find which specific spans overlap most, or use a classic diff library (`diff` npm package) combined with embedding similarity per chunk — this gives you the "detailed visual mapping" the thesis promises.
  - Image: split each image into an N×N grid, embed each patch with CLIP, compare patch-to-patch, output a heatmap grid of similarity scores.
- `POST /api/compare`: creates/updates a `ComparisonJob`, runs the above pipeline, writes `similarityScore`, `rawCosine`, and `reportJson` (structured overlap data), sets status `COMPLETE`.

### Phase 6 — Unified Originality Report + Visualization
- `/report/[jobId]/page.tsx`: fetches `reportJson` via `/api/report/[jobId]`.
- `SimilarityGauge.tsx`: radial/gauge chart showing the 0–100 confidence score.
- `DiffViewer.tsx`: side-by-side view with highlighted overlapping spans for text/code (color-coded by similarity strength).
- `ImageHeatmapOverlay.tsx`: renders the patch-similarity grid as a semi-transparent heatmap over the image.
- Add a "Download Report" button that generates a PDF summary (use `@react-pdf/renderer` or `puppeteer` for server-side PDF generation) — nice for demoing to your supervisor and evaluators.

### Phase 7 — Job Orchestration & Status Tracking
- `lib/queue/jobRunner.ts`: since a capstone demo doesn't need a full message queue, a simple sequential async function that moves a job through PENDING → PREPROCESSING → EXTRACTING → COMPARING → COMPLETE is sufficient. If you want it to feel more "production-grade" for your defense, wrap it with `BullMQ` + Redis — optional, mention as a stretch goal.
- Frontend polls `/api/report/[jobId]` or use a simple `setInterval` on `/dashboard/submission/[id]` to show live status.

### Phase 8 — Testing & Validation
- Prepare test pairs per modality: two paraphrased text documents, two code files (one a lightly modified copy of the other), two visually similar images (one cropped/rotated version of the other).
- Manually verify the confidence scores are directionally sensible (near-duplicate pairs score high, unrelated pairs score low) — this becomes your "accuracy of detection" evaluation metric mentioned in your methodology section.
- Record latency per job (already scoped as your other performance metric — "system latency") by timestamping `createdAt` → `completedAt` on `ComparisonJob`.

### Phase 9 — Deployment
- Deploy Next.js app to Vercel (or Railway if you want everything — including MySQL — in one place).
- Use PlanetScale or Railway MySQL for the database.
- Store API keys (HuggingFace/OpenAI) as environment variables, never client-side.
- If using local file storage, switch to S3-compatible storage (e.g. Cloudflare R2) before deploying, since serverless environments don't persist local disk.

---

## 7. Mapping Back to Your Thesis Objectives

This directly fulfills the four objectives listed in your Chapter 1:
- **Unified architecture for Text/PDF/Code/Image** → Phases 2–3.
- **API gateway with NLP + Computer Vision** → Phase 4.
- **Comparison algorithm with similarity degree across media types** → Phase 5.
- **Rich visual report of overlapping structures** → Phase 6.

Keep this plan alongside your thesis PDF when prompting your coding assistant — feeding it both means it will stay consistent with the terminology and figures already in your write-up (Unified Originality Report, Cross-Artifact Feature Mapping, etc.), which will make your implementation chapter easier to write later.
