import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useUser";
import { usePublishedQuiz, useQuizAttempt, useStartQuiz, useSubmitQuizAnswer } from "@/hooks/useQuiz";

interface CourseAssessmentProps {
  courseId: string;
  topicSlug: string;
  attemptId: string | null;
  onAttemptChange: (attemptId: string) => void;
}

export function CourseAssessment({
  courseId,
  topicSlug,
  attemptId,
  onAttemptChange,
}: CourseAssessmentProps) {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: quiz, isLoading: quizLoading, error: quizError } = usePublishedQuiz(courseId);
  const { data: attempt, isLoading: attemptLoading, error: attemptError } = useQuizAttempt(attemptId);
  const startQuiz = useStartQuiz();
  const submitAnswer = useSubmitQuizAnswer();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const initializedAttempt = useRef<string | null>(null);

  useEffect(() => {
    if (!attempt || initializedAttempt.current === attempt.attemptId) return;
    const firstUnanswered = attempt.questions.findIndex((question) => !question.answer);
    setQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
    setSelectedAnswer(null);
    setHintVisible(false);
    initializedAttempt.current = attempt.attemptId;
  }, [attempt]);

  if (quizLoading || userLoading || (attemptId && attemptLoading)) {
    return <AssessmentMessage title="Loading assessment…" description="Preparing your quiz." />;
  }

  if (quizError || attemptError) {
    return (
      <AssessmentMessage
        title="Assessment unavailable"
        description={errorMessage(quizError ?? attemptError)}
        error
      />
    );
  }

  if (!quiz) {
    return (
      <AssessmentMessage
        title="No published assessment"
        description="A quiz has not been published for this course yet."
      />
    );
  }

  if (!user) {
    return (
      <AssessmentMessage
        title={quiz.title}
        description="Sign in to start the assessment and save your result."
        action={
          <Button asChild>
            <Link to={`/login?redirect=${encodeURIComponent(`/topic/${topicSlug}?lesson=quiz`)}`}>Sign in</Link>
          </Button>
        }
      />
    );
  }

  if (!attemptId || !attempt) {
    const start = async () => {
      const nextAttempt = await startQuiz.mutateAsync(quiz.quizId);
      initializedAttempt.current = null;
      onAttemptChange(nextAttempt.attemptId);
    };
    return (
      <AssessmentMessage
        title={quiz.title}
        description={quiz.description ?? "Test your mastery of this course."}
        action={
          <div className="space-y-3 text-center">
            <Button onClick={start} disabled={startQuiz.isPending}>
              {startQuiz.isPending ? "Starting…" : "Start Quiz"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {quiz.questionsPerAttempt} questions · {quiz.passingScore}% to pass
              {quiz.maxAttempts ? ` · ${quiz.maxAttempts} attempts maximum` : ""}
            </p>
            {startQuiz.error && <p className="text-sm text-red-600">{errorMessage(startQuiz.error)}</p>}
          </div>
        }
      />
    );
  }

  if (attempt.status === "completed") {
    const retry = async () => {
      const nextAttempt = await startQuiz.mutateAsync(quiz.quizId);
      initializedAttempt.current = null;
      onAttemptChange(nextAttempt.attemptId);
    };
    return (
      <Card className="mx-auto max-w-3xl border-violet-100 bg-white shadow-sm">
        <CardContent className="space-y-5 p-6 text-center sm:p-10">
          {attempt.passed ? (
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          ) : (
            <XCircle className="mx-auto h-12 w-12 text-amber-500" />
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Quiz complete</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{attempt.quiz.title}</h1>
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-900">{attempt.score}%</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {attempt.correctCount} / {attempt.questionCount} correct
            </p>
          </div>
          <p className={cn("font-medium", attempt.passed ? "text-emerald-700" : "text-amber-700")}>
            {attempt.passed
              ? "Passed — course completed"
              : `You need ${attempt.quiz.passingScore}% to pass.`}
          </p>
          {!attempt.passed && (
            <>
              <Button onClick={retry} disabled={startQuiz.isPending}>
                {startQuiz.isPending ? "Starting…" : "Retry Quiz"}
              </Button>
              {startQuiz.error && <p className="text-sm text-red-600">{errorMessage(startQuiz.error)}</p>}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  const question = attempt.questions[questionIndex];
  if (!question) {
    return <AssessmentMessage title="Assessment unavailable" description="This attempt has no questions." error />;
  }
  const submitted = question.answer;
  const chosenOption = question.options.find(
    (option) => option.value === (submitted?.selectedAnswer ?? selectedAnswer),
  );
  const correctOption = submitted
    ? question.options.find((option) => option.value === submitted.correctAnswer)
    : null;
  const answeredCount = attempt.questions.filter((item) => item.answer).length;

  const submit = async () => {
    if (!selectedAnswer || submitted) return;
    await submitAnswer.mutateAsync({
      attemptId: attempt.attemptId,
      questionId: question.questionId,
      selectedAnswer,
    });
  };

  const next = () => {
    setQuestionIndex((index) => Math.min(index + 1, attempt.questions.length - 1));
    setSelectedAnswer(null);
    setHintVisible(false);
  };

  return (
    <Card className="mx-auto max-w-4xl border-violet-100 bg-white shadow-sm">
      <CardContent className="p-5 sm:p-8">
        <div className="mb-7">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-700">
              Question {questionIndex + 1} of {attempt.questionCount}
            </span>
            {question.difficulty && <span className="text-xs text-muted-foreground">{question.difficulty}</span>}
          </div>
          <Progress value={(answeredCount / attempt.questionCount) * 100} className="mt-3 h-1.5" />
        </div>

        <h1 className="text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl">{question.question}</h1>

        <div className="mt-6 space-y-3" role="radiogroup" aria-label="Answer options">
          {question.options.map((option) => {
            const isSelected = (submitted?.selectedAnswer ?? selectedAnswer) === option.value;
            const isCorrect = submitted && option.value === submitted.correctAnswer;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={Boolean(submitted)}
                onClick={() => setSelectedAnswer(option.value)}
                className={cn(
                  "flex min-h-14 w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  !submitted && isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20",
                  !submitted && !isSelected && "border-slate-200 hover:border-primary/40 hover:bg-violet-50/40",
                  submitted && isCorrect && "border-emerald-300 bg-emerald-50",
                  submitted && isSelected && !isCorrect && "border-red-300 bg-red-50",
                  submitted && !isSelected && !isCorrect && "border-slate-100 opacity-65",
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                  {option.value}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-slate-700 sm:text-base">{option.label}</span>
              </button>
            );
          })}
        </div>

        {!submitted && question.hint && (
          <div className="mt-5">
            {!hintVisible ? (
              <Button variant="ghost" size="sm" onClick={() => setHintVisible(true)} className="px-0 text-primary">
                <Lightbulb className="mr-2 h-4 w-4" />
                Need a hint?
              </Button>
            ) : (
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                <span className="font-medium">Hint: </span>
                {question.hint}
              </div>
            )}
          </div>
        )}

        {submitted && chosenOption && (
          <div
            className={cn(
              "mt-6 rounded-xl border p-4",
              submitted.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50",
            )}
          >
            <div className="flex items-center gap-2 font-semibold">
              {submitted.isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Correct
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" /> Not quite
                </>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{chosenOption.feedback}</p>
            {!submitted.isCorrect && correctOption && (
              <p className="mt-3 text-sm font-medium text-slate-800">
                Correct answer: {correctOption.value}. {correctOption.label}
              </p>
            )}
          </div>
        )}

        {submitAnswer.error && (
          <p className="mt-4 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errorMessage(submitAnswer.error)}
          </p>
        )}

        <div className="mt-7 flex justify-end">
          {!submitted ? (
            <Button onClick={submit} disabled={!selectedAnswer || submitAnswer.isPending}>
              {submitAnswer.isPending ? "Submitting…" : "Submit Answer"}
            </Button>
          ) : (
            questionIndex < attempt.questions.length - 1 && <Button onClick={next}>Next Question</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AssessmentMessage({
  title,
  description,
  action,
  error = false,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  error?: boolean;
}) {
  return (
    <Card className="mx-auto max-w-3xl border-violet-100 bg-white shadow-sm">
      <CardContent className="space-y-5 p-8 text-center sm:p-12">
        {error && <AlertCircle className="mx-auto h-9 w-9 text-red-500" />}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
