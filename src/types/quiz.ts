export interface QuizOption {
  value: "A" | "B" | "C" | "D";
  label: string;
  feedback: string | null;
}

export interface PublishedQuiz {
  quizId: string;
  courseId: string;
  title: string;
  description: string | null;
  questionsPerAttempt: number;
  passingScore: number;
  maxAttempts: number | null;
}

export interface QuizAnswer {
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
  correctAnswer: string;
}

export interface AttemptQuestion {
  questionId: string;
  topicId: string | null;
  question: string;
  questionType: "single_select";
  options: QuizOption[];
  hint: string | null;
  difficulty: string | null;
  questionOrder: number;
  answer: QuizAnswer | null;
}

export interface QuizAttemptDetail {
  attemptId: string;
  quizId: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  correctCount: number;
  questionCount: number;
  passed: boolean;
  quiz: Omit<PublishedQuiz, "quizId" | "courseId" | "questionsPerAttempt">;
  questions: AttemptQuestion[];
}
