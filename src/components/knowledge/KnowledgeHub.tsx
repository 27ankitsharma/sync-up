import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useKnowledgeSelection } from "@/contexts/KnowledgeSelectionContext";
import { useLens } from "@/contexts/LensContext";
import { useRadarSelection } from "@/contexts/RadarSelectionContext";
import { useAllTopics, useSyllabus } from "@/hooks/useSyllabus";
import { useCompletedTopicSlugs } from "@/hooks/useUser";
import {
  coursePathForTopic,
  courseStatusForTopics,
  diagnosticPathForTopic,
  diagnosticStatusForTopics,
  firstDiagnosticTopic,
  firstLearnableTopic,
  topicCourseStatus,
  topicDiagnosticStatus,
} from "@/lib/knowledgeHub";
import {
  relevanceBadgeClass,
  relevanceLabel,
  siblingTopics,
  topicRelevance,
  topicsForSelectedNode,
} from "@/lib/syllabusMetrics";
import { Network } from "lucide-react";
import {
  EditorialInterviewSections,
  HubChip,
  HubEmptyNote,
  HubPrimaryCtas,
  HubSection,
  KnowledgeHubEmpty,
  KnowledgeHubPanel,
} from "@/components/knowledge/KnowledgeHubPanel";
import { RadarKnowledgeHubEmpty, RadarKnowledgeHubPanel } from "@/components/knowledge/RadarKnowledgeHubPanel";

export function KnowledgeHub() {
  const { pathname } = useLocation();
  const isRadarPage = pathname === "/radar";
  const { selectedObject } = useKnowledgeSelection();

  if (isRadarPage) {
    return <RadarKnowledgeHub />;
  }

  return <LiveMapKnowledgeHub selectedObject={selectedObject} />;
}

function RadarKnowledgeHub() {
  const { selectedDiscovery, clearSelection } = useRadarSelection();

  if (!selectedDiscovery) {
    return <RadarKnowledgeHubEmpty />;
  }

  return (
    <RadarKnowledgeHubPanel
      discovery={selectedDiscovery}
      onClose={clearSelection}
    />
  );
}

