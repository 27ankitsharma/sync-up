export interface Topic {
  _id: string;
  title: string;
  slug: { current: string };
  track: string;
  subject: string;
  module: string;
  roles: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  layer: string;
  status: "draft" | "published" | "coming-soon";
  lastUpdated: string;
  whyItMatters?: any[]; // Portable Text blocks
  lessons?: Lesson[];
}

export interface Lesson {
  _id: string;
  title: string;
  order: number;
  content: any[]; // Portable Text blocks
}

export interface Filters {
  role?: string;
  difficulty?: string;
  layer?: string;
}
