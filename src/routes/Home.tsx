import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LandingHeroVisual } from "@/components/landing/LandingHeroVisual";
import { SyncRadarWordmark } from "@/components/SyncRadarWordmark";
import { BookOpen, Gauge, Map, Radar } from "lucide-react";

const heroQuestions = [
  { label: "What matters?", className: "border-blue-200 bg-blue-50/90 text-blue-700" },
  { label: "What should I learn next?", className: "border-indigo-200 bg-indigo-50/90 text-indigo-700" },
  { label: "How does it connect?", className: "border-violet-200 bg-violet-50/90 text-violet-700" },
  { label: "What's changing?", className: "border-teal-200 bg-teal-50/90 text-teal-700" },
  { label: "Am I still in sync?", className: "border-emerald-200 bg-emerald-50/90 text-emerald-700" },
];

const features = [
  {
    title: "LiveMap",
    kicker: "Know what matters.",
    body: "Explore the AI landscape through a living map of tracks, subjects, modules, and topics.",
    icon: Map,
    accent: "border-blue-100 bg-gradient-to-br from-white to-blue-50/70",
    iconClass: "bg-blue-100 text-blue-700",
    textClass: "text-blue-700",
  },
  {
    title: "Learn",
    kicker: "Learn what you need.",
    body: "Go deeper with focused courses and lessons connected directly to the knowledge map.",
    icon: BookOpen,
    accent: "border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70",
    iconClass: "bg-indigo-100 text-indigo-700",
    textClass: "text-indigo-700",
  },
  {
    title: "Radar",
    kicker: "Know what's changing.",
    body: "Discover new topics, developments, and updates relevant to your role.",
    icon: Radar,
    accent: "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60",
    iconClass: "bg-emerald-100 text-emerald-700",
    textClass: "text-emerald-700",
  },
  {
    title: "Sync",
    kicker: "Know where you stand.",
    body: "Track your demonstrated knowledge with Knowledge Sync and Radar Sync.",
    icon: Gauge,
    accent: "border-blue-100 bg-gradient-to-br from-white to-blue-50/70",
    iconClass: "bg-blue-100 text-blue-700",
    textClass: "text-blue-700",
  },
];

const roles = [
  "AI Engineer",
  "Data Scientist",
  "Researcher",
  "ML Engineer",
  "AI Product Manager",
  "AI/ML Leader",
];

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#fbfaff] text-slate-900">
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(139,92,246,0.10),transparent_34%),radial-gradient(circle_at_85%_24%,rgba(99,102,241,0.10),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-24">
          <div>
            <SyncRadarWordmark className="text-[19px]" />
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              AI moves fast.
              <br />
              <span className="text-primary">Stay in sync.</span>
            </h1>
            <div className="mt-7 flex max-w-xl flex-wrap gap-2.5">
              {heroQuestions.map((question) => (
                <span
                  key={question.label}
                  className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur ${question.className}`}
                >
                  {question.label}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
                <Link to="/livemap">Explore LiveMap →</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-violet-200 bg-white/80 px-7 text-base"
              >
                <Link to="/radar">Explore Radar</Link>
              </Button>
            </div>
          </div>
          <LandingHeroVisual />
        </div>
      </section>

      <section className="border-y border-violet-100/80 bg-white/60">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            The <span className="text-[#2563EB]">Sync</span>
            <span className="text-[#059669]">Radar</span> system
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">One system. Four ways to stay in sync.</h2>
          <div className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className={`rounded-3xl border p-6 shadow-[0_24px_60px_-42px_rgba(87,63,191,0.5)] ${feature.accent}`}
              >
                <div className={`grid h-10 w-10 place-items-center rounded-2xl ${feature.iconClass}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
                <p className={`mt-1 text-sm font-semibold ${feature.textClass}`}>{feature.kicker}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Personalized for you</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Your role changes what matters.</h2>
            <p className="mt-5 text-xl font-medium text-slate-900">The AI landscape is the same. Your priorities aren&apos;t.</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Choose your role or lens — and SyncRadar adapts what you see across LiveMap, Learn, Radar, and Sync.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-violet-100 bg-white/75 p-5 shadow-[0_24px_60px_-44px_rgba(87,63,191,0.45)] backdrop-blur">
            <div className="grid gap-2 sm:grid-cols-2">
              {roles.map((role, index) => (
                <div
                  key={role}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                    index === 0
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-violet-100 bg-violet-50/45 text-slate-600"
                  }`}
                >
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-100/80 via-white to-indigo-100/70 px-6 py-16 text-center shadow-[0_35px_80px_-52px_rgba(87,63,191,0.65)] sm:px-10 sm:py-20">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Don&apos;t chase AI. Stay in sync with it.
            </h2>
            <div className="mt-8">
              <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
                <Link to="/livemap">Start Exploring →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
