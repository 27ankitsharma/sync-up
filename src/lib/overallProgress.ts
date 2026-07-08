import { getSyllabus } from "@/lib/syllabusData";
import { hasQuizCompletion } from "@/lib/syncScore";
import type { CourseNodeType } from "@/types/course";
import type { OverallProgress } from "@/types/progress";
import type { Module, Subject, Syllabus, Topic, Track } from "@/types/syllabus";

export function getOverallProgress(nodeType: CourseNodeType, nodeSlug: string): OverallProgress {
  const progressByNode = getProgressForSyllabus(getSyllabus());
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

export function getProgressForSyllabus(syllabus: Syllabus): Record<string, OverallProgress> {
  const progressByNode: Record<string, OverallProgress> = {};

  for (const track of syllabus.tracks) {
    const trackProgress = progressForTrack(track, progressByNode);
    progressByNode[progressKey("track", track.slug)] = trackProgress;
  }

  return progressByNode;
}

function progressForTrack(track: Track, progressByNode: Record<string, OverallProgress>): OverallProgress {
  const childProgress = track.subjects.map((subject) => progressForSubject(subject, progressByNode));
  return aggregateProgress("track", track.slug, childProgress);
}

function progressForSubject(subject: Subject, progressByNode: Record<string, OverallProgress>): OverallProgress {
  const childProgress = subject.modules.map((module) => progressForModule(module, progressByNode));
  const progress = aggregateProgress("subject", subject.slug, childProgress);
  progressByNode[progressKey("subject", subject.slug)] = progress;
  return progress;
}

function progressForModule(module: Module, progressByNode: Record<string, OverallProgress>): OverallProgress {
  const childProgress = module.topics.map((topic) => progressForTopic(topic, progressByNode));
  const progress = aggregateProgress("module", module.slug, childProgress);
  progressByNode[progressKey("module", module.slug)] = progress;
  return progress;
}

function progressForTopic(topic: Topic, progressByNode: Record<string, OverallProgress>): OverallProgress {
  const completedTopics = hasQuizCompletion("topic", topic.slug) ? 1 : 0;
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
