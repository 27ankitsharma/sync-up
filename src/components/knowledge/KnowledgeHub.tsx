import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useKnowledgeSelection } from "@/contexts/KnowledgeSelectionContext";
import { useLens } from "@/contexts/LensContext";
import { useAllTopics, useSyllabus } from "@/hooks/useSyllabus";
import { useCompletedTopicSlugs } from "@/hooks/useUser";
import {
  formatLearningTime,
  formatSelectedDifficulty,
  nodeDifficultyForSelection,
  relevanceBadgeClass,
  relevanceLabel,
  siblingTopics,
  topicRelevance,
  topicsForSelectedNode,
} from "@/lib/syllabusMetrics";
import { Bookmark, Calendar, Clock, MoreHorizontal, Network, Target, TrendingUp } from "lucide-react";

const tabs = ["Overview", "Learn", "Resources", "Apply", "Updates", "Related"];

export function KnowledgeHub() {
  const { selectedObject } = useKnowledgeSelection();
  const { data: completedTopicSlugs = [] } = useCompletedTopicSlugs();
  const { selectedLens } = useLens();
  const { data: syllabus } = useSyllabus();
  const { data: allTopics = [] } = useAllTopics();
  const topic = selectedObject?.topic;
  const title = selectedObject?.title ?? "Transformer";
  const subtitle = selectedObject?.subtitle ?? "Core building block behind modern LLMs and many state-of-the-art AI systems.";
  const coursePath = selectedObject?.meta?.coursePath?.toString() ?? (topic ? `/topics/${topic.slug}` : null);
  const quizPath = coursePath ? `${coursePath}?lesson=quiz` : null;
  const objectType = selectedObject?.type ?? "topic";
  const primaryAction = objectType === "topic" || objectType === "gap" ? "Learn Topic" : "Start Learning";
  const relevance = topic ? topicRelevance(topic, selectedLens) : null;
  const importance = relevance ? relevanceLabel(relevance) : selectedObject?.meta?.importance?.toString() ?? "Optional";
  const learningTime = topic ? formatLearningTime(topic.learning_time) : selectedObject?.meta?.learningTime?.toString() ?? "Not set";
  const breadcrumb = topic
    ? [topic.track.title, topic.subject.title, topic.module.title]
    : selectedObject?.subtitle?.split(" / ").filter(Boolean) ?? ["Knowledge Map"];
  const isCompleted = Boolean(topic && completedTopicSlugs.includes(topic.slug));
  const progressPercent = isCompleted ? 100 : topic ? 0 : 0;
  const related = topic
    ? siblingTopics(topic, allTopics)
        .filter((item) => topicRelevance(item, selectedLens) !== "Optional")
        .map((item) => item.title)
    : [];
  const learningPaths = topic
    ? Object.entries(topic.lens_relevance ?? {})
        .filter(([, category]) => category !== "Optional")
        .map(([lens]) => lens)
    : [];
  const resources = topic?.resources ?? [];
  const childTopics =
    topic || !selectedObject || !syllabus
      ? []
      : topicsForSelectedNode(syllabus, selectedObject.type, selectedObject.id);
  const difficulty = formatSelectedDifficulty({
    topic,
    nodeDifficulty:
      topic || !selectedObject || !syllabus
        ? null
        : nodeDifficultyForSelection(syllabus, selectedObject.type, selectedObject.id),
    childTopics,
  });

  return (
    <aside className="hidden xl:flex w-[400px] shrink-0 flex-col rounded-xl border border-violet-100 bg-white p-4 shadow-[0_10px_35px_-25px_rgba(87,63,191,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">Knowledge Hub</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`}>
                {index > 0 && <span className="mx-1">›</span>}
                {item}
              </span>
            ))}
          </p>
        </div>
        <div className="flex gap-2 text-slate-500">
          <Bookmark className="h-4 w-4" />
          <MoreHorizontal className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-300/60">
          <Network className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-bold">{title}</h2>
            <Badge className={`rounded-full text-[10px] ${relevance ? relevanceBadgeClass(relevance) : "bg-slate-100 text-slate-600 hover:bg-slate-100"}`}>{importance}</Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{topic?.summary || subtitle}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{topic?.content_status ?? selectedObject?.meta?.status?.toString() ?? "Published"}</span>
            <span>·</span>
            <span>{topic?.is_radar ? "Radar active" : "Canonical syllabus"}</span>
          </div>
          {coursePath && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" className="h-8 rounded-xl px-3 text-xs">
                <Link to={coursePath} target="_blank" rel="noreferrer">{primaryAction}</Link>
              </Button>
              {quizPath && (
                <Button asChild variant="outline" size="sm" className="h-8 rounded-xl px-3 text-xs">
                  <Link to={quizPath} target="_blank" rel="noreferrer">Take Diagnostic</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 border-b border-violet-100 text-[11px] font-semibold">
        {tabs.map((tab, index) => (
          <span key={tab} className={`pb-2 ${index === 0 ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            {tab}
          </span>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-700">
        {topic?.summary ?? `${title} is part of the canonical knowledge map. Use the selected lens to decide why it matters, how deep to go, and what to learn next.`}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoCard icon={<Target className="h-4 w-4" />} label="Importance" value={importance} tone="green" />
        <InfoCard icon={<Clock className="h-4 w-4" />} label="Learning Time" value={learningTime} tone="purple" />
        <InfoCard icon={<TrendingUp className="h-4 w-4" />} label="Difficulty" value={difficulty} tone="orange" />
        <InfoCard icon={<Calendar className="h-4 w-4" />} label="Lens" value={selectedLens} tone="teal" />
      </div>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold">Your Progress</h3>
          <Link to="/profile" className="text-[11px] font-medium text-primary">View Details →</Link>
        </div>
        <div className="grid grid-cols-[104px_1fr] gap-4">
          <div
            className="grid h-24 w-24 place-items-center rounded-full"
            style={{ background: `conic-gradient(hsl(var(--primary)) ${progressPercent}%, #eee7ff 0)` }}
          >
            <div className="grid h-[70px] w-[70px] place-items-center rounded-full bg-white text-center">
              <span className="text-xl font-bold">{progressPercent}%</span>
              <span className="-mt-5 text-[10px] text-muted-foreground">Completed</span>
            </div>
          </div>
          <div className="space-y-2 text-[11px]">
            <ProgressLine label="Diagnostic" done={isCompleted} value={topic ? "Pending" : "Open"} />
            <ProgressLine label="Concepts" done={isCompleted} value={topic ? "Not started" : "Mapped"} />
            <ProgressLine label="Practice" done={isCompleted} value={topic ? "Not started" : "Open"} />
            <ProgressLine label="Progress" done={isCompleted} value={isCompleted ? "Complete" : "Start"} />
          </div>
        </div>
      </section>

      <div className="mt-5 rounded-xl bg-violet-50 p-3">
        <p className="text-[10px] text-muted-foreground">Next Best Action</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{topic ? `Continue with ${title}` : `Explore ${title}`}</p>
            <p className="text-[11px] text-muted-foreground">
              {topic ? "Take the diagnostic or continue the learning experience" : "Review this branch and open the first recommended topic"}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-5">
        <h3 className="text-sm font-bold">Resources</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {resources.slice(0, 4).map((item) => (
            <a key={`${item.type}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-medium text-primary">
              {item.title}
            </a>
          ))}
          {resources.length === 0 && <span className="text-[11px] text-muted-foreground">No resources in syllabus yet.</span>}
        </div>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-bold">Related Concepts</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {related.map((item) => (
            <span key={item} className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-medium text-primary">{item}</span>
          ))}
          {related.length === 0 && <span className="text-[11px] text-muted-foreground">Select a topic to see module siblings.</span>}
        </div>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-bold">Appears in Learning Paths</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {learningPaths.map((item) => (
            <span key={item} className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-medium text-primary">{item}</span>
          ))}
          {learningPaths.length === 0 && <span className="text-[11px] text-muted-foreground">No lens relevance in syllabus yet.</span>}
        </div>
      </section>
    </aside>
  );
}

function InfoCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: "green" | "purple" | "orange" | "teal" }) {
  const toneClass = {
    green: "text-emerald-600 bg-emerald-50",
    purple: "text-primary bg-violet-50",
    orange: "text-orange-500 bg-orange-50",
    teal: "text-teal-600 bg-teal-50",
  }[tone];

  return (
    <div className="rounded-xl border border-violet-100 bg-white p-3">
      <div className={`mb-2 grid h-7 w-7 place-items-center rounded-lg ${toneClass}`}>{icon}</div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold capitalize">{value}</p>
    </div>
  );
}

function ProgressLine({ label, done, value }: { label: string; done?: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className={done ? "text-emerald-500" : "text-primary"}>{done ? "●" : value ?? "○"}</span>
    </div>
  );
}
