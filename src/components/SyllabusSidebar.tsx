import { useSyllabus } from "@/contexts/SyllabusContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, FolderClosed, FileText, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const difficultyDot: Record<string, string> = {
  beginner: "bg-emerald-500",
  intermediate: "bg-amber-500",
  advanced: "bg-rose-500",
};

export function SyllabusSidebar() {
  const { state, hierarchy, isLoading, modulesForSubject, selectTopic } = useSyllabus();
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === "collapsed";

  // No track+subject selected: show prompt
  const noSelection = !state.track || !state.subject;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {isLoading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        )}

        {!isLoading && noSelection && !collapsed && (
          <div className="p-4 flex flex-col items-center justify-center text-center min-h-[200px] gap-3">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Select a Track & Subject</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Use the header selectors to browse modules and topics.
              </p>
            </div>
          </div>
        )}

        {!isLoading && !noSelection && modulesForSubject.length === 0 && !collapsed && (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No modules found.</p>
          </div>
        )}

        {!isLoading && !noSelection && modulesForSubject.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
                Modules
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {modulesForSubject.map(({ module: mod, topics }) => (
                  <Collapsible key={mod} defaultOpen>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="font-medium text-sidebar-foreground hover:bg-sidebar-accent">
                          <FolderClosed className="h-4 w-4 shrink-0 text-primary" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">{mod}</span>
                              <Badge
                                variant="secondary"
                                className="ml-auto text-[10px] px-1.5 py-0 h-4 bg-sidebar-accent text-sidebar-foreground/70"
                              >
                                {topics.length}
                              </Badge>
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      {!collapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {topics.map((topic) => {
                              const isActive = state.selectedTopicSlug === topic.slug.current;
                              return (
                                <SidebarMenuSubItem key={topic._id}>
                                  <SidebarMenuSubButton
                                    onClick={() => selectTopic(topic.slug.current)}
                                    isActive={isActive}
                                    className="cursor-pointer"
                                  >
                                    <FileText className="h-3.5 w-3.5 shrink-0" />
                                    <span className="flex-1 truncate text-xs">{topic.title}</span>
                                    <span
                                      className={`h-2 w-2 rounded-full shrink-0 ${difficultyDot[topic.difficulty] || "bg-muted-foreground"}`}
                                    />
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
