import { useState } from "react";
import { useTopic } from "@/hooks/useSanity";
import { TopicPageSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TopicMeta } from "@/components/TopicMeta";
import { Button } from "@/components/ui/button";
import { LessonNav } from "@/components/LessonNav";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TopicDetail({ slug }: { slug: string }) {
  const { data: topic, isLoading, isError } = useTopic(slug);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);

  if (isLoading) return <TopicPageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Something went wrong"
        description="We couldn't load this topic. Please try again later."
      />
    );
  }

  if (!topic) {
    return (
      <EmptyState
        icon="🔍"
        title="Topic not found"
        description="This topic doesn't exist or hasn't been published yet."
      />
    );
  }

  const lessons = topic.lessons || [];
  const activeLesson = activeLessonIndex !== null ? lessons[activeLessonIndex] : null;
  const hasPrev = activeLessonIndex !== null && activeLessonIndex > 0;
  const hasNext = activeLessonIndex !== null && activeLessonIndex < lessons.length - 1;

  return (
    <motion.div
      key={slug}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Breadcrumb path */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{topic.module?.subject?.track?.title ?? ""}</span>
        <span>→</span>
        <span>{topic.module?.subject?.title ?? ""}</span>
        <span>→</span>
        <span>{topic.module?.title ?? ""}</span>
        <span>→</span>
        <span className="text-foreground font-medium">{topic.title}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{topic.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">{topic.difficulty}</Badge>
          <Badge variant="secondary">{topic.layer}</Badge>
          {topic.roles?.map((r) => (
            <Badge key={r} variant="outline" className="text-xs">
              {r}
            </Badge>
          ))}
        </div>
      </div>

      {/* Why This Matters */}
      {topic.whyItMatters && topic.whyItMatters.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              💡 Why This Matters
            </h2>
            <div className="text-sm text-foreground leading-relaxed">
              {topic.whyItMatters.map((block: any, i: number) => (
                <p key={i}>
                  {block.children?.map((child: any) => child.text).join("") || ""}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Lessons</h2>
          {activeLesson && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveLessonIndex(null)}
              className="text-xs text-muted-foreground"
            >
              ← Back to all lessons
            </Button>
          )}
        </div>

        {lessons.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Lessons coming soon"
            description="This topic's lessons are being prepared. Check back later!"
          />
        ) : activeLesson === null ? (
          /* Lesson list */
          <div className="space-y-2">
            {lessons.map((lesson, i) => (
              <motion.button
                key={lesson._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActiveLessonIndex(i)}
                className="w-full text-left group"
              >
                <Card className="transition-colors hover:border-primary/40 hover:bg-primary/5">
                  <CardContent className="py-3.5 px-4 flex items-center gap-3">
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {lesson.title}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </motion.button>
            ))}
          </div>
        ) : (
          /* Active lesson content */
          <div className="flex gap-6">
            <LessonNav
              lessons={lessons}
              activeIndex={activeLessonIndex!}
              onSelect={setActiveLessonIndex}
            />

            <div className="flex-1 min-w-0">
              {/* Mobile lesson selector */}
              <div className="lg:hidden mb-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Lesson {activeLessonIndex! + 1} of {lessons.length}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!hasPrev} onClick={() => setActiveLessonIndex((i) => i! - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!hasNext} onClick={() => setActiveLessonIndex((i) => i! + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLesson._id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardContent className="py-5">
                      <h3 className="font-semibold text-foreground mb-3 text-lg">
                        {activeLessonIndex! + 1}. {activeLesson.title}
                      </h3>
                      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                        {activeLesson.content?.map((block: any, j: number) => {
                          if (block._type === "block") {
                            return <p key={j}>{block.children?.map((child: any) => child.text).join("")}</p>;
                          }
                          if (block._type === "code") {
                            return (
                              <pre key={j} className="bg-muted p-4 rounded-md text-xs overflow-x-auto border font-mono">
                                <code>{block.code}</code>
                              </pre>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next buttons */}
              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setActiveLessonIndex((i) => i! - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {activeLessonIndex! + 1} / {lessons.length}
                </span>
                <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setActiveLessonIndex((i) => i! + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
