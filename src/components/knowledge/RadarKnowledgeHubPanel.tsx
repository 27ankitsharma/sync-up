import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { RadarOutcomeIcon } from "@/components/radar/RadarOutcomeIcon";
import {
  EditorialApplySections,
  EditorialInterviewSections,
  HubChip,
  HubEmptyNote,
  HubPrimaryCtas,
  HubSection,
  KnowledgeHubEmpty,
  KnowledgeHubPanel,
} from "@/components/knowledge/KnowledgeHubPanel";
import { useLens } from "@/contexts/LensContext";
import { useAllTopics } from "@/hooks/useSyllabus";
import { useCompletedTopicSlugs } from "@/hooks/useUser";
import {
  coursePathForTopic,
  diagnosticPathForTopic,
  topicCourseStatus,
  topicDiagnosticStatus,
} from "@/lib/knowledgeHub";
import {
  classificationBadgeClass,
  classificationShortLabel,
  findMappedSyllabusTopic,
  formatDiscoveredAtLong,
  formatSyllabusBreadcrumb,
  sourceTypeBadge,
  summarizeSources,
} from "@/lib/radarDiscoveryUtils";
import { relevanceBadgeClass, relevanceLabel, siblingTopics } from "@/lib/syllabusMetrics";
import type { RadarDiscovery } from "@/types/radarDiscovery";
import { Flame } from "lucide-react";

export function RadarKnowledgeHubEmpty() {
  return (
    <KnowledgeHubEmpty description="Overview, Resources, Apply, Interview & FAQ, Updates, and Related appear here for the selected Radar discovery." />
  );
}

