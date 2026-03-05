import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { MindMapGraph, type MindMapNode } from "@/components/MindMapGraph";
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

  const tree = useMemo<MindMapNode | null>(() => {
    if (!topics || topics.length === 0) return null;

    const root: MindMapNode = {
      id: "root",
      label: "Syllabus",
      type: "root",
      icon: "⚡",
      children: [],
    };

    const trackMap = new Map<string, MindMapNode>();

    for (const t of topics) {
      const track = t.module?.subject?.track;
      const subject = t.module?.subject;
      const mod = t.module;
      if (!track || !subject || !mod) continue;

      // Track
      if (!trackMap.has(track._id)) {
        const trackNode: MindMapNode = {
          id: track._id,
          label: track.title,
          type: "track",
          icon: track.icon,
          children: [],
        };
        trackMap.set(track._id, trackNode);
        root.children!.push(trackNode);
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
          slug: t.slug?.current,
        });
      }
    }

    return root;
  }, [topics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground text-sm">No content found.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative">
      <div className="absolute top-4 left-4 z-10 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-sm">
        <h1 className="text-lg font-bold text-foreground">Full Syllabus</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click nodes to expand · Scroll to zoom · Drag to pan
        </p>
      </div>
      <MindMapGraph data={tree} />
    </div>
  );
}
