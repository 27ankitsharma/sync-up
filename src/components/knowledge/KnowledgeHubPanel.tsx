import { useEffect, useState, type ReactNode } from "react";
import { Bookmark, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAvailabilityActive, KNOWLEDGE_HUB_TABS, type KnowledgeHubTab } from "@/lib/knowledgeHub";
import type { AvailabilityStatus } from "@/types/syllabus";
import { Link } from "react-router-dom";

export function KnowledgeHubPanel({
  breadcrumb,
  title,
  subtitle,
  badges,
  icon,
  headerActions,
  onClose,
  tabs,
}: {
  breadcrumb: string[];
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  icon: ReactNode;
  headerActions?: ReactNode;
  onClose?: () => void;
  tabs: Record<KnowledgeHubTab, ReactNode>;
}) {
  const [activeTab, setActiveTab] = useState<KnowledgeHubTab>("Overview");

  useEffect(() => {
    setActiveTab("Overview");
  }, [title]);

  return (
    <aside className="sr-readable-panel hidden xl:flex min-w-[400px] w-[480px] max-w-[600px] flex-1 shrink-0 flex-col rounded-xl border border-violet-100 bg-white shadow-[0_10px_35px_-25px_rgba(87,63,191,0.45)]">
      <div className="border-b border-violet-100 p-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Knowledge Hub</p>
            {breadcrumb.length > 0 && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                {breadcrumb.map((item, index) => (
                  <span key={`${item}-${index}`}>
                    {index > 0 && <span className="mx-1">›</span>}
                    {item}
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <button type="button" className="rounded-md p-1 hover:bg-violet-50 hover:text-slate-600">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {onClose && (
              <button
                type="button"
                className="rounded-md p-1 hover:bg-violet-50 hover:text-slate-600"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3 pb-4">
          <div className="shrink-0">{icon}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold leading-snug text-slate-900">{title}</h2>
              {badges}
            </div>
            {subtitle && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>}
            {headerActions}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-0 border-b border-violet-100 px-4 text-[11px] font-semibold">
        {KNOWLEDGE_HUB_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-2.5 pt-3 ${
              activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 text-xs leading-relaxed text-slate-700">
        {tabs[activeTab]}
      </div>
    </aside>
  );
}

export function KnowledgeHubEmpty({ description }: { description: string }) {
  return (
    <aside className="sr-readable-panel hidden xl:flex min-w-[400px] w-[480px] max-w-[600px] flex-1 shrink-0 flex-col rounded-xl border border-violet-100 bg-white p-4 shadow-[0_10px_35px_-25px_rgba(87,63,191,0.45)]">
      <p className="text-sm font-bold">Knowledge Hub</p>
      <div className="mt-8 rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-5 text-center">
        <p className="text-sm font-semibold">Select an item to inspect it.</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </aside>
  );
}

export function HubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function HubEmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-[11px] text-muted-foreground">{children}</p>;
}

export function HubChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-medium text-primary">{children}</span>
  );
}

export function EditorialInterviewSections() {
  return (
    <>
      <HubSection title="Interview questions">
        <HubEmptyNote>Interview questions will appear here when editorial prep content is published.</HubEmptyNote>
      </HubSection>
      <HubSection title="FAQs">
        <HubEmptyNote>FAQs will appear here when published.</HubEmptyNote>
      </HubSection>
      <HubSection title="Common misconceptions">
        <HubEmptyNote>Common misconceptions will appear here when published.</HubEmptyNote>
      </HubSection>
    </>
  );
}

export function HubPrimaryCtas({
  courseHref,
  diagnosticHref,
  courseStatus,
  diagnosticStatus,
}: {
  courseHref?: string | null;
  diagnosticHref?: string | null;
  courseStatus: AvailabilityStatus;
  diagnosticStatus: AvailabilityStatus;
}) {
  const [saved, setSaved] = useState(false);
  const courseActive = isAvailabilityActive(courseStatus) && Boolean(courseHref);
  const diagnosticActive = isAvailabilityActive(diagnosticStatus) && Boolean(diagnosticHref);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {courseActive ? (
        <Button asChild size="sm" className="h-8 rounded-full px-4 text-xs font-semibold shadow-sm">
          <Link to={courseHref!} target="_blank" rel="noreferrer">
            Start Learning
          </Link>
        </Button>
      ) : (
        <Button size="sm" disabled className="h-8 rounded-full px-4 text-xs font-semibold">
          Start Learning
        </Button>
      )}
      {diagnosticActive ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 rounded-full border-violet-100 bg-white px-4 text-xs font-semibold text-slate-800 hover:bg-violet-50"
        >
          <Link to={diagnosticHref!} target="_blank" rel="noreferrer">
            Quiz
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="h-8 rounded-full border-violet-100 bg-white px-4 text-xs font-semibold"
        >
          Quiz
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setSaved((value) => !value)}
        className="h-8 rounded-full bg-[#f4f2fb] px-4 text-xs font-semibold text-slate-800 hover:bg-[#ebe8f6]"
      >
        <Bookmark className={`mr-1.5 h-4 w-4 ${saved ? "fill-current" : ""}`} />
        {saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}
