import { useSyllabus } from "@/contexts/SyllabusContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Layers, FolderOpen } from "lucide-react";

const NONE = "__none__";

export function SyllabusHeader() {
  const { state, hierarchy, subjectsForTrack, setTrack, setSubject } = useSyllabus();

  if (!hierarchy) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Track selector */}
      <Select
        value={state.track || NONE}
        onValueChange={(v) => setTrack(v === NONE ? null : v)}
      >
        <SelectTrigger className="w-[180px] h-8 text-xs bg-background border-border">
          <Layers className="h-3.5 w-3.5 mr-1.5 text-primary shrink-0" />
          <SelectValue placeholder="Select Track" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>All Tracks</SelectItem>
          {hierarchy.tracks.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subject selector — only when track is chosen */}
      {state.track && subjectsForTrack.length > 0 && (
        <Select
          value={state.subject || NONE}
          onValueChange={(v) => setSubject(v === NONE ? null : v)}
        >
          <SelectTrigger className="w-[200px] h-8 text-xs bg-background border-border">
            <BookOpen className="h-3.5 w-3.5 mr-1.5 text-primary shrink-0" />
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>All Subjects</SelectItem>
            {subjectsForTrack.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Breadcrumb context */}
      {state.track && state.subject && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
          <FolderOpen className="h-3 w-3" />
          <span>{state.track}</span>
          <span>→</span>
          <span className="text-foreground font-medium">{state.subject}</span>
        </div>
      )}
    </div>
  );
}
