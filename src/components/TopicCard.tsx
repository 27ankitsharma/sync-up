import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { Topic } from "@/lib/types";

const difficultyClasses: Record<string, string> = {
  beginner: "badge-difficulty-beginner",
  intermediate: "badge-difficulty-intermediate",
  advanced: "badge-difficulty-advanced",
};

export function TopicCard({ topic, index = 0 }: { topic: Topic; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link to={`/topic/${topic.slug.current}`}>
        <Card className="group hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {topic.title}
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              {topic.module?.subject?.track?.title ?? topic.track ?? ""} → {topic.module?.subject?.title ?? topic.subject ?? ""} → {topic.module?.title ?? ""}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className={difficultyClasses[topic.difficulty] || ""}>
                {topic.difficulty}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {topic.layer}
              </Badge>
              {topic.status === "coming-soon" && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Coming soon
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
