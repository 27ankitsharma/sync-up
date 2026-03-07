import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Target } from "lucide-react";
import type { Topic } from "@/lib/types";

const ROLE_COLORS: Record<string, string> = {
  developer: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  designer: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  "product-manager": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "data-scientist": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  marketer: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
  intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800",
  advanced: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-muted-foreground",
};

export function TopicMeta({ topic }: { topic: Topic }) {
  const lessons = topic.lessons || [];
  const totalMinutes = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
  const lessonCount = lessons.length;

  return (
    <div className="space-y-3">
      {/* Row 1: Structural metadata */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          className={`${DIFFICULTY_COLORS[topic.difficulty] || ""} border font-semibold capitalize`}
        >
          {topic.difficulty}
        </Badge>

        {totalMinutes > 0 && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {totalMinutes} min
          </span>
        )}

        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
        </span>

        {topic.priority && (
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium capitalize ${PRIORITY_COLORS[topic.priority] || ""}`}>
            <Target className="h-3.5 w-3.5" />
            {topic.priority} priority
          </span>
        )}

        <Badge variant="secondary" className="capitalize">{topic.layer}</Badge>
      </div>

      {/* Row 2: Role relevance */}
      {topic.roles && topic.roles.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Relevant for:</span>
          {topic.roles.map((role) => (
            <Badge
              key={role}
              className={`${ROLE_COLORS[role] || "bg-secondary text-secondary-foreground"} border-0 text-xs capitalize`}
            >
              {role.replace("-", " ")}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
