import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import type { Topic, Filters } from "@/lib/types";

// Filtered topics for Syllabus
export function useTopics(filters: Filters) {
  return useQuery<Topic[]>({
    queryKey: ["topics", filters],
    queryFn: () =>
      sanityClient.fetch(
        `*[
          _type == "topic" &&
          (!defined($role) || $role in roles) &&
          (!defined($difficulty) || difficulty == $difficulty) &&
          (!defined($layer) || layer == $layer)
        ] | order(track asc, subject asc, module asc, title asc)`,
        {
          role: filters.role || null,
          difficulty: filters.difficulty || null,
          layer: filters.layer || null,
        }
      ),
  });
}

// Single topic with dereferenced lessons
export function useTopic(slug: string) {
  return useQuery<Topic | null>({
    queryKey: ["topic", slug],
    queryFn: () =>
      sanityClient.fetch(
        `*[_type == "topic" && slug.current == $slug][0]{
          ...,
          "lessons": *[_type == "lesson" && references(^._id)] | order(order asc)
        }`,
        { slug }
      ),
    enabled: !!slug,
  });
}

// All topics ordered by lastUpdated for Radar
export function useRadarTopics() {
  return useQuery<Topic[]>({
    queryKey: ["radar-topics"],
    queryFn: () =>
      sanityClient.fetch(
        `*[_type == "topic"] | order(lastUpdated desc)`
      ),
  });
}

// Get distinct values for filter dropdowns
export function useFilterOptions() {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: async () => {
      const [roles, layers] = await Promise.all([
        sanityClient.fetch<string[]>(
          `array::unique(*[_type == "topic"].roles[])`
        ),
        sanityClient.fetch<string[]>(
          `array::unique(*[_type == "topic"].layer)`
        ),
      ]);
      return {
        roles: roles || [],
        layers: layers || [],
        difficulties: ["beginner", "intermediate", "advanced"],
      };
    },
  });
}
