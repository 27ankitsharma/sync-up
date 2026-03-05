import { useSyllabus } from "@/contexts/SyllabusContext";
import { TopicDetail } from "@/components/TopicDetail";
import { motion } from "framer-motion";
import { BookOpen, Layers, FileText } from "lucide-react";

export function SyllabusContent() {
  const { state } = useSyllabus();

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
