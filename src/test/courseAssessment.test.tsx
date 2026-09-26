import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseAssessment } from "@/components/CourseAssessment";
import type { QuizAttemptDetail } from "@/types/quiz";

const mocks = vi.hoisted(() => ({
  attempt: null as QuizAttemptDetail | null,
  submit: vi.fn(),
}));

vi.mock("@/hooks/useUser", () => ({
  useCurrentUser: () => ({ data: { id: "user-1" }, isLoading: false }),
}));

vi.mock("@/hooks/useQuiz", () => ({
  usePublishedQuiz: () => ({
    data: {
      quizId: "quiz_agent_definition_01",
      courseId: "course-agent-definition",
      title: "Agent Definition — Quiz",
      description: "Test your understanding.",
      questionsPerAttempt: 1,
      passingScore: 80,
      maxAttempts: 3,
    },
    isLoading: false,
    error: null,
  }),
  useQuizAttempt: () => ({ data: mocks.attempt, isLoading: false, error: null }),
  useStartQuiz: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useSubmitQuizAnswer: () => ({
    mutateAsync: mocks.submit,
    isPending: false,
    error: null,
  }),
}));

const baseAttempt: QuizAttemptDetail = {
  attemptId: "attempt-1",
  quizId: "quiz_agent_definition_01",
  status: "in_progress",
  startedAt: "2026-09-25T00:00:00Z",
  completedAt: null,
  score: null,
  correctCount: 0,
  questionCount: 1,
  passed: false,
  quiz: {
    title: "Agent Definition — Quiz",
    description: "Test your understanding.",
    passingScore: 80,
    maxAttempts: 3,
  },
  questions: [
    {
      questionId: "q_agent_001",
      topicId: "agent-foundations-agent-concepts-agent-definition",
      question: "What most clearly makes this an agent?",
      questionType: "single_select",
      options: [
        { value: "A", label: "A fixed sequence", feedback: "A fixed sequence is a workflow." },
        { value: "B", label: "Autonomous next actions", feedback: "Contextual action selection defines an agent." },
        { value: "C", label: "An LLM", feedback: "An LLM alone does not make an agent." },
        { value: "D", label: "Storage", feedback: "Storage alone does not make an agent." },
      ],
      hint: "Focus on deciding the next step.",
      difficulty: "Medium",
      questionOrder: 1,
      answer: null,
    },
  ],
};

describe("CourseAssessment", () => {
  beforeEach(() => {
    mocks.attempt = structuredClone(baseAttempt);
    mocks.submit.mockReset();
    mocks.submit.mockImplementation(async () => {
      const next = structuredClone(baseAttempt);
      next.questions[0].answer = {
        selectedAnswer: "A",
        isCorrect: false,
        answeredAt: "2026-09-25T00:01:00Z",
        correctAnswer: "B",
      };
      mocks.attempt = next;
      return next;
    });
  });

  it("reveals a hint, locks a submitted answer, and shows selected-option feedback", async () => {
    const view = render(
      <MemoryRouter>
        <CourseAssessment
          courseId="course-agent-definition"
          topicSlug="agent-definition"
          attemptId="attempt-1"
          onAttemptChange={vi.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /need a hint/i }));
    expect(screen.getByText(/focus on deciding the next step/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /A fixed sequence/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));
    await waitFor(() => expect(mocks.submit).toHaveBeenCalledWith({
      attemptId: "attempt-1",
      questionId: "q_agent_001",
      selectedAnswer: "A",
    }));

    view.rerender(
      <MemoryRouter>
        <CourseAssessment
          courseId="course-agent-definition"
          topicSlug="agent-definition"
          attemptId="attempt-1"
          onAttemptChange={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Not quite")).toBeInTheDocument();
    expect(screen.getByText("A fixed sequence is a workflow.")).toBeInTheDocument();
    expect(screen.getByText(/Correct answer: B/)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /A fixed sequence/i })).toBeDisabled();
  });
});
