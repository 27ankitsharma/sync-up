import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SyllabusSidebar } from "@/components/SyllabusSidebar";
import { SyllabusHeader } from "@/components/SyllabusHeader";
import { SyllabusProvider } from "@/contexts/SyllabusContext";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/syllabus", label: "Syllabus" },
  { path: "/radar", label: "AI Radar" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isSyllabus = pathname === "/syllabus";

  const header = (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4">
        {isSyllabus && <SidebarTrigger className="shrink-0" />}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0">
          <span className="text-primary">⚡</span>
          <span className="text-foreground">Living AI Syllabus</span>
        </Link>

        {/* Syllabus hierarchy selectors */}
        {isSyllabus && (
          <div className="hidden md:flex flex-1 justify-center">
            <SyllabusHeader />
          </div>
        )}

        <nav className="flex items-center gap-1 ml-auto">
          {navItems.map(({ path, label }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-md bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile syllabus selectors */}
      {isSyllabus && (
        <div className="flex md:hidden px-4 pb-2 overflow-x-auto">
          <SyllabusHeader />
        </div>
      )}
    </header>
  );

  if (isSyllabus) {
    return (
      <SyllabusProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background font-sans">
            <SyllabusSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              {header}
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </SyllabusProvider>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {header}
      <main className="container py-8">{children}</main>
    </div>
  );
}
