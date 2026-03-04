export interface Topic {
  _id: string;
  title: string;
  slug: { current: string };
  module?: {
    _id: string;
    title: string;
    order?: number;
    subject?: {
      _id: string;
      title: string;
      order?: number;
      track?: {
        _id: string;
        title: string;
        order?: number;
        icon?: string;
      };
    };
  };
  // Legacy flat fields (for backward compat)
  track?: string;
  subject?: string;
  roles: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  layer: string;
  status: "draft" | "published" | "coming-soon";
  lastUpdated: string;
  summary?: string;
  order?: number;
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
