import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthNav } from "@/components/AuthNav";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { KnowledgeHub } from "@/components/knowledge/KnowledgeHub";
import { MyContextSidebar } from "@/components/knowledge/MyContextSidebar";
import { useLens } from "@/contexts/LensContext";
import { useSyncScoreOverview } from "@/hooks/useUser";
import { Bell, Search } from "lucide-react";

const navItems = [
  { path: "/livemap", label: "LiveMap" },
  { path: "/radar", label: "Radar" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbfaff] font-sans">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] gap-3 p-3">
        <MyContextSidebar />
        <main className="min-w-0 flex-1">{children}</main>
        <KnowledgeHub />
      </div>
    </div>
  );
}

export function AppHeader() {
  const { pathname } = useLocation();
  const { selectedLens } = useLens();
  const { data: syncScore } = useSyncScoreOverview(selectedLens);

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100/70 bg-white/85 backdrop-blur-xl">
      <div className="flex h-[60px] items-center gap-4 px-5">
        <Link to="/livemap" className="flex w-44 items-center gap-3 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-violet-100 text-primary shadow-sm">⌘</span>
          <span>
            <span className="block text-sm font-bold leading-none tracking-tight">SyncRadar</span>
            <span className="block text-[10px] text-muted-foreground">Stay in sync with AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ path, label }) => {
            const isActive = pathname === path || (path === "/livemap" && pathname === "/");
            return (
              <Link
                key={path}
                to={path}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
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
            className="h-9 border-0 bg-transparent px-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Search topics, skills, papers, tools..."
          />
          <span className="text-[10px] text-muted-foreground">⌘K</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="hidden lg:inline-flex rounded-xl bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50">
            Sync {syncScore?.syncScore ?? 87}%
          </Badge>
          <button className="hidden lg:grid h-9 w-9 place-items-center rounded-xl border border-violet-100 bg-white text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
          </button>
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
