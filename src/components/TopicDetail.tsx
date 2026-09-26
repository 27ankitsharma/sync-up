import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTopic } from "@/hooks/useSyllabus";
import { usePublishedCourse } from "@/hooks/useCourse";
import { TopicPageSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LessonNav } from "@/components/LessonNav";
import { LessonCanvas } from "@/components/LessonCanvas";
import { CourseContextSidebar } from "@/components/CourseContextSidebar";
import { CourseAssessment } from "@/components/CourseAssessment";
import { AppHeader } from "@/components/Layout";
import { useCompletedLessonIds, useMarkLessonCompleted, useTopicCompletion } from "@/hooks/useUser";
import { usePublishedQuiz } from "@/hooks/useQuiz";
import { localTopicToLegacyTopic } from "@/utils/syllabusAdapter";
import {
  availabilityUiLabel,
  isAvailabilityActive,
  topicCourseStatus,
  topicDiagnosticStatus,
} from "@/lib/knowledgeHub";
import { ChevronDown } from "lucide-react";

export function TopicDetail({ slug }: { slug: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: localTopic, isLoading, isError } = useTopic(slug);
  const topic = useMemo(() => (localTopic ? localTopicToLegacyTopic(localTopic) : undefined), [localTopic]);
  const shouldOpenQuiz = searchParams.get("lesson") === "quiz";
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(false);
  const [mobileContextOpen, setMobileContextOpen] = useState(false);
  const { data: isQuizCleared = false } = useTopicCompletion(localTopic?.slug ?? "");
  const courseStatus = topicCourseStatus(localTopic);
  const diagnosticStatus = topicDiagnosticStatus(localTopic);
  const courseActive = isAvailabilityActive(courseStatus);
  const diagnosticActive = isAvailabilityActive(diagnosticStatus);
  const { data: courseResult, isLoading: courseLoading, isError: courseError } = usePublishedCourse(
    courseActive ? localTopic?.id : null,
  );
  const publishedLessons = useMemo(
    () => (courseResult?.status === "ok" ? courseResult.lessons : []),
    [courseResult],
  );
  const courseId = courseResult?.status === "ok" ? courseResult.course.id : null;
  const { data: publishedQuiz } = usePublishedQuiz(courseId);
  const { data: completedLessonIds = [] } = useCompletedLessonIds(localTopic?.id);
  const markLessonCompleted = useMarkLessonCompleted();
  const learningLessons = useMemo(
    () => (courseActive ? publishedLessons : []),
    [courseActive, publishedLessons],
  );
  const safeActiveLessonIndex = learningLessons.length ? Math.min(activeLessonIndex, learningLessons.length - 1) : null;
  const activeLesson = safeActiveLessonIndex !== null ? learningLessons[safeActiveLessonIndex] : null;
  const totalMinutes = learningLessons.reduce((sum, lesson) => sum + (lesson.durationMinutes ?? 0), 0);
  const attemptId = searchParams.get("attempt");

  useEffect(() => {
    const requestedLesson = searchParams.get("lesson");
    if (!requestedLesson || requestedLesson === "quiz") return;
    const requestedIndex = learningLessons.findIndex((lesson) => lesson.id === requestedLesson);
    if (requestedIndex >= 0) setActiveLessonIndex(requestedIndex);
  }, [learningLessons, searchParams]);

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

  const selectLesson = (index: number) => {
    if (!learningLessons.length) return;
    const nextIndex = Math.max(0, Math.min(index, learningLessons.length - 1));
    setActiveLessonIndex(nextIndex);
    setMobileLessonsOpen(false);
    const lesson = learningLessons[nextIndex];
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("lesson", lesson.id);
    nextParams.delete("attempt");
    setSearchParams(nextParams, { replace: true });
    if (localTopic && lesson) {
      markLessonCompleted.mutate({ lessonId: lesson.id, topicId: localTopic.id });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectAssessment = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("lesson", "quiz");
    setSearchParams(nextParams, { replace: true });
    setMobileLessonsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setAttemptId = (nextAttemptId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("lesson", "quiz");
    nextParams.set("attempt", nextAttemptId);
    setSearchParams(nextParams, { replace: true });
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

  const lessonNav =
    learningLessons.length > 0 && safeActiveLessonIndex !== null ? (
      <LessonNav
        lessons={learningLessons}
        activeIndex={shouldOpenQuiz ? -1 : safeActiveLessonIndex}
        completedIds={completedLessonIds}
        onSelect={selectLesson}
        assessment={
          publishedQuiz || diagnosticActive
            ? {
                title: publishedQuiz?.title ?? "Course Quiz",
                active: shouldOpenQuiz,
                completed: isQuizCleared,
                onSelect: selectAssessment,
              }
            : null
        }
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
          {(learningLessons.length > 0 || publishedQuiz) && (
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

          {shouldOpenQuiz && courseId ? (
            <CourseAssessment
              courseId={courseId}
              topicSlug={localTopic?.slug ?? slug}
              attemptId={attemptId}
              onAttemptChange={setAttemptId}
            />
          ) : courseActive && courseLoading ? (
            <EmptyState icon="⏳" title="Loading course..." description="Fetching published lessons for this topic." />
          ) : courseUnavailableState || !activeLesson || safeActiveLessonIndex === null ? (
            <EmptyState
              icon="📝"
              title={courseUnavailableState?.title ?? "Lesson unavailable"}
              description={courseUnavailableState?.description ?? "This lesson is not available."}
            />
          ) : (
            <LessonCanvas lessons={learningLessons} activeIndex={safeActiveLessonIndex} onSelect={selectLesson} />
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
