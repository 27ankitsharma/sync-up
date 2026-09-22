import { TopicRelevantRoles } from "@/components/TopicMeta";
import type { Topic } from "@/lib/types";

export function CourseContextSidebar({
  topic,
  lessonCount,
  totalMinutes,
}: {
  topic: Topic;
  lessonCount: number;
  totalMinutes: number;
}) {
  const summary = [
    topic.difficulty ? capitalize(topic.difficulty) : null,
    totalMinutes > 0 ? `${totalMinutes} min` : null,
    `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="text-[15px] font-semibold leading-snug text-foreground">{topic.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{summary}</p>
      </div>
      {topic.priority && (
        <MetaBlock label="Priority" value={capitalize(topic.priority)} />
      )}
      {topic.layer && <MetaBlock label="Knowledge Layer" value={topic.layer} />}
      <div>
        <TopicRelevantRoles roles={topic.roles} variant="stack" />
      </div>
    </div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs text-slate-700">{value}</p>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
