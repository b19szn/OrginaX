import { prisma } from "@/lib/prisma";

export async function ensureAdminDefaults() {
  try {
    // 1. Purge unused providers that are not part of the multi-modal framework
    await prisma.aIProviderConfig.deleteMany({
      where: {
        provider: {
          in: ["ANTHROPIC", "GEMINI", "DEEPSEEK", "GROK", "QDRANT", "MILVUS", "HUGGINGFACE"],
        },
      },
    });

    // 2. Ensure only active in-use AI providers exist
    const activeProviders = [
      {
        provider: "SENTENCE_BERT",
        name: "Sentence-BERT Text Embedding Engine",
        modelId: "sentence-transformers/all-MiniLM-L6-v2",
        apiKeyMasked: process.env.HUGGINGFACE_API_KEY ? "hf_••••••••" + process.env.HUGGINGFACE_API_KEY.slice(-4) : "hf_••••••••90bc",
        isEnabled: true,
        isFallback: false,
        maxTokens: 512,
        temperature: 0.0,
        timeoutMs: 8000,
        lastLatencyMs: 110,
        status: "HEALTHY",
      },
      {
        provider: "CODEBERT",
        name: "CodeBERT & AST Structural Normalizer",
        modelId: "microsoft/codebert-base",
        apiKeyMasked: process.env.HUGGINGFACE_API_KEY ? "hf_••••••••" + process.env.HUGGINGFACE_API_KEY.slice(-4) : "hf_••••••••90bc",
        isEnabled: true,
        isFallback: false,
        maxTokens: 512,
        temperature: 0.0,
        timeoutMs: 8000,
        lastLatencyMs: 125,
        status: "HEALTHY",
      },
      {
        provider: "CLIP",
        name: "OpenAI CLIP Vision Transformer (ViT-B/32)",
        modelId: "openai/clip-vit-base-patch32",
        apiKeyMasked: process.env.OPENAI_API_KEY ? "sk-proj-••••••••" + process.env.OPENAI_API_KEY.slice(-4) : "sk-proj-••••••••7f2b",
        isEnabled: true,
        isFallback: false,
        maxTokens: 0,
        temperature: 0.0,
        timeoutMs: 9000,
        lastLatencyMs: 140,
        status: "HEALTHY",
      },
      {
        provider: "LOCAL",
        name: "Local Zero-Knowledge Vectorizer & AST Engine",
        modelId: "deterministic-ast-tfidf-v2",
        apiKeyMasked: null,
        isEnabled: true,
        isFallback: true,
        maxTokens: 8192,
        temperature: 0.0,
        timeoutMs: 5000,
        lastLatencyMs: 12,
        status: "HEALTHY",
      },
      {
        provider: "OPENAI",
        name: "OpenAI Multi-Modal Gateway",
        modelId: "text-embedding-3-large",
        apiKeyMasked: process.env.OPENAI_API_KEY ? "sk-proj-••••••••" + process.env.OPENAI_API_KEY.slice(-4) : "sk-proj-••••••••7f2b",
        isEnabled: !!process.env.OPENAI_API_KEY,
        isFallback: false,
        maxTokens: 4096,
        temperature: 0.1,
        timeoutMs: 12000,
        lastLatencyMs: 195,
        status: process.env.OPENAI_API_KEY ? "HEALTHY" : "DISCONNECTED",
      },
    ];

    for (const p of activeProviders) {
      const existing = await prisma.aIProviderConfig.findFirst({
        where: { provider: p.provider },
      });
      if (!existing) {
        await prisma.aIProviderConfig.create({ data: p });
      }
    }

    // 2. Ensure Multimodal Scoring Formula
    const formulaCount = await prisma.multimodalScoringFormula.count();
    if (formulaCount === 0) {
      await prisma.multimodalScoringFormula.create({
        data: {
          textWeight: 0.40,
          codeWeight: 0.35,
          diagramWeight: 0.25,
          similarityThreshold: 75.0,
          strictMode: true,
          updatedBy: "system_initializer",
        },
      });
    }

    // 3. Ensure Default CMS Nodes
    const cmsCount = await prisma.cmsNode.count();
    if (cmsCount === 0) {
      await prisma.cmsNode.createMany({
        data: [
          {
            key: "hero_banner",
            title: "Homepage Hero Section",
            contentJson: JSON.stringify({
              headline: "AI Plagiarism Detection Beyond Text",
              subheadline: "Enterprise-grade multi-modal similarity analysis framework spanning natural text, scanned academic PDFs, source code ASTs, and visual diagrams.",
              badge: "v2.4 Zero-Knowledge Architecture Active",
              ctaText: "Launch Analysis Dashboard",
            }),
            isPublished: true,
          },
          {
            key: "pricing_tiers",
            title: "Public Pricing Table",
            contentJson: JSON.stringify([
              { name: "Student Free", price: "$0", allowance: "50 scans/mo", features: ["Single PDF/Text check", "Basic Code AST analysis", "Standard turnaround"] },
              { name: "Faculty Pro", price: "$29", allowance: "1,000 scans/mo", features: ["Classroom Batch Matrix (N x N)", "Collusion Watchlist", "Detailed Token Diffs", "Priority AI Gateway"] },
              { name: "University Campus", price: "Custom", allowance: "Unlimited scans", features: ["LMS Canvas/Moodle LTI sync", "Dedicated On-Prem Vectorizer", "HIPAA/FERPA Zero-Knowledge SLA", "Custom RBAC"] },
            ]),
            isPublished: true,
          },
          {
            key: "announcement_bar",
            title: "Global Broadcast Announcement",
            contentJson: JSON.stringify({
              isActive: false,
              message: "Scheduled infrastructure maintenance: Sunday 02:00 AM UTC (Est. duration: 15 minutes). Scans will queue automatically.",
              variant: "warning",
            }),
            isPublished: true,
          },
          {
            key: "privacy_policy",
            title: "Zero-Knowledge Academic Privacy Policy",
            contentJson: JSON.stringify({
              title: "Zero-Knowledge Data Privacy Guarantee",
              body: "OriginaX operates under strict zero-knowledge principles. Administrators, platform operators, and automated workers are mathematically isolated from the underlying content of user documents. Files are hashed and processed via memory-isolated ephemeral workers.",
            }),
            isPublished: true,
          },
        ],
      });
    }

    // 4. Ensure Subscription Tiers
    const tierCount = await prisma.subscriptionTier.count();
    if (tierCount === 0) {
      await prisma.subscriptionTier.createMany({
        data: [
          {
            code: "FREE",
            name: "Free Student Sandbox",
            priceMonthlyCents: 0,
            monthlyScanAllowance: 50,
            rateLimitPerMinute: 10,
            overagePricePerScanCents: 0,
            featuresJson: JSON.stringify(["50 Scans/month", "Standard Text & Code", "Community Support"]),
            isActive: true,
          },
          {
            code: "PRO",
            name: "Instructor Professional",
            priceMonthlyCents: 2900,
            monthlyScanAllowance: 1000,
            rateLimitPerMinute: 60,
            overagePricePerScanCents: 5,
            featuresJson: JSON.stringify(["1,000 Scans/month", "Classroom Matrix (N x N)", "Priority Queue", "Exportable PDF/JSON"]),
            isActive: true,
          },
          {
            code: "ENTERPRISE",
            name: "Academic Institution",
            priceMonthlyCents: 19900,
            monthlyScanAllowance: 10000,
            rateLimitPerMinute: 300,
            overagePricePerScanCents: 2,
            featuresJson: JSON.stringify(["10,000+ Scans/month", "Full Multimodal Engine", "Dedicated Vector DB", "Audit Logs & RBAC"]),
            isActive: true,
          },
        ],
      });
    }

    // 5. Ensure Payment Gateways
    const gatewayCount = await prisma.paymentGatewayConfig.count();
    if (gatewayCount === 0) {
      await prisma.paymentGatewayConfig.createMany({
        data: [
          {
            gateway: "STRIPE",
            name: "Stripe Billing & Subscriptions",
            publicKey: "pk_test_51Mz••••••••382b",
            secretKeyMasked: "sk_test_••••••••781a",
            webhookSecretMasked: "whsec_••••••••01fa",
            isLiveMode: false,
            isEnabled: true,
          },
          {
            gateway: "LEMON_SQUEEZY",
            name: "Lemon Squeezy Merchant of Record",
            publicKey: "lms_pub_••••••••112c",
            secretKeyMasked: "lms_sec_••••••••490d",
            webhookSecretMasked: "lms_wh_••••••••66ab",
            isLiveMode: false,
            isEnabled: false,
          },
          {
            gateway: "SSLCOMMERZ",
            name: "SSLCommerz Regional Gateway",
            publicKey: "ssl_store_••••••••55",
            secretKeyMasked: "ssl_pwd_••••••••90",
            webhookSecretMasked: null,
            isLiveMode: false,
            isEnabled: false,
          },
        ],
      });
    }

    // 6. Ensure default Admin Settings (Tracking & Telemetry)
    const settingsCount = await prisma.adminSetting.count();
    if (settingsCount === 0) {
      await prisma.adminSetting.createMany({
        data: [
          { key: "maintenance_mode", value: "false", description: "Engage global maintenance lockout for non-admin users" },
          { key: "ga4_measurement_id", value: "G-ORIGINAX892", description: "Google Analytics 4 Measurement ID" },
          { key: "clarity_project_id", value: "clarity_orgx_99", description: "Microsoft Clarity Project ID" },
          { key: "gtm_container_id", value: "GTM-NX88712", description: "Google Tag Manager Container ID" },
          { key: "meta_pixel_id", value: "", description: "Facebook Pixel ID" },
          { key: "system_alert_webhook", value: "https://hooks.slack.com/services/T00/B00/XXXX", description: "Outbound alerts webhook" },
        ],
      });
    }
  } catch (error) {
    console.error("Failed to ensure admin defaults:", error);
  }
}
