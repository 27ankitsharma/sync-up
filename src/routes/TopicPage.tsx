import { useParams, Link } from "react-router-dom";
import { useTopic } from "@/hooks/useSanity";
import { TopicPageSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: topic, isLoading, isError } = useTopic(slug || "");

  if (isLoading) {
    return <TopicPageSkeleton />;
  }

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/syllabus">Syllabus</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-muted-foreground">{topic.track}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-muted-foreground">{topic.subject}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-muted-foreground">{topic.module}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{topic.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
              {/* Render portable text as plain text for MVP */}
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
