import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTopic } from "@/hooks/useSyllabus";
import { usePublishedCourse } from "@/hooks/useCourse";
import { TopicPageSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LessonNav } from "@/components/LessonNav";
import { LessonCanvas } from "@/components/LessonCanvas";
import { CourseContextSidebar } from "@/components/CourseContextSidebar";
import { AppHeader } from "@/components/Layout";
import { useCompletedLessonIds, useMarkLessonCompleted, useSaveQuizResult, useTopicCompletion } from "@/hooks/useUser";
import { localTopicToLegacyTopic } from "@/utils/syllabusAdapter";
import {
  availabilityUiLabel,
  isAvailabilityActive,
  topicCourseStatus,
  topicDiagnosticStatus,
} from "@/lib/knowledgeHub";
import { ChevronDown } from "lucide-react";

export function TopicDetail({ slug }: { slug: string }) {
  const [searchParams] = useSearchParams();
  const { data: localTopic, isLoading, isError } = useTopic(slug);
  const topic = useMemo(() => (localTopic ? localTopicToLegacyTopic(localTopic) : undefined), [localTopic]);
  const shouldOpenQuiz = searchParams.get("lesson") === "quiz";
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [quizMessage, setQuizMessage] = useState<string | null>(null);
  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(false);
  const [mobileContextOpen, setMobileContextOpen] = useState(false);
  const { data: isQuizCleared = false } = useTopicCompletion(localTopic?.slug ?? "");
  const saveQuizResult = useSaveQuizResult();
  const courseStatus = topicCourseStatus(localTopic);
  const diagnosticStatus = topicDiagnosticStatus(localTopic);
  const courseActive = isAvailabilityActive(courseStatus);
  const diagnosticActive = isAvailabilityActive(diagnosticStatus);
  const { data: courseResult, isLoading: courseLoading, isError: courseError } = usePublishedCourse(
    courseActive ? localTopic?.id : null,
  );
  const publishedLessons = courseResult?.status === "ok" ? courseResult.lessons : [];
  const { data: completedLessonIds = [] } = useCompletedLessonIds(localTopic?.id);
  const markLessonCompleted = useMarkLessonCompleted();

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

  const learningLessons = courseActive ? publishedLessons : [];
  const safeActiveLessonIndex = learningLessons.length ? Math.min(activeLessonIndex, learningLessons.length - 1) : null;
  const activeLesson = safeActiveLessonIndex !== null ? learningLessons[safeActiveLessonIndex] : null;
  const totalMinutes = learningLessons.reduce((sum, lesson) => sum + (lesson.durationMinutes ?? 0), 0);

  const selectLesson = (index: number) => {
    if (!learningLessons.length) return;
    const nextIndex = Math.max(0, Math.min(index, learningLessons.length - 1));
    setActiveLessonIndex(nextIndex);
    setMobileLessonsOpen(false);
    const lesson = learningLessons[nextIndex];
    if (localTopic && lesson) {
      markLessonCompleted.mutate({ lessonId: lesson.id, topicId: localTopic.id });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const courseUnavailableState = (() => {
    if (!courseActive) {
      return {
        title: availabilityUiLabel(courseStatus),
        description: `Course status: ${availabilityUiLabel(courseStatus)}. Diagnostic status: ${availabilityUiLabel(diagnosticStatus)}.`,
      };
    }
    if (courseLoading) return null;
    if (courseError || courseResult?.status === "error") {
      return {
        title: "Content failed to load",
        description: "We couldn't load this course right now. Please try again later.",
      };
    }
    if (courseResult?.status === "none") {
      return {
        title: "Learning content not available",
        description: "This topic is marked available, but no published course is attached yet.",
      };
    }
    if (learningLessons.length === 0) {
      return {
        title: "No published lessons",
        description: "This course exists, but it has no published lessons yet.",
      };
    }
    return null;
  })();

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

  const lessonNav =
    learningLessons.length > 0 && safeActiveLessonIndex !== null ? (
      <LessonNav
        lessons={learningLessons}
        activeIndex={safeActiveLessonIndex}
        completedIds={completedLessonIds}
        onSelect={selectLesson}
      />
    ) : null;

  return (
    <div className="min-h-screen bg-[#fbfaff]">
      <AppHeader />
      <div className="mx-auto flex max-w-[1680px] flex-col lg:min-h-[calc(100vh-60px)] lg:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-violet-100 bg-white/70 lg:block">
          <div className="sticky top-[60px] max-h-[calc(100vh-60px)] overflow-y-auto p-4">{lessonNav}</div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          {learningLessons.length > 0 && (
            <div className="mb-4 space-y-2 lg:hidden">
              <Collapsible open={mobileLessonsOpen} onOpenChange={setMobileLessonsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
                  Lessons
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 rounded-xl border border-violet-100 bg-white p-3">
                  {lessonNav}
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={mobileContextOpen} onOpenChange={setMobileContextOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
                  Course info
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 rounded-xl border border-violet-100 bg-white p-3">
                  <CourseContextSidebar topic={topic} lessonCount={learningLessons.length} totalMinutes={totalMinutes} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {diagnosticActive && (
            <Card className={`mb-4 border-primary/20 ${shouldOpenQuiz ? "bg-primary/10 ring-2 ring-primary/20" : "bg-primary/5"}`}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Before You Start</p>
                  <h2 className="mt-1 text-base font-semibold text-foreground">Quick knowledge check · 3 min</h2>
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

          {courseActive && courseLoading ? (
            <EmptyState icon="⏳" title="Loading course..." description="Fetching published lessons for this topic." />
          ) : courseUnavailableState || !activeLesson || safeActiveLessonIndex === null ? (
            <EmptyState
              icon="📝"
              title={courseUnavailableState?.title ?? "Lesson unavailable"}
              description={courseUnavailableState?.description ?? "This lesson is not available."}
            />
          ) : (
            <>
              {quizMessage && (
                <p className="mb-4 text-xs text-muted-foreground">
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
              <LessonCanvas lessons={learningLessons} activeIndex={safeActiveLessonIndex} onSelect={selectLesson} />
            </>
          )}
        </main>

        <aside className="hidden w-60 shrink-0 border-l border-violet-100 bg-white/70 lg:block">
          <div className="sticky top-[60px] max-h-[calc(100vh-60px)] overflow-y-auto p-4">
            <CourseContextSidebar topic={topic} lessonCount={learningLessons.length} totalMinutes={totalMinutes} />
          </div>
        </aside>
      </div>
    </div>
  );
}