function LiveMapKnowledgeHub({
  selectedObject,
}: {
  selectedObject: ReturnType<typeof useKnowledgeSelection>["selectedObject"];
}) {
  const { data: completedTopicSlugs = [] } = useCompletedTopicSlugs();
  const { selectedLens } = useLens();
  const { data: syllabus } = useSyllabus();
  const { data: allTopics = [] } = useAllTopics();

  if (!selectedObject) {
    return (
      <KnowledgeHubEmpty description="Overview, Resources, Interview & FAQ, Updates, and Related appear here for the selected LiveMap item." />
    );
  }

  const topic = selectedObject.topic;
  const title = selectedObject.title;
  const childTopics =
    topic || !syllabus ? [] : topicsForSelectedNode(syllabus, selectedObject.type, selectedObject.id);
  const courseStatus = topic ? topicCourseStatus(topic) : courseStatusForTopics(childTopics);
  const diagnosticStatus = topic ? topicDiagnosticStatus(topic) : diagnosticStatusForTopics(childTopics);
  const learnTopic = topic ?? firstLearnableTopic(childTopics);
  const diagnosticTopic = topic ?? firstDiagnosticTopic(childTopics);
  const coursePath = coursePathForTopic(learnTopic);
  const quizPath = diagnosticPathForTopic(diagnosticTopic);
  const relevance = topic ? topicRelevance(topic, selectedLens) : null;
  const importance = relevance ? relevanceLabel(relevance) : selectedObject.meta?.importance?.toString();
  const breadcrumb = topic
    ? [topic.track.title, topic.subject.title, topic.module.title]
    : selectedObject.subtitle?.split(" / ").filter(Boolean) ?? [];
  const isCompleted = Boolean(topic && completedTopicSlugs.includes(topic.slug));
  const progressPercent = isCompleted ? 100 : 0;
  const siblings = topic ? siblingTopics(topic, allTopics) : [];
  const related = siblings.filter((item) => topicRelevance(item, selectedLens) !== "Optional");
  const roles = topic?.roles ?? [];
  const resources = topic?.resources ?? [];
  const whatItIs =
    topic?.summary ||
    selectedObject.meta?.summary?.toString() ||
    `${title} is part of the canonical knowledge map.`;
  const whyItMatters = topic?.why_it_matters?.trim() || null;

  return (
    <KnowledgeHubPanel
      breadcrumb={breadcrumb}
      title={title}
      subtitle={topic?.summary}
      badges={
        importance ? (
          <Badge
            className={`rounded-full text-[10px] ${
              relevance ? relevanceBadgeClass(relevance) : "bg-slate-100 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {importance}
          </Badge>
        ) : null
      }
      icon={
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-300/60">
          <Network className="h-7 w-7" />
        </div>
      }
      headerActions={
        <HubPrimaryCtas
          courseHref={coursePath}
          diagnosticHref={quizPath}
          courseStatus={courseStatus}
          diagnosticStatus={diagnosticStatus}
        />
      }
      tabs={{
        Overview: (
          <>
            <HubSection title="What it is">
              <p>{whatItIs}</p>
            </HubSection>
            <HubSection title="Why it matters">
              {whyItMatters ? <p>{whyItMatters}</p> : <HubEmptyNote>Why it matters will appear when editorial copy is published.</HubEmptyNote>}
            </HubSection>
            {topic && (
              <HubSection title="Your progress">
                <div className="grid grid-cols-[104px_1fr] gap-4">
                  <div
                    className="grid h-24 w-24 place-items-center rounded-full"
                    style={{ background: `conic-gradient(hsl(var(--primary)) ${progressPercent}%, #eee7ff 0)` }}
                  >
                    <div className="grid h-[70px] w-[70px] place-items-center rounded-full bg-white text-center">
                      <span className="text-xl font-bold text-slate-900">{progressPercent}%</span>
                      <span className="-mt-5 text-[10px] text-muted-foreground">Completed</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <ProgressLine label="Diagnostic" done={isCompleted} value={isCompleted ? "Complete" : "Pending"} />
                    <ProgressLine label="Concepts" done={isCompleted} value={isCompleted ? "Complete" : "Not started"} />
                    <ProgressLine label="Practice" done={isCompleted} value={isCompleted ? "Complete" : "Not started"} />
                    <Link to="/profile" className="inline-block pt-1 font-medium text-primary">
                      View Details →
                    </Link>
                  </div>
                </div>
              </HubSection>
            )}
          </>
        ),
        Resources: (
          <HubSection title="Resources">
            {resources.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {resources.map((item) => (
                  <a
                    key={`${item.type}-${item.url}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-medium text-primary"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            ) : (
              <HubEmptyNote>No resources in syllabus yet.</HubEmptyNote>
            )}
          </HubSection>
        ),
        "Interview & FAQ": <EditorialInterviewSections />,
        Updates: (
          <HubSection title="Updates">
            {topic?.is_radar ? (
              <p>
                This topic is currently marked for Radar attention
                {topic.radar_week ? ` (${topic.radar_week})` : ""}. Open Radar for personalized emerging developments.
              </p>
            ) : (
              <HubEmptyNote>No recent updates for this selection yet.</HubEmptyNote>
            )}
          </HubSection>
        ),
        Related: (
          <>
            <HubSection title="Related concepts">
              {related.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {related.map((item) => (
                    <HubChip key={item.id}>{item.title}</HubChip>
                  ))}
                </div>
              ) : (
                <HubEmptyNote>Select a topic to see related concepts in the same module.</HubEmptyNote>
              )}
            </HubSection>
            <HubSection title="Relevant roles">
              {roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <HubChip key={role}>{role}</HubChip>
                  ))}
                </div>
              ) : (
                <HubEmptyNote>No role relationships in syllabus yet.</HubEmptyNote>
              )}
            </HubSection>
          </>
        ),
      }}
    />
  );
}

function ProgressLine({ label, done, value }: { label: string; done?: boolean; value?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className={done ? "text-emerald-500" : "text-primary"}>{done ? "●" : value ?? "○"}</span>
    </div>
  );
}
