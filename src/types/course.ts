export type CourseNodeType = "track" | "subject" | "module" | "topic";

export type CourseLessonType = "quiz" | "lesson";

export interface CourseLesson {
  id: string;
  title: string;
  type: CourseLessonType;
  content: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface Quiz {
  lessonId: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface Course {
  nodeType: CourseNodeType;
  nodeSlug: string;
  lessons: CourseLesson[];
  generatedAt: string;
}