export function RadarKnowledgeHubPanel({
  discovery,
  onClose,
}: {
  discovery: RadarDiscovery;
  onClose?: () => void;
}) {
  const { selectedLens } = useLens();
  const { data: allTopics = [] } = useAllTopics();
  const { data: completedTopicSlugs = [] } = useCompletedTopicSlugs();

  const mappedTopic = useMemo(() => findMappedSyllabusTopic(discovery, allTopics), [allTopics, discovery]);
  const relatedTopics = useMemo(() => {
    const slugSet = new Set(discovery.relatedTopicSlugs ?? []);
    const fromDiscovery = allTopics.filter((topic) => slugSet.has(topic.slug));
    if (fromDiscovery.length > 0) return fromDiscovery;
    return mappedTopic ? siblingTopics(mappedTopic, allTopics) : [];
  }, [allTopics, discovery.relatedTopicSlugs, mappedTopic]);

  const isNewCandidate = discovery.classification === "new_topic_candidate";
  const canonicalPath = !isNewCandidate && discovery.syllabusPath ? formatSyllabusBreadcrumb(discovery.syllabusPath) : null;
  const breadcrumb = canonicalPath
    ? canonicalPath.split(" › ").filter(Boolean)
    : mappedTopic
      ? [mappedTopic.track.title, mappedTopic.subject.title, mappedTopic.module.title]
      : ["Radar"];
  const courseStatus = mappedTopic ? topicCourseStatus(mappedTopic) : "no";
  const diagnosticStatus = mappedTopic ? topicDiagnosticStatus(mappedTopic) : "no";
  const coursePath = coursePathForTopic(mappedTopic);
  const quizPath = diagnosticPathForTopic(mappedTopic);
  const isCompleted = Boolean(mappedTopic && completedTopicSlugs.includes(mappedTopic.slug));
  const lensCategory = discovery.lensRelevance[selectedLens];
  const sourceSummary = summarizeSources(discovery.sources);
  const prerequisites = mappedTopic
    ? siblingTopics(mappedTopic, allTopics).filter((item) => item.order < mappedTopic.order)
    : [];
  const nextConcepts = mappedTopic
    ? siblingTopics(mappedTopic, allTopics).filter((item) => item.order > mappedTopic.order)
    : [];
  const roles = Object.keys(discovery.lensRelevance);
  const whatItIs = mappedTopic?.summary?.trim() || discovery.summary || discovery.title;
  const whyItMatters = mappedTopic?.why_it_matters?.trim() || discovery.reason;

  return (
    <KnowledgeHubPanel
      breadcrumb={breadcrumb}
      title={discovery.title}
      subtitle={formatDiscoveredAtLong(discovery.discoveredAt)}
      badges={
        <>
          <Badge
            variant="outline"
            className={`rounded-md text-[10px] font-semibold ${classificationBadgeClass(discovery.classification)}`}
          >
            {classificationShortLabel(discovery.classification)}
          </Badge>
          {discovery.priority === "high" && (
            <Badge variant="outline" className="rounded-md border-red-200 bg-red-50 text-[10px] font-bold text-red-700">
              <Flame className="mr-1 inline h-3 w-3" />
              HIGH PRIORITY
            </Badge>
          )}
          {lensCategory && (
            <Badge className={`rounded-full text-[10px] ${relevanceBadgeClass(lensCategory)}`}>
              {selectedLens} · {relevanceLabel(lensCategory)}
            </Badge>
          )}
        </>
      }
      icon={<RadarOutcomeIcon classification={discovery.classification} size="lg" />}
      headerActions={
        <HubPrimaryCtas
          courseHref={coursePath}
          diagnosticHref={quizPath}
          courseStatus={courseStatus}
          diagnosticStatus={diagnosticStatus}
        />
      }
      onClose={onClose}
      tabs={{
        Overview: (
          <>
            <HubSection title="What it is">
              <p>{whatItIs}</p>
            </HubSection>
            <HubSection title="Why it matters">
              <p>{whyItMatters}</p>
            </HubSection>
            <HubSection title="Why Radar surfaced it">
              <p>
                {classificationShortLabel(discovery.classification)}
                {discovery.priority === "high" ? " · high priority for your current lens" : ` · ${discovery.priority} priority`}
                {lensCategory ? ` · ${selectedLens} ${relevanceLabel(lensCategory).toLowerCase()}` : ""}.
              </p>
            </HubSection>
            <HubSection title="Emerging signals">
              {discovery.sources.length > 0 ? (
                <p>
                  {discovery.sources.length} recent signal{discovery.sources.length === 1 ? "" : "s"}
                  {sourceSummary.length > 0 ? ` · ${sourceSummary.join(", ")}` : ""}. See Updates for the development
                  and Resources for the full source list.
                </p>
              ) : (
                <HubEmptyNote>No emerging source signals are attached yet.</HubEmptyNote>
              )}
            </HubSection>
            <HubSection title="Key concepts">
              <HubEmptyNote>Key concepts will appear here when editorial content is published.</HubEmptyNote>
            </HubSection>
            <HubSection title="What you'll learn">
              {mappedTopic ? (
                <HubEmptyNote>Learning outcomes will appear here when the course outline is published.</HubEmptyNote>
              ) : (
                <HubEmptyNote>This discovery is not yet a LiveMap topic, so there is no course outline.</HubEmptyNote>
              )}
            </HubSection>
            <HubSection title="Prerequisites">
              {prerequisites.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {prerequisites.map((item) => (
                    <HubChip key={item.id}>{item.title}</HubChip>
                  ))}
                </div>
              ) : (
                <HubEmptyNote>No prerequisites are listed for the related topic yet.</HubEmptyNote>
              )}
            </HubSection>
            {mappedTopic && (
              <HubSection title="Your progress">
                <p className="text-[11px] text-muted-foreground">
                  {isCompleted ? "You have completed the mapped LiveMap topic." : "You have not completed the mapped LiveMap topic yet."}
                </p>
              </HubSection>
            )}
          </>
        ),
        Resources: (
          <HubSection title="Resources">
            {discovery.sources.length > 0 ? (
              <ol className="space-y-2">
                {discovery.sources.map((source, index) => (
                  <li key={`${source.type}-${source.url}`} className="flex gap-2">
                    <span className="font-semibold text-muted-foreground">{index + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {source.title}
                      </a>
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {sourceTypeBadge(source.type)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <HubEmptyNote>No sources attached to this discovery yet.</HubEmptyNote>
            )}
          </HubSection>
        ),
        Apply: <EditorialApplySections />,
        "Interview & FAQ": <EditorialInterviewSections />,
        Updates: (
          <>
            <HubSection title="What’s changing">
              <p>{whatItIs}</p>
            </HubSection>
            <HubSection title="Why it matters now">
              <p>{discovery.reason}</p>
            </HubSection>
            {discovery.sources.length > 0 && (
              <HubSection title="Supporting signals">
                <ul className="space-y-1">
                  {discovery.sources.map((source) => (
                    <li key={`${source.type}-${source.url}`}>
                      <a href={source.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                        {source.title}
                      </a>
                      <span className="ml-2 text-[10px] text-muted-foreground">{sourceTypeBadge(source.type)}</span>
                    </li>
                  ))}
                </ul>
              </HubSection>
            )}
          </>
        ),
        Related: (
          <>
            <HubSection title="Related concepts">
              {relatedTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {relatedTopics.map((topic) => (
                    <Link
                      key={topic.id}
                      to={`/topics/${topic.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-medium text-primary hover:bg-violet-100"
                    >
                      {topic.title}
                    </Link>
                  ))}
                </div>
              ) : (
                <HubEmptyNote>No related LiveMap concepts linked yet.</HubEmptyNote>
              )}
            </HubSection>
            <HubSection title="Next concepts">
              {nextConcepts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {nextConcepts.map((item) => (
                    <HubChip key={item.id}>{item.title}</HubChip>
                  ))}
                </div>
              ) : (
                <HubEmptyNote>No next concepts are listed yet.</HubEmptyNote>
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
                <HubEmptyNote>No role relationships attached yet.</HubEmptyNote>
              )}
            </HubSection>
          </>
        ),
      }}
    />
  );
}
