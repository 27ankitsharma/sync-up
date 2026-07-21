import {
  getAllTopics,
  getRadarTopics,
  getSyllabus,
  getTopicBySlug,
  searchTopics,
} from "@/lib/syllabusData";
import type { RadarTopic, SearchResult, Syllabus, TopicWithContext } from "@/types/syllabus";

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  topicSlugs: string[];
}

export interface ContentServiceContract {
  getSyllabus(): Promise<Syllabus>;
  getTopic(slug: string): Promise<TopicWithContext | undefined>;
  getTopicById(id: string): Promise<TopicWithContext | undefined>;
  getRadarTopics(week?: string): Promise<RadarTopic[]>;
  searchTopics(query: string): Promise<SearchResult[]>;
  getAllTopics(): Promise<TopicWithContext[]>;
  getLearningPath(id: string): Promise<LearningPath | undefined>;
}

class JsonContentService implements ContentServiceContract {
  async getSyllabus(): Promise<Syllabus> {
    return getSyllabus();
  }

  async getTopic(slug: string): Promise<TopicWithContext | undefined> {
    return getTopicBySlug(slug);
  }

  async getTopicById(id: string): Promise<TopicWithContext | undefined> {
    return getAllTopics().find((topic) => topic.id === id);
  }

  async getRadarTopics(week?: string): Promise<RadarTopic[]> {
    return getRadarTopics(week);
  }

  async searchTopics(query: string): Promise<SearchResult[]> {
    return searchTopics(query);
  }

  async getAllTopics(): Promise<TopicWithContext[]> {
    return getAllTopics();
  }

  async getLearningPath(_id: string): Promise<LearningPath | undefined> {
    return undefined;
  }
}

export const ContentService: ContentServiceContract = new JsonContentService();
