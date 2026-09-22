import type { RadarDiscovery } from "@/types/radarDiscovery";

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

/** Mock Radar Agent output — personalized AI intelligence, not LiveMap-only updates. */
export const mockRadarDiscoveries: RadarDiscovery[] = [
  {
    id: "rd-mhs-announcement-2026",
    title: "Anthropic announces Model Hardware Standard (MHS)",
    topicId: "agent-foundations-agent-environments-model-hardware-standard",
    topicSlug: "model-hardware-standard-mhs",
    syllabusPath: "AI Agents & Agentic Systems → Agent Foundations → Agent Environments → Model Hardware Standard (MHS)",
    classification: "existing_topic_update",
    summary:
      "Anthropic opened a research preview of MHS, a model-agnostic specification so AI agents can safely operate programmable lab and manufacturing equipment.",
    reason:
      "This moves agents from software tools into physical devices. For engineers and researchers already mapping agent environments, MHS is a new interface pattern worth learning now — still a preview, not an industry standard.",
    priority: "high",
    recommendedAction: "Explore",
    status: "new",
    discoveredAt: daysAgo(1),
    knowledgeLayer: "Frontiers & Emerging",
    lensRelevance: {
      "AI Engineer": "Must",
      "AI Researcher": "Must",
      "Forward Deployed Engineer": "Must",
      "AI/ML Leader": "Must",
      "AI Product Manager": "Must",
      "ML Engineer": "Good",
    },
    sources: [
      {
        type: "industry",
        title: "Previewing the Model Hardware Standard",
        url: "https://www.anthropic.com/news/model-hardware-standard-research-preview",
      },
      {
        type: "industry",
        title: "Anthropic unveils framework for agents to operate physical devices",
        url: "https://www.reuters.com/technology/anthropic-unveils-new-framework-allowing-ai-agents-operate-physical-devices-2026-08-27/",
      },
    ],
    relatedTopicSlugs: ["environment-interaction", "agent-environments", "computer-use"],
  },
  {
    id: "rd-lora-efficiency-2026",
    title: "New LoRA variant improves fine-tuning efficiency on smaller GPUs",
    topicId: "lora",
    topicSlug: "lora",
    syllabusPath: "Foundation Models → Model Adaptation → LoRA",
    classification: "existing_topic_update",
    summary: "Researchers published an updated low-rank adaptation method with better memory efficiency for 7B–13B models.",
    reason:
      "This changes the practical cost profile for adapting foundation models. For AI Engineers shipping adapters, the update materially affects deployment choices and fine-tuning workflows already mapped in LiveMap.",
    priority: "high",
    recommendedAction: "Explore",
    status: "new",
    discoveredAt: daysAgo(2),
    lensRelevance: {
      "AI Engineer": "Must",
      "ML Engineer": "Must",
      "AI Researcher": "Good",
      "AI/ML Leader": "Good",
    },
    sources: [
      { type: "paper", title: "Efficient LoRA Variants for Edge Deployment", url: "https://arxiv.org/" },
      { type: "blog", title: "Practitioner notes on adapter memory", url: "https://example.com/lora-update" },
      { type: "github", title: "Reference implementation", url: "https://github.com/" },
    ],
    relatedTopicSlugs: ["qlora", "supervised-fine-tuning"],
  },
  {
    id: "rd-long-context-reasoning-2026",
    title: "Long-context reasoning approach improves multi-step task reliability",
    topicId: "abductive-reasoning",
    topicSlug: "abductive-reasoning",
    syllabusPath: "Classical AI → Knowledge Representation & Reasoning → Abductive Reasoning",
    classification: "existing_topic_update",
    summary: "A new inference-time reasoning pattern shows gains on multi-hop benchmarks without retraining the base model.",
    reason:
      "Reasoning reliability is moving from research curiosity to production requirement. This update affects how practitioners should evaluate chain-of-thought and structured reasoning patterns for agent workflows.",
    priority: "high",
    recommendedAction: "Update",
    status: "new",
    discoveredAt: daysAgo(4),
    lensRelevance: {
      "AI Engineer": "Must",
      "AI Researcher": "Must",
      "ML Engineer": "Good",
      "Data Scientist": "Optional",
    },
    sources: [
      { type: "paper", title: "Structured long-context reasoning", url: "https://arxiv.org/" },
      { type: "blog", title: "Benchmark analysis", url: "https://example.com/reasoning" },
    ],
    relatedTopicSlugs: ["rule-based-reasoning", "agent-planning"],
  },
  {
    id: "rd-agent-memory-arch-2026",
    title: "Agent memory architecture gaining adoption in production agent stacks",
    topicId: null,
    topicSlug: null,
    syllabusPath: null,
    classification: "new_topic_candidate",
    summary: "Multiple teams are converging on layered memory stores for long-horizon agents beyond standard RAG pipelines.",
    reason:
      "Current LiveMap covers memory storage concepts, but not this emerging architecture pattern for persistent agent memory orchestration. It may deserve a dedicated topic under AI Agents.",
    priority: "high",
    recommendedAction: "Review",
    status: "new",
    discoveredAt: daysAgo(1),
    suggestedPlacement: "AI Agents & Agentic Systems → Memory & Context → Agent Memory Architecture",
    knowledgeLayer: "Models & Architectures",
    placementRationale:
      "Persistent agent memory is a distinct architecture pattern, not just a memory-storage technique. It belongs with agent systems and should be reviewed as Models & Architectures.",
    lensRelevance: {
      "AI Engineer": "Must",
      "AI Researcher": "Must",
      "AI/ML Leader": "Good",
      "ML Engineer": "Good",
    },
    sources: [
      { type: "blog", title: "Production agent memory patterns", url: "https://example.com/agent-memory" },
      { type: "github", title: "Open agent memory framework", url: "https://github.com/" },
      { type: "industry", title: "Vendor architecture brief", url: "https://example.com/vendor" },
    ],
    relatedTopicSlugs: ["memory-storage", "coding-agents"],
  },
  {
    id: "rd-quantization-deploy-2026",
    title: "Post-training quantization workflow simplifies 4-bit deployment",
    topicId: "post-training-quantization",
    topicSlug: "post-training-quantization",
    syllabusPath: "AI Engineering & Infrastructure → Model Optimization → Quantization",
    classification: "existing_topic_update",
    summary: "Updated tooling reduces accuracy loss when quantizing instruction-tuned models for inference.",
    reason:
      "Deployment cost and latency trade-offs are shifting. Teams optimizing inference pipelines should revisit quantization assumptions in the mapped SyncRadar topic.",
    priority: "medium",
    recommendedAction: "Explore",
    status: "reviewed",
    discoveredAt: daysAgo(6),
    lensRelevance: {
      "AI Engineer": "Good",
      "ML Engineer": "Must",
      "AI/ML Leader": "Optional",
    },
    sources: [
      { type: "documentation", title: "Quantization toolkit release notes", url: "https://example.com/docs" },
      { type: "github", title: "Quantization scripts", url: "https://github.com/" },
    ],
    relatedTopicSlugs: ["model-quantization", "quantization-aware-training"],
  },
  {
    id: "rd-sdk-minor-2026",
    title: "Minor SDK update for OpenAI-compatible client libraries",
    topicId: "fine-tuning-paradigm",
    topicSlug: "fine-tuning-paradigm",
    syllabusPath: "Foundation Models → Foundation Model Foundations → Fine-Tuning Paradigm",
    classification: "fyi",
    summary: "Patch release adds streaming helpers and deprecates one legacy endpoint wrapper.",
    reason:
      "Useful for practitioners maintaining integration code, but does not change the underlying learning objectives or syllabus structure for the mapped topic. Worth knowing — no LiveMap update needed.",
    priority: "low",
    recommendedAction: "Watch",
    status: "reviewed",
    discoveredAt: daysAgo(3),
    lensRelevance: {
      "AI Engineer": "Optional",
      "ML Engineer": "Good",
    },
    sources: [
      { type: "documentation", title: "SDK changelog", url: "https://example.com/changelog" },
    ],
    relatedTopicSlugs: [],
  },
  {
    id: "rd-rag-eval-framework-2026",
    title: "New RAG evaluation framework highlights retrieval failure modes",
    topicId: "memory-storage",
    topicSlug: "memory-storage",
    syllabusPath: "AI Agents & Agentic Systems → Memory & Context → Memory Storage",
    classification: "existing_topic_update",
    summary: "An open evaluation harness separates retrieval quality from generation quality in RAG pipelines.",
    reason:
      "Evaluation methodology for retrieval systems is maturing quickly. This affects how teams should validate memory and retrieval components tied to existing SyncRadar topics.",
    priority: "medium",
    recommendedAction: "Update",
    status: "new",
    discoveredAt: daysAgo(8),
    lensRelevance: {
      "AI Engineer": "Good",
      "Data Scientist": "Must",
      "ML Engineer": "Good",
    },
    sources: [
      { type: "paper", title: "RAG evaluation harness", url: "https://arxiv.org/" },
      { type: "github", title: "Evaluation repo", url: "https://github.com/" },
      { type: "blog", title: "Failure mode taxonomy", url: "https://example.com/rag-eval" },
    ],
    relatedTopicSlugs: ["offline-dataset-coverage"],
  },
  {
    id: "rd-multimodal-orchestration-2026",
    title: "Multimodal agent orchestration pattern emerging outside current syllabus coverage",
    topicId: null,
    topicSlug: null,
    syllabusPath: null,
    classification: "new_topic_candidate",
    summary: "Teams are combining vision, tool use, and planning loops in a single orchestration layer not yet represented as a canonical topic.",
    reason:
      "This sits at the intersection of agents, multimodal models, and workflow orchestration. It may warrant a new module once human review confirms sustained relevance.",
    priority: "medium",
    recommendedAction: "Review",
    status: "new",
    discoveredAt: daysAgo(12),
    suggestedPlacement: "Generative AI → Multimodal Systems → Agent Orchestration",
    knowledgeLayer: "Systems & Applications",
    placementRationale:
      "This is an application-layer orchestration pattern spanning multimodal models and agent workflows. Proposed Knowledge Layer is Systems & Applications pending human review.",
    lensRelevance: {
      "AI Engineer": "Good",
      "AI Researcher": "Must",
      "AI/ML Leader": "Good",
    },
    sources: [
      { type: "lab", title: "Research lab technical report", url: "https://example.com/lab" },
      { type: "blog", title: "Architecture walkthrough", url: "https://example.com/multimodal-agents" },
    ],
    relatedTopicSlugs: ["coding-agents", "agent-planning"],
  },
  {
    id: "rd-sft-best-practices-2026",
    title: "Industry guidance consolidates supervised fine-tuning best practices",
    topicId: "supervised-fine-tuning",
    topicSlug: "supervised-fine-tuning",
    syllabusPath: "Foundation Models → Model Adaptation → Supervised Fine-Tuning",
    classification: "fyi",
    summary: "Major AI lab published consolidated documentation on dataset curation and SFT hyperparameters.",
    reason:
      "Helpful reference material for practitioners already learning the mapped topic, but not a structural change to LiveMap. Keep on your radar without modifying the knowledge map.",
    priority: "low",
    recommendedAction: "Watch",
    status: "reviewed",
    discoveredAt: daysAgo(20),
    lensRelevance: {
      "AI Engineer": "Good",
      "ML Engineer": "Must",
    },
    sources: [
      { type: "documentation", title: "SFT best practices guide", url: "https://example.com/sft-guide" },
      { type: "course", title: "Workshop materials", url: "https://example.com/course" },
    ],
    relatedTopicSlugs: ["lora", "fine-tuning-paradigm"],
  },
];
