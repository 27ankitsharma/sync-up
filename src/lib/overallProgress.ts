import type { CourseNodeType } from "@/types/course";
import type { OverallProgress } from "@/types/progress";
import type { Module, Subject, Syllabus, Topic, Track } from "@/types/syllabus";

export function getOverallProgress(
  syllabus: Syllabus,
  completedTopicSlugs: Iterable<string>,
  nodeType: CourseNodeType,
  nodeSlug: string,
): OverallProgress {
  const progressByNode = getProgressForSyllabus(syllabus, completedTopicSlugs);
  return (
    progressByNode[progressKey(nodeType, nodeSlug)] ?? {
      nodeType,
      nodeSlug,
      completedTopics: 0,
      totalTopics: 0,
      percent: 0,
    }
  );
}

export function getProgressForSyllabus(
  syllabus: Syllabus,
  completedTopicSlugs: Iterable<string> = [],
): Record<string, OverallProgress> {
  const progressByNode: Record<string, OverallProgress> = {};
  const completedTopicSlugSet = new Set(completedTopicSlugs);

  for (const track of syllabus.tracks) {
    const trackProgress = progressForTrack(track, progressByNode, completedTopicSlugSet);
    progressByNode[progressKey("track", track.slug)] = trackProgress;
  }

  return progressByNode;
}

function progressForTrack(
  track: Track,
  progressByNode: Record<string, OverallProgress>,
  completedTopicSlugs: Set<string>,
): OverallProgress {
  const childProgress = track.subjects.map((subject) => progressForSubject(subject, progressByNode, completedTopicSlugs));
  return aggregateProgress("track", track.slug, childProgress);
}

function progressForSubject(
  subject: Subject,
  progressByNode: Record<string, OverallProgress>,
  completedTopicSlugs: Set<string>,
): OverallProgress {
  const childProgress = subject.modules.map((module) => progressForModule(module, progressByNode, completedTopicSlugs));
  const progress = aggregateProgress("subject", subject.slug, childProgress);
  progressByNode[progressKey("subject", subject.slug)] = progress;
  return progress;
}

function progressForModule(
  module: Module,
  progressByNode: Record<string, OverallProgress>,
  completedTopicSlugs: Set<string>,
): OverallProgress {
  const childProgress = module.topics.map((topic) => progressForTopic(topic, progressByNode, completedTopicSlugs));
  const progress = aggregateProgress("module", module.slug, childProgress);
  progressByNode[progressKey("module", module.slug)] = progress;
  return progress;
}

function progressForTopic(
  topic: Topic,
  progressByNode: Record<string, OverallProgress>,
  completedTopicSlugs: Set<string>,
): OverallProgress {
  const completedTopics = completedTopicSlugs.has(topic.slug) ? 1 : 0;
  const progress = makeProgress("topic", topic.slug, completedTopics, 1);
  progressByNode[progressKey("topic", topic.slug)] = progress;
  return progress;
}

function aggregateProgress(
  nodeType: CourseNodeType,
  nodeSlug: string,
  childProgress: OverallProgress[],
): OverallProgress {
  const completedTopics = childProgress.reduce((sum, progress) => sum + progress.completedTopics, 0);
  const totalTopics = childProgress.reduce((sum, progress) => sum + progress.totalTopics, 0);
  return makeProgress(nodeType, nodeSlug, completedTopics, totalTopics);
}

function makeProgress(
  nodeType: CourseNodeType,
  nodeSlug: string,
  completedTopics: number,
  totalTopics: number,
): OverallProgress {
  return {
    nodeType,
    nodeSlug,
    completedTopics,
    totalTopics,
    percent: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
  };
}

function progressKey(nodeType: CourseNodeType, nodeSlug: string): string {
  return `${nodeType}:${nodeSlug}`;
}
