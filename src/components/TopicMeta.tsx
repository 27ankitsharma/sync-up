import { useState } from "react";
import type { Topic } from "@/lib/types";

export function TopicMeta({
  topic,
  lessonCount,
  totalMinutes,
}: {
  topic: Topic;
  lessonCount?: number;
  totalMinutes?: number;
}) {
  const resolvedLessonCount = lessonCount ?? topic.lessons?.length ?? 0;
  const resolvedMinutes = totalMinutes ?? topic.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) ?? 0;

  const parts = [
    topic.difficulty ? capitalize(topic.difficulty) : null,
    resolvedMinutes > 0 ? `${resolvedMinutes} min` : null,
    `${resolvedLessonCount} ${resolvedLessonCount === 1 ? "lesson" : "lessons"}`,
    topic.priority ? `${capitalize(topic.priority)} Priority` : null,
    topic.layer || null,
  ].filter(Boolean);

  return <p className="truncate text-xs text-muted-foreground">{parts.join(" · ")}</p>;
}

export function TopicRelevantRoles({
  roles,
  variant = "chips",
}: {
  roles: string[];
  variant?: "chips" | "stack";
}) {
  const [rolesExpanded, setRolesExpanded] = useState(false);
  if (roles.length === 0) return null;

  const visibleRoles = rolesExpanded ? roles : roles.slice(0, 3);
  const hiddenRoleCount = Math.max(0, roles.length - 3);

  return (
    <div className={variant === "stack" ? "space-y-1" : "flex flex-wrap items-center gap-x-1.5 gap-y-1"}>
      <p className="text-[11px] font-medium text-slate-400">Relevant for</p>
      {variant === "stack" ? (
        <p className="text-xs leading-relaxed text-slate-700">{visibleRoles.map(formatRole).join(" · ")}</p>
      ) : (
        visibleRoles.map((role) => (
          <span key={role} className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-slate-600">
            {formatRole(role)}
          </span>
        ))
      )}
      {!rolesExpanded && hiddenRoleCount > 0 && (
        <button
          type="button"
          className="text-[11px] font-medium text-primary hover:underline"
          onClick={() => setRolesExpanded(true)}
        >
          +{hiddenRoleCount} {hiddenRoleCount === 1 ? "role" : "roles"}
        </button>
      )}
      {rolesExpanded && hiddenRoleCount > 0 && (
        <button
          type="button"
          className="text-[11px] font-medium text-primary hover:underline"
          onClick={() => setRolesExpanded(false)}
        >
          Show less
        </button>
      )}
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatRole(role: string) {
  return role.replace(/-/g, " ");
}
