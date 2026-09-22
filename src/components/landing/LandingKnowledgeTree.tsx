const branches = [
  {
    track: "Mathematics for AI",
    children: ["Linear Algebra", "Probability", "Optimization"],
  },
  {
    track: "Foundation Models",
    children: ["Adaptation", "LoRA", "Fine-Tuning"],
  },
  {
    track: "AI Agents & Agentic Systems",
    children: ["Foundations", "Tool Use", "MHS"],
    highlight: true,
  },
  {
    track: "AI Engineering",
    children: ["Evaluation", "Deployment", "Safety"],
  },
];

export function LandingKnowledgeTree() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {branches.map((branch) => (
        <div
          key={branch.track}
          className={`rounded-2xl border bg-white/80 p-5 shadow-[0_18px_50px_-36px_rgba(87,63,191,0.45)] backdrop-blur ${
            branch.highlight ? "border-primary/30 ring-1 ring-primary/10" : "border-violet-100"
          }`}
        >
          <p className="text-sm font-semibold text-slate-900">{branch.track}</p>
          <ul className="mt-4 space-y-2.5">
            {branch.children.map((child) => (
              <li key={child} className="flex items-center gap-2 text-sm text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${child === "MHS" ? "bg-primary" : "bg-violet-300"}`} />
                {child}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
