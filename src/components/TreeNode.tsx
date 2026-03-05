import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Layers, BookOpen, FolderOpen, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface TreeNodeData {
  id: string;
  label: string;
  type: "track" | "subject" | "module" | "topic";
  icon?: string;
  slug?: string;
  children?: TreeNodeData[];
}

const depthStyles: Record<string, string> = {
  track: "font-semibold text-base text-foreground",
  subject: "font-medium text-sm text-foreground/90",
  module: "text-sm text-foreground/80",
  topic: "text-sm text-muted-foreground",
};

const iconMap = {
  track: GraduationCap,
  subject: Layers,
  module: FolderOpen,
  topic: BookOpen,
};

interface TreeNodeProps {
  node: TreeNodeData;
  depth?: number;
}

export function TreeNode({ node, depth = 0 }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = node.type === "topic";
  const Icon = iconMap[node.type];

  const content = (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors cursor-pointer select-none",
        "hover:bg-accent/50",
        expanded && hasChildren && "bg-accent/30"
      )}
      style={{ paddingLeft: `${depth * 20 + 8}px` }}
      onClick={() => !isLeaf && hasChildren && setExpanded((v) => !v)}
    >
      {hasChildren ? (
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="shrink-0"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      ) : (
        <span className="w-4 shrink-0" />
      )}
      {node.icon ? (
        <span className="text-base shrink-0">{node.icon}</span>
      ) : (
        <Icon className="h-4 w-4 shrink-0 text-primary/70" />
      )}
      <span className={depthStyles[node.type]}>{node.label}</span>
    </div>
  );

  return (
    <div>
      {isLeaf && node.slug ? (
        <Link to={`/topic/${node.slug}`}>{content}</Link>
      ) : (
        content
      )}
      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {node.children!.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
