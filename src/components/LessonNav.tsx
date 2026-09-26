import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LessonNavItem {
  id: string;
  title: string;
}

interface LessonNavProps {
  lessons: LessonNavItem[];
  activeIndex: number;
  completedIds?: string[];
  onSelect: (index: number) => void;
  assessment?: {
    title: string;
    active: boolean;
    completed: boolean;
    onSelect: () => void;
  } | null;
}

export function LessonNav({ lessons, activeIndex, completedIds = [], onSelect, assessment }: LessonNavProps) {
  const completed = new Set(completedIds);
  const completedCount = lessons.filter((lesson) => completed.has(lesson.id)).length;
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lessons</h3>
        <p className="mt-1 text-xs text-slate-500">
          {completedCount} of {lessons.length} complete
        </p>
        <Progress value={percent} className="mt-2 h-1.5" />
      </div>
      <ScrollArea className="max-h-[calc(100vh-180px)]">
        <nav className="space-y-0.5" aria-label="Lesson list">
          {lessons.map((lesson, i) => {
            const isActive = i === activeIndex;
            const isComplete = completed.has(lesson.id);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
                  ) : isActive ? (
                    <Circle className="h-3.5 w-3.5 fill-primary/20 text-primary" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-border" />
                  )}
                </span>
                <span className="leading-tight">
                  {i + 1}. {lesson.title}
                </span>
              </button>
            );
          })}
          {assessment && (
            <div className="mt-4 border-t border-violet-100 pt-4">
              <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Assessment
              </p>
              <button
                type="button"
                onClick={assessment.onSelect}
                aria-current={assessment.active ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  assessment.active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {assessment.completed ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                ) : (
                  <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <span className="leading-tight">{assessment.title}</span>
              </button>
            </div>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
