import { useSyllabus } from "@/contexts/SyllabusContext";
import { useTopic } from "@/hooks/useSanity";
import { TopicPageSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, Layers, FolderOpen, FileText } from "lucide-react";

export function SyllabusContent() {
  const { state, selectedTopic: previewTopic } = useSyllabus();

  // If a topic is selected, fetch full details with lessons
  if (state.selectedTopicSlug) {
    return <TopicDetail slug={state.selectedTopicSlug} />;
  }

  // Landing states
  if (!state.track) {
    return (
      <WelcomeState
        icon={<Layers className="h-12 w-12 text-primary/40" />}
        title="Choose a Track to get started"
        description="Select a Track from the header to explore subjects, modules, and topics."
      />
    );
  }

  if (!state.subject) {
    return (
      <WelcomeState
        icon={<BookOpen className="h-12 w-12 text-primary/40" />}
        title={`Exploring: ${state.track}`}
        description="Now pick a Subject from the header to see its modules in the sidebar."
      />
    );
  }

  return (
    <WelcomeState
      icon={<FileText className="h-12 w-12 text-primary/40" />}
      title={`${state.track} → ${state.subject}`}
      description="Select a topic from the sidebar to view its content."
    />
  );
}

function WelcomeState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center min-h-[50vh] gap-4"
    >
      {icon}
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
      </div>
    </motion.div>
  );
}

function TopicDetail({ slug }: { slug: string }) {
  const { data: topic, isLoading, isError } = useTopic(slug);

  if (isLoading) return <TopicPageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Something went wrong"
        description="We couldn't load this topic. Please try again later."
      />
    );
  }

  if (!topic) {
    return (
      <EmptyState
        icon="🔍"
        title="Topic not found"
        description="This topic doesn't exist or hasn't been published yet."
      />
    );
  }

  return (
    <motion.div
      key={slug}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl space-y-6"
    >
      {/* Breadcrumb path */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{topic.module?.subject?.track?.title ?? ""}</span>
        <span>→</span>
        <span>{topic.module?.subject?.title ?? ""}</span>
        <span>→</span>
        <span>{topic.module?.title ?? ""}</span>
        <span>→</span>
        <span className="text-foreground font-medium">{topic.title}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{topic.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">{topic.difficulty}</Badge>
          <Badge variant="secondary">{topic.layer}</Badge>
          {topic.roles?.map((r) => (
            <Badge key={r} variant="outline" className="text-xs">
              {r}
            </Badge>
          ))}
        </div>
      </div>

      {/* Why This Matters */}
      {topic.whyItMatters && topic.whyItMatters.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              💡 Why This Matters
            </h2>
            <div className="text-sm text-foreground leading-relaxed">
              {topic.whyItMatters.map((block: any, i: number) => (
                <p key={i}>
                  {block.children?.map((child: any) => child.text).join("") || ""}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Lessons</h2>
        {(!topic.lessons || topic.lessons.length === 0) ? (
          <EmptyState
            icon="📝"
            title="Lessons coming soon"
            description="This topic's lessons are being prepared. Check back later!"
          />
        ) : (
          topic.lessons.map((lesson, i) => (
            <motion.div
              key={lesson._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="py-5">
                  <h3 className="font-semibold text-foreground mb-2">
                    {i + 1}. {lesson.title}
                  </h3>
                  <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                    {lesson.content?.map((block: any, j: number) => (
                      <p key={j}>
                        {block.children?.map((child: any) => child.text).join("") || ""}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
