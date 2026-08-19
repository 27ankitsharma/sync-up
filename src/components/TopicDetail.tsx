import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTopic } from "@/hooks/useSyllabus";
import { TopicPageSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { TopicMeta } from "@/components/TopicMeta";
import { Button } from "@/components/ui/button";
import { LessonNav } from "@/components/LessonNav";
import { AppHeader } from "@/components/Layout";
import { useKnowledgeSelection } from "@/contexts/KnowledgeSelectionContext";
import { useSaveQuizResult, useTopicCompletion } from "@/hooks/useUser";
import { localTopicToLegacyTopic } from "@/utils/syllabusAdapter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TopicDetail({ slug }: { slug: string }) {
  const [searchParams] = useSearchParams();
  const { setSelectedObject } = useKnowledgeSelection();
  const { data: localTopic, isLoading, isError } = useTopic(slug);
  const topic = useMemo(() => (localTopic ? localTopicToLegacyTopic(localTopic) : undefined), [localTopic]);
  const shouldOpenQuiz = searchParams.get("lesson") === "quiz";
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [quizMessage, setQuizMessage] = useState<string | null>(null);
  const { data: isQuizCleared = false } = useTopicCompletion(localTopic?.slug ?? "");
  const saveQuizResult = useSaveQuizResult();

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
  const diagnosticLesson = lessons.find((lesson) => /quiz|diagnostic|readiness/i.test(lesson.title)) ?? null;
  const learningLessons = diagnosticLesson ? lessons.filter((lesson) => lesson._id !== diagnosticLesson._id) : lessons;
  const safeActiveLessonIndex = learningLessons.length ? Math.min(activeLessonIndex, learningLessons.length - 1) : null;
  const activeLesson = safeActiveLessonIndex !== null ? learningLessons[safeActiveLessonIndex] : null;
  const hasPrev = safeActiveLessonIndex !== null && safeActiveLessonIndex > 0;
  const hasNext = safeActiveLessonIndex !== null && safeActiveLessonIndex < learningLessons.length - 1;

  const clearQuiz = async () => {
    if (!localTopic) return;

    try {
      setQuizMessage(null);
      await saveQuizResult.mutateAsync({
        topicId: localTopic.id,
        topicSlug: localTopic.slug,
        layer: localTopic.layer,
        score: 100,
        passed: true,
      });
      setQuizMessage("Quiz cleared and progress saved.");
    } catch (error) {
      setQuizMessage(error instanceof Error ? error.message : "Unable to save quiz progress.");
    }
  };

  return (
    <motion.div
      key={slug}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#fbfaff]"
    >
      <AppHeader />
      <section className="border-b border-violet-100 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div className="min-w-0">
            <Link to="/livemap" className="text-xs font-medium text-primary">
              ← Back to Knowledge Hub
            </Link>
            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground">{topic.title}</h1>
            <div className="mt-2">
              <TopicMeta topic={topic} />
            </div>
            {localTopic && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-slate-500">Knowledge path:</span>
                <Link
                  to="/livemap"
                  className="font-medium hover:text-primary"
                  onClick={() =>
                    setSelectedObject({
                      type: "track",
                      id: localTopic.track.slug,
                      title: localTopic.track.title,
                      subtitle: "Track",
                      meta: {
                        coursePath: `/topics/${localTopic.slug}`,
                        focusFromBreadcrumb: true,
                        trackSlug: localTopic.track.slug,
                      },
                    })
                  }
                >
                  {localTopic.track.title}
                </Link>
                <span>→</span>
                <Link
                  to="/livemap"
                  className="font-medium hover:text-primary"
                  onClick={() =>
                    setSelectedObject({
                      type: "subject",
                      id: localTopic.subject.slug,
                      title: localTopic.subject.title,
                      subtitle: localTopic.track.title,
                      meta: {
                        coursePath: `/topics/${localTopic.slug}`,
                        focusFromBreadcrumb: true,
                        trackSlug: localTopic.track.slug,
                        subjectSlug: localTopic.subject.slug,
                      },
                    })
                  }
                >
                  {localTopic.subject.title}
                </Link>
                <span>→</span>
                <Link
                  to="/livemap"
                  className="font-medium hover:text-primary"
                  onClick={() =>
                    setSelectedObject({
                      type: "module",
                      id: localTopic.module.slug,
                      title: localTopic.module.title,
                      subtitle: `${localTopic.track.title} / ${localTopic.subject.title}`,
                      meta: {
                        coursePath: `/topics/${localTopic.slug}`,
                        focusFromBreadcrumb: true,
                        trackSlug: localTopic.track.slug,
                        subjectSlug: localTopic.subject.slug,
                        moduleSlug: localTopic.module.slug,
                      },
                    })
                  }
                >
                  {localTopic.module.title}
                </Link>
                <span>→</span>
                <Link
                  to="/livemap"
                  className="font-semibold text-foreground hover:text-primary"
                  onClick={() =>
                    setSelectedObject({
                      type: "topic",
                      id: localTopic.id,
                      title: localTopic.title,
                      subtitle: `${localTopic.track.title} / ${localTopic.subject.title} / ${localTopic.module.title}`,
                      topic: localTopic,
                      meta: {
                        coursePath: `/topics/${localTopic.slug}`,
                        focusFromBreadcrumb: true,
                        trackSlug: localTopic.track.slug,
                        subjectSlug: localTopic.subject.slug,
                        moduleSlug: localTopic.module.slug,
                        topicSlug: localTopic.slug,
                        learningTime: "45 min",
                        importance: localTopic.priority,
                      },
                    })
                  }
                >
                  {localTopic.title}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto flex max-w-[1440px] gap-5 p-5">
        {learningLessons.length > 0 && safeActiveLessonIndex !== null && (
          <LessonNav lessons={learningLessons} activeIndex={safeActiveLessonIndex} onSelect={setActiveLessonIndex} />
        )}

        <section className="min-w-0 flex-1">
          {learningLessons.length === 0 || !activeLesson || safeActiveLessonIndex === null ? (
            <EmptyState
              icon="📝"
              title="Lessons coming soon"
              description="This topic's lessons are being prepared. Check back later!"
            />
          ) : (
            <>
              <div className="mb-4 rounded-2xl border border-violet-100 bg-white p-3 lg:hidden">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Lesson {safeActiveLessonIndex + 1} of {learningLessons.length}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!hasPrev} onClick={() => setActiveLessonIndex((i) => i - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!hasNext} onClick={() => setActiveLessonIndex((i) => i + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {diagnosticLesson && (
                <Card className={`mb-4 border-primary/20 ${shouldOpenQuiz ? "bg-primary/10 ring-2 ring-primary/20" : "bg-primary/5"}`}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Before You Start</p>
                      <h2 className="mt-1 text-base font-semibold text-foreground">Quick knowledge check · {diagnosticLesson.duration ?? 3} min</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        This diagnostic helps SyncRadar understand what you already know before recommending depth and next steps.
                      </p>
                    </div>
                    <Button size="sm" onClick={clearQuiz} disabled={isQuizCleared || saveQuizResult.isPending}>
                      {isQuizCleared ? "Diagnostic complete" : saveQuizResult.isPending ? "Saving..." : "Take Diagnostic"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLesson._id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="min-h-[calc(100vh-180px)] border-violet-100 bg-white shadow-[0_10px_35px_-25px_rgba(87,63,191,0.45)]">
                    <CardContent className="p-8">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Lesson {safeActiveLessonIndex + 1} of {learningLessons.length}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-foreground">{activeLesson.title}</h2>

                      {quizMessage && (
                        <p className="mt-4 text-xs text-muted-foreground">
                          {quizMessage}
                          {quizMessage.includes("signed in") && (
                            <>
                              {" "}
                              <Link className="text-primary underline" to={`/login?redirect=/topic/${localTopic?.slug ?? slug}`}>
                                Sign in here.
                              </Link>
                            </>
                          )}
                        </p>
                      )}

                      <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
                        {activeLesson.content?.map((block: any, j: number) => {
                          if (block._type === "block") {
                            return <p key={j}>{block.children?.map((child: any) => child.text).join("")}</p>;
                          }
                          if (block._type === "code") {
                            return (
                              <pre key={j} className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-xs">
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

              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setActiveLessonIndex((i) => i - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {safeActiveLessonIndex + 1} / {learningLessons.length}
                </span>
                <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setActiveLessonIndex((i) => i + 1)}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </section>
      </main>
    </motion.div>
  );
}
