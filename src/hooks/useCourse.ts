import { useQuery } from "@tanstack/react-query";
import { CourseService } from "@/services/CourseService";

export function usePublishedCourse(topicId?: string | null) {
  return useQuery({
    queryKey: ["published-course", topicId ?? null],
    queryFn: () => CourseService.getPublishedCourseForTopic(topicId ?? ""),
    enabled: Boolean(topicId),
    staleTime: 5 * 60 * 1000,
  });
}
