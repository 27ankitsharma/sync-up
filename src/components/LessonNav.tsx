import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Lesson } from "@/lib/types";

interface LessonNavProps {
  lessons: Lesson[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function LessonNav({ lessons, activeIndex, onSelect }: LessonNavProps) {
  return (
    <div className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-20">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Lessons
        </h3>
        <ScrollArea className="max-h-[60vh]">
          <nav className="space-y-0.5">
            {lessons.map((lesson, i) => {
              const isActive = i === activeIndex;
              const isPast = i < activeIndex;
              return (
                <button
                  key={lesson._id}
                  onClick={() => onSelect(i)}
                  className={cn(
                    "w-full flex items-start gap-2.5 px-2.5 py-2 rounded-md text-left text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
                    ) : isActive ? (
                      <Circle className="h-3.5 w-3.5 text-primary fill-primary/20" />
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
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
