import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import { TreeNode, type TreeNodeData } from "@/components/TreeNode";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import type { Topic } from "@/lib/types";

export default function SyllabusMap() {
  const { data: topics, isLoading } = useQuery<Topic[]>({
    queryKey: ["syllabus-map-topics"],
    queryFn: () =>
      sanityClient.fetch(
        `*[_type == "topic"]{
          _id, title, slug,
          module->{
            _id, title, order,
            subject->{
              _id, title, order,
              track->{ _id, title, order, icon }
            }
          }
        }
        | order(
          module.subject.track.order asc,
          module.subject.order asc,
          module.order asc,
          order asc
        )`
      ),
  });

  const tree = useMemo<TreeNodeData[]>(() => {
    if (!topics) return [];

    const trackMap = new Map<string, TreeNodeData>();

    for (const t of topics) {
      const track = t.module?.subject?.track;
      const subject = t.module?.subject;
      const mod = t.module;
      if (!track || !subject || !mod) continue;

      // Track
      if (!trackMap.has(track._id)) {
        trackMap.set(track._id, {
          id: track._id,
          label: track.title,
          type: "track",
          icon: track.icon,
          children: [],
        });
      }
      const trackNode = trackMap.get(track._id)!;

      // Subject
      let subjectNode = trackNode.children!.find((c) => c.id === subject._id);
      if (!subjectNode) {
        subjectNode = { id: subject._id, label: subject.title, type: "subject", children: [] };
        trackNode.children!.push(subjectNode);
      }

      // Module
      let moduleNode = subjectNode.children!.find((c) => c.id === mod._id);
      if (!moduleNode) {
        moduleNode = { id: mod._id, label: mod.title, type: "module", children: [] };
        subjectNode.children!.push(moduleNode);
      }

      // Topic
      if (!moduleNode.children!.find((c) => c.id === t._id)) {
        moduleNode.children!.push({
          id: t._id,
          label: t.title,
          type: "topic",
          slug: t.slug.current,
        });
      }
    }

    return Array.from(trackMap.values());
  }, [topics]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Full Syllabus</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore the entire curriculum as an interactive knowledge tree.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : tree.length === 0 ? (
        <p className="text-muted-foreground text-sm">No content found.</p>
      ) : (
        <div className="border border-border rounded-lg bg-card p-4 space-y-1">
          {tree.map((node) => (
            <TreeNode key={node.id} node={node} />
          ))}
        </div>
      )}
    </div>
  );
}
