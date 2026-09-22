import { LessonContent } from "@/components/LessonContent";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/types/courseContent";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function LessonCanvas({
  lessons,
  activeIndex,
  onSelect,
}: {
  lessons: Lesson[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const lesson = lessons[activeIndex];
  if (!lesson) return null;

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < lessons.length - 1;

  return (
    <article className="mx-auto w-full max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Lesson {activeIndex + 1} of {lessons.length}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{lesson.title}</h1>
      <div className="mt-6">
        <LessonContent content={lesson.content} />
      </div>
      <div className="mt-10 flex items-center justify-between gap-3 border-t border-violet-100 pt-5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={!hasPrev}
          onClick={() => onSelect(activeIndex - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Lesson
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={!hasNext}
          onClick={() => onSelect(activeIndex + 1)}
        >
          Next Lesson
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
