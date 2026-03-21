import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import type { Topic, Filters } from "@/lib/types";

/**
 * Fetch topics for Syllabus page (with filters)
 * Uses orderRank for correct drag-drop ordering
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
          summary,
          priority,
          orderRank,
          module->{
            _id,
            title,
            orderRank,
            subject->{
              _id,
              title,
              orderRank,
              track->{
                _id,
                title,
                orderRank,
                icon
              }
            }
          }
        }
        | order(
          module.subject.track.orderRank asc,
          module.subject.orderRank asc,
          module.orderRank asc,
          orderRank asc
        )`,
        {
          role: filters.role || null,
          difficulty: filters.difficulty || null,
          layer: filters.layer || null,
        }
      ),
  });
}

/**
 * Fetch single topic by slug
 * Includes ordered lessons using orderRank
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
          priority,
          orderRank,
          module->{
            _id,
            title,
            orderRank,
            subject->{
              _id,
              title,
              orderRank,
              track->{
                _id,
                title,
                orderRank,
                icon
              }
            }
          },
          "lessons": *[_type == "lesson" && references(^._id)]{
            _id,
            title,
            duration,
            content,
            orderRank
          } | order(orderRank asc)
        }`,
        { slug }
      ),
    enabled: !!slug,
  });
}

/**
 * Fetch topics for AI Radar page
 * Sorted by recency (NOT orderRank)
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
          priority,
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
        sanityClient.fetch<string[]>(
          `array::unique(*[_type == "topic"].roles[])`
        ),
        sanityClient.fetch<string[]>(
          `array::unique(*[_type == "topic"].layer)`
        ),
        sanityClient.fetch<string[]>(
          `array::unique(*[_type == "topic"].difficulty)`
        ),
      ]);

      return {
        roles: roles || [],
        layers: layers || [],
        difficulties: difficulties || [],
      };
    },
  });
}