import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import type { Topic, Filters } from "@/lib/types";

/**
 * Fetch topics for Syllabus page (with filters)
 * Normalized schema: Track → Subject → Module → Topic
 */
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
        ]{
          _id,
          title,
          slug,
          roles,
          difficulty,
          layer,
          status,
          lastUpdated,
          order,
          summary,
          module->{
            _id,
            title,
            order,
            subject->{
              _id,
              title,
              order,
              track->{
                _id,
                title,
                order,
                icon
              }
            }
          }
        }
        | order(
          module.subject.track.order asc,
          module.subject.order asc,
          module.order asc,
          order asc
        )`,
        {
          role: filters.role || null,
          difficulty: filters.difficulty || null,
          layer: filters.layer || null,
        },
      ),
  });
}

/**
 * Fetch single topic by slug
 * Includes full hierarchy + ordered lessons
 */
export function useTopic(slug: string) {
  return useQuery<Topic | null>({
    queryKey: ["topic", slug],
    queryFn: () =>
      sanityClient.fetch(
        `*[_type == "topic" && slug.current == $slug][0]{
          _id,
          title,
          slug,
          roles,
          difficulty,
          layer,
          status,
          lastUpdated,
          summary,
          whyItMatters,
          order,
          module->{
            _id,
            title,
            order,
            subject->{
              _id,
              title,
              order,
              track->{
                _id,
                title,
                order,
                icon
              }
            }
          },
          "lessons": *[_type == "lesson" && references(^._id)]
            | order(order asc)
        }`,
        { slug },
      ),
    enabled: !!slug,
  });
}

/**
 * Fetch topics for AI Radar page
 * Sorted by lastUpdated (time-first)
 */
export function useRadarTopics() {
  return useQuery<Topic[]>({
    queryKey: ["radar-topics"],
    queryFn: () =>
      sanityClient.fetch(
        `*[_type == "topic"]{
          _id,
          title,
          slug,
          layer,
          status,
          lastUpdated,
          module->{
            title,
            subject->{
              title,
              track->{
                title
              }
            }
          }
        }
        | order(lastUpdated desc)`,
      ),
  });
}

/**
 * Fetch filter dropdown options dynamically
 */
export function useFilterOptions() {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: async () => {
      const [roles, layers, difficulties] = await Promise.all([
        sanityClient.fetch<string[]>(`array::unique(*[_type == "topic"].roles[])`),
        sanityClient.fetch<string[]>(`array::unique(*[_type == "topic"].layer)`),
        sanityClient.fetch<string[]>(`array::unique(*[_type == "topic"].difficulty)`),
      ]);

      return {
        roles: roles || [],
        layers: layers || [],
        difficulties: difficulties || [],
      };
    },
  });
}
