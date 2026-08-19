import { useMemo } from "react";
import type { ReactElement } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { useKnowledgeSelection } from "@/contexts/KnowledgeSelectionContext";
import type { KnowledgeObject } from "@/contexts/KnowledgeSelectionContext";
import { useLens } from "@/contexts/LensContext";
import { useAllTopics, useRadar } from "@/hooks/useSyllabus";
import { useCompletedTopicSlugs, useSyncScoreOverview } from "@/hooks/useUser";
import { formatLearningTime, topicRelevance } from "@/lib/syllabusMetrics";
import type { TopicWithContext } from "@/types/syllabus";
import { ArrowRight, Activity, Radar as RadarIcon, Sparkles, TrendingUp } from "lucide-react";

export default function Radar() {
  const { data: radarTopics, isLoading, isError } = useRadar();
  const { data: allTopics = [] } = useAllTopics();
  const { data: completedSlugs = [] } = useCompletedTopicSlugs();
  const { selectedLens } = useLens();
  const { data: syncScore } = useSyncScoreOverview(selectedLens);
  const { setSelectedObject } = useKnowledgeSelection();
  const completedTopicSet = useMemo(() => new Set(completedSlugs), [completedSlugs]);

  const activeRadarTopics = useMemo(() => radarTopics ?? [], [radarTopics]);

  const knowledgeGaps = useMemo(
    () => activeRadarTopics.filter((topic) => !completedTopicSet.has(topic.slug)).slice(0, 5),
    [activeRadarTopics, completedTopicSet],
  );
  const emergingTopics = useMemo(() => activeRadarTopics.slice(0, 6), [activeRadarTopics]);
  const trendingLayers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const topic of activeRadarTopics) {
      counts.set(topic.layer, (counts.get(topic.layer) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [activeRadarTopics]);

  const lensScopedAllTopics = useMemo(
    () => allTopics.filter((topic) => topicRelevance(topic, selectedLens) !== "Optional"),
    [allTopics, selectedLens],
  );

  const recommendedTopic = knowledgeGaps[0] ?? emergingTopics[0] ?? lensScopedAllTopics[0];

  return (
    <div className="space-y-6">
      <section className="sr-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Radar</h1>
            <p className="text-xs text-muted-foreground">Decision support for what is changing, what matters, and what to learn next.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Compare:</span>
            <button className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-xs font-semibold">You vs {selectedLens}</button>
            <button className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-xs font-semibold">This Month</button>
          </div>
        </div>
      </section>

      {isLoading && <GridSkeleton count={6} />}

      {isError && (
        <EmptyState
          icon="⚠️"
          title="Something went wrong"
          description="We couldn't load Radar insights. Please try again later."
        />
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid gap-3 xl:grid-cols-[0.62fr_1.38fr]">
            <PriorityBrief
              selectedLens={selectedLens}
              gapTopic={knowledgeGaps[0]}
              changingTopic={emergingTopics[0]}
              nextTopic={recommendedTopic}
              onSelect={setSelectedObject}
            />
          </div>

          <div className="grid gap-3 xl:grid-cols-[0.62fr_0.72fr]">
            <SyncScoreCard score={syncScore?.syncScore ?? 87} selectedLens={selectedLens} layers={trendingLayers} />
            <KnowledgeRadarChart layers={trendingLayers} />
          </div>

          <div className="grid gap-3">
            <Card className="sr-card">
              <CardHeader>
                <CardTitle>Active Radar Topics</CardTitle>
              </CardHeader>
              <CardContent>
                {activeRadarTopics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No Radar topics found. Set `Is_Radar` to TRUE on topic rows in the Topics sheet, add dates, then run `python3 build_syllabus.py`.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeRadarTopics.map((topic) => (
                      <RadarTopicRow
                        key={topic.id}
                        topic={topic}
                        label={topicRelevance(topic, selectedLens)}
                        selectedLens={selectedLens}
                        onSelect={setSelectedObject}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3">
            <Card className="sr-card">
              <CardHeader>
                <CardTitle>Learning Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 rounded-xl bg-gradient-to-t from-violet-50 to-white p-3">
                  <svg viewBox="0 0 240 100" className="h-full w-full">
                    <polyline points="0,85 30,62 60,70 90,42 120,50 150,36 180,44 210,22 240,10" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" />
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240].map((x, i) => (
                      <circle key={x} cx={x} cy={[85, 62, 70, 42, 50, 36, 44, 22, 10][i]} r="4" fill="white" stroke="hsl(var(--primary))" strokeWidth="3" />
                    ))}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
          <PersonalizedInsights
            recommendedTopic={recommendedTopic}
            strongestLayer={trendingLayers[0]?.[0]}
            gapLayer={knowledgeGaps[0]?.layer}
            changingTopic={emergingTopics[0]?.title}
            onSelect={setSelectedObject}
          />
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: ReactElement;
}) {
  return (
    <Card className="border-white/10 bg-card/70 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">{icon}</div>
          <Badge variant="outline" className="rounded-full">{detail}</Badge>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function PriorityBrief({
  selectedLens,
  gapTopic,
  changingTopic,
  nextTopic,
  onSelect,
}: {
  selectedLens: string;
  gapTopic?: TopicWithContext;
  changingTopic?: TopicWithContext;
  nextTopic?: TopicWithContext;
  onSelect: ReturnType<typeof useKnowledgeSelection>["setSelectedObject"];
}) {
  return (
    <Card className="sr-card xl:col-span-2">
      <CardHeader>
        <CardTitle>What to do next</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <BriefItem
          eyebrow="Biggest Gap"
          title={gapTopic?.layer ?? "No urgent gap"}
          detail={gapTopic ? `${gapTopic.title} needs attention for the ${selectedLens} lens.` : "You are currently clear on high-priority Radar topics."}
          action="Inspect Gap"
          topic={gapTopic}
          onSelect={onSelect}
        />
        <BriefItem
          eyebrow="What's Changing"
          title={changingTopic?.title ?? "No new signal"}
          detail={changingTopic ? `Rising topic in ${changingTopic.layer}; review it before it becomes a gap.` : "No emerging topic signal is available yet."}
          action="Why Care"
          topic={changingTopic}
          onSelect={onSelect}
        />
        <BriefItem
          eyebrow="Next Best Topic"
          title={nextTopic?.title ?? "Explore LiveMap"}
          detail={nextTopic ? `${nextTopic.priority === "high" ? "High relevance" : "Relevant"} · ${formatLearningTime(nextTopic.learning_time)} estimated` : "Select a LiveMap branch to personalize recommendations."}
          action="Learn Topic"
          topic={nextTopic}
          onSelect={onSelect}
        />
      </CardContent>
    </Card>
  );
}

function BriefItem({
  eyebrow,
  title,
  detail,
  action,
  topic,
  onSelect,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action: string;
  topic?: TopicWithContext;
  onSelect: ReturnType<typeof useKnowledgeSelection>["setSelectedObject"];
}) {
  return (
    <button
      className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 text-left transition-colors hover:bg-violet-50"
      onClick={() => topic && onSelect(topicToKnowledgeObject(topic, eyebrow === "Biggest Gap" ? "gap" : "topic"))}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-primary">{eyebrow}</p>
      <p className="mt-2 text-sm font-bold">{title}</p>
      <p className="mt-2 min-h-10 text-xs text-muted-foreground">{detail}</p>
      <p className="mt-3 text-xs font-semibold text-primary">{action} →</p>
    </button>
  );
}

function SyncScoreCard({ score, selectedLens, layers }: { score: number; selectedLens: string; layers: [string, number][] }) {
  const layerRows = layers.slice(0, 4);
  return (
    <Card className="sr-card">
      <CardHeader>
            <CardTitle>Your Sync Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[132px_1fr] gap-4">
          <div className="grid h-32 w-32 place-items-center rounded-full bg-[conic-gradient(hsl(var(--primary))_84%,#eee7ff_0)]">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
              <span className="text-4xl font-bold text-primary">{score}</span>
              <span className="-mt-8 text-[10px] text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground">Lens: {selectedLens}</p>
            <p className="text-muted-foreground">Prioritize the biggest gap and newest high-impact topics first.</p>
            <svg viewBox="0 0 120 40" className="h-10 w-full">
              <polyline points="0,32 20,24 40,28 60,18 80,20 100,10 120,6" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" />
            </svg>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {(layerRows.length ? layerRows : [["No Radar Topics", 0] as [string, number]]).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold">{value}</span>
              <span className="text-primary">topics</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KnowledgeRadarChart({ layers }: { layers: [string, number][] }) {
  const chartLayers = layers.length ? layers : [["Generative AI", 92], ["LLM Engineering", 88], ["ML Systems", 82], ["Data Engineering", 68], ["MLOps", 81], ["AI Applications", 74]];

  return (
    <Card className="sr-card">
      <CardHeader>
        <CardTitle>Knowledge Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto h-[248px] max-w-[390px]">
          <svg viewBox="0 0 420 300" className="h-full w-full">
            {[40, 70, 100, 130].map((radius) => (
              <polygon
                key={radius}
                points={radarPoints(radius)}
                fill="none"
                stroke="#eadfff"
                strokeWidth="1"
              />
            ))}
            <polygon points={radarPoints(96)} fill="rgba(124,58,237,0.12)" stroke="hsl(var(--primary))" strokeWidth="3" />
            {radarPointArray(96).map(([x, y], index) => <circle key={index} cx={x} cy={y} r="5" fill="hsl(var(--primary))" />)}
          </svg>
          {chartLayers.slice(0, 6).map(([label, value], index) => (
            <div key={label} className={`absolute text-xs font-semibold ${radarLabelClass(index)}`}>
              <span className="block">{label}</span>
              <span className="text-muted-foreground">{typeof value === "number" ? value : 82}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PersonalizedInsights({
  recommendedTopic,
  strongestLayer,
  gapLayer,
  changingTopic,
  onSelect,
}: {
  recommendedTopic?: TopicWithContext;
  strongestLayer?: string;
  gapLayer?: string;
  changingTopic?: string;
  onSelect: (object: KnowledgeObject | null) => void;
}) {
  return (
    <Card className="sr-card">
      <CardHeader>
        <CardTitle>Personalized Insights</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        <Insight title="Most Active Area" value={strongestLayer ?? "No Radar Data"} score="From syllabus" tone="green" />
        <Insight title="Biggest Gap" value={gapLayer ?? "No active gap"} score="From incomplete radar topics" tone="orange" />
        <Insight title="What's Changing" value={changingTopic ?? "No emerging topic"} score="From Radar fields" tone="purple" />
        <button
          className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4 text-left"
          onClick={() =>
            recommendedTopic &&
            onSelect(topicToKnowledgeObject(recommendedTopic))
          }
        >
          <p className="text-[10px] font-semibold uppercase text-primary">Next Best Topic</p>
          <p className="mt-2 text-sm font-bold">{recommendedTopic?.title ?? "Attention Mechanism"}</p>
          <p className="mt-3 text-xs font-medium text-primary">Learn Topic →</p>
        </button>
      </CardContent>
    </Card>
  );
}

function Insight({ title, value, score, tone }: { title: string; value: string; score: string; tone: "green" | "orange" | "purple" }) {
  const toneClass = {
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-violet-50 text-primary",
  }[tone];
  return (
    <div className={`rounded-2xl border border-violet-100 p-4 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase">{title}</p>
      <p className="mt-2 text-sm font-bold">{value}</p>
      <p className="mt-3 text-xs font-medium">{score}</p>
    </div>
  );
}

function topicToKnowledgeObject(topic: TopicWithContext, type: "topic" | "gap" = "topic"): KnowledgeObject {
  return {
    type,
    id: topic.id,
    title: topic.title,
    subtitle: `${topic.track.title} / ${topic.layer}`,
    topic,
    meta: {
      coursePath: `/topics/${topic.slug}`,
      importance: topic.priority,
      learningTime: formatLearningTime(topic.learning_time),
    },
  };
}

function radarPoints(radius: number) {
  return radarPointArray(radius).map(([x, y]) => `${x},${y}`).join(" ");
}

function radarPointArray(radius: number) {
  const centerX = 210;
  const centerY = 150;
  return Array.from({ length: 6 }, (_, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / 6);
    return [centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius] as const;
  });
}

function radarLabelClass(index: number) {
  return [
    "left-1/2 top-0 -translate-x-1/2 text-center",
    "right-3 top-20 text-right",
    "right-10 bottom-16 text-right",
    "left-1/2 bottom-0 -translate-x-1/2 text-center",
    "left-8 bottom-16",
    "left-3 top-20",
  ][index] ?? "";
}

function RadarTopicRow({
  topic,
  label,
  selectedLens,
  onSelect,
  variant = "topic",
}: {
  topic: TopicWithContext;
  label: string;
  selectedLens: string;
  onSelect: ReturnType<typeof useKnowledgeSelection>["setSelectedObject"];
  variant?: "gap" | "topic";
}) {
  return (
    <button
      className="flex w-full items-center justify-between gap-3 rounded-xl border bg-background/60 p-3 text-left hover:bg-muted/40"
      onClick={() =>
        onSelect(topicToKnowledgeObject(topic, variant === "gap" ? "gap" : "topic"))
      }
    >
      <span className={`h-2.5 w-2.5 rounded-full ${topic.priority === "high" ? "bg-emerald-500" : "bg-yellow-500"}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{topic.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {topic.track.title} › {topic.subject.title} › {topic.module.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {topic.summary || `Why care: relevant to ${topic.layer} for your ${selectedLens} lens.`}
        </p>
      </div>
      <Badge variant="secondary" className="rounded-full">{label}</Badge>
    </button>
  );
}
