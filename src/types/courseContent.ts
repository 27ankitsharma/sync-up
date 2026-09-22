export type CourseContentStatus = "draft" | "published" | "archived";

export type CalloutTone = "info" | "warning" | "tip";

export interface HeadingBlock {
  type: "heading";
  level: 1 | 2 | 3;
  text: string;
}

export interface ParagraphBlock {
  type: "paragraph";
  text: string;
}

export interface ImageBlock {
  type: "image";
  src: string;
  alt?: string;
}

export interface CodeBlock {
  type: "code";
  language?: string;
  code: string;
}

export interface ListBlock {
  type: "list";
  style: "bullet" | "ordered";
  items: string[];
}

export interface LinkBlock {
  type: "link";
  href: string;
  text: string;
}

export interface CalloutBlock {
  type: "callout";
  tone?: CalloutTone;
  text: string;
}

export interface VideoBlock {
  type: "video";
  src: string;
  title?: string;
}

export interface TableBlock {
  type: "table";
  headers?: string[];
  rows: string[][];
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | CodeBlock
  | ListBlock
  | LinkBlock
  | CalloutBlock
  | VideoBlock
  | TableBlock;

export interface LessonContentDoc {
  type: "doc";
  content: ContentBlock[];
}

export interface Course {
  id: string;
  topicId: string;
  title: string;
  slug: string;
  description: string | null;
  status: CourseContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  orderIndex: number;
  content: LessonContentDoc;
  durationMinutes: number | null;
  status: CourseContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithLessons {
  course: Course;
  lessons: Lesson[];
}

export type CourseLoadStatus = "ok" | "none" | "error";

export type CourseLoadResult =
  | { status: "ok"; course: Course; lessons: Lesson[] }
  | { status: "none" }
  | { status: "error" };
