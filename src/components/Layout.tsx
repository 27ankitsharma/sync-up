import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthNav } from "@/components/AuthNav";
import { SyncRadarWordmark } from "@/components/SyncRadarWordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnowledgeHub } from "@/components/knowledge/KnowledgeHub";
import { MyContextSidebar } from "@/components/knowledge/MyContextSidebar";
import { useLens } from "@/contexts/LensContext";
import { useAuthUser } from "@/hooks/useAuth";
import { useSyncMetrics } from "@/hooks/useUser";
import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const appNavItems = [
  { path: "/livemap", label: "LiveMap" },
  { path: "/radar", label: "Radar" },
];

const publicNavItems = [
  { path: "/livemap", label: "LiveMap" },
  { path: "/radar", label: "Radar" },
];

export function Layout({
  children,
  variant = "app",
}: {
  children: ReactNode;
  variant?: "app" | "marketing";
}) {
  return (
    <div className="min-h-screen bg-[#fbfaff] font-sans">
      <AppHeader forcePublic={variant === "marketing"} />
      {variant === "marketing" ? (
        <div className="min-h-[calc(100vh-60px)]">{children}</div>
      ) : (
        <div className="flex min-h-[calc(100vh-60px)] gap-3 p-3">
          <MyContextSidebar />
          <main className="min-w-0 w-full max-w-[893px] shrink grow-0">{children}</main>
          <KnowledgeHub />
        </div>
      )}
    </div>
  );
}

export function AppHeader({ forcePublic = false }: { forcePublic?: boolean }) {
  const { data: user, isLoading } = useAuthUser();
  const isAuthenticated = Boolean(user);

  if (forcePublic || isLoading || !isAuthenticated) {
    return <PublicHeader />;
  }

  return <AuthenticatedHeader />;
}

function BrandLink() {
  return (
    <Link to="/" className="flex w-auto shrink-0 items-center gap-2 sm:w-44 sm:gap-3">
      <img
        src="/syncradar-icon.png"
        alt="SyncRadar"
        className="h-8 w-8 shrink-0 rounded-xl object-cover shadow-sm sm:h-9 sm:w-9 sm:rounded-2xl"
      />
      <span>
        <SyncRadarWordmark className="block text-[21px] leading-none" />
        <span className="mt-0.5 hidden text-[15px] font-normal leading-none text-muted-foreground sm:block">
          Stay in sync with AI
        </span>
      </span>
    </Link>
  );
}

function PublicHeader() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] max-w-[1680px] items-center gap-3 px-3 sm:px-5">
        <BrandLink />
        <nav className="hidden items-center gap-1 md:flex">
          {publicNavItems.map(({ path, label }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "relative shrink-0 rounded-full px-3 py-1.5 text-base font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-base sm:px-3">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm" className="h-8 rounded-full px-4 text-base">
            <Link to="/login?redirect=/livemap">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function AuthenticatedHeader() {
  const { pathname } = useLocation();
  const { selectedLens } = useLens();
  const { data: syncMetrics, isError: syncMetricsError } = useSyncMetrics(selectedLens);
  const knowledgeLabel = metricLabel(syncMetrics?.knowledgeSync.percent, syncMetricsError);
  const radarLabel = metricLabel(syncMetrics?.radarSync.percent, syncMetricsError);

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100/70 bg-white/85 backdrop-blur-xl">
      <div className="flex h-[60px] items-center gap-4 px-5">
        <BrandLink />

        <nav className="flex items-center gap-1">
          {appNavItems.map(({ path, label }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`relative px-3 py-1.5 text-base font-medium rounded-full transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-full bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex mx-auto w-full max-w-md items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            className="h-9 border-0 bg-transparent px-0 text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search topics, skills, papers, tools..."
          />
          <span className="text-sm text-muted-foreground">⌘K</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center overflow-hidden rounded-xl border border-violet-100 bg-white text-sm shadow-sm lg:flex">
            <Link
              to="/livemap"
              className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 font-bold text-[#2563EB] transition-colors hover:bg-blue-100"
              title="Knowledge Sync for the selected role"
            >
              <span>Knowledge Sync</span>
              <span>{knowledgeLabel}</span>
            </Link>
            <span className="h-5 w-px bg-violet-100" aria-hidden="true" />
            <Link
              to="/radar"
              className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 font-bold text-[#059669] transition-colors hover:bg-emerald-100"
              title="Radar Sync for current Radar content"
            >
              <span>Radar Sync</span>
              <span>{radarLabel}</span>
            </Link>
          </div>
          <button className="hidden lg:grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-white text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
          </button>
          <AuthNav />
        </div>
      </div>
    </header>
  );
}

function metricLabel(percent: number | null | undefined, isError: boolean) {
  if (isError || percent === null) return "Unavailable";
  if (percent === undefined) return "—";
  return `${percent}%`;
}
