import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LandingHeroVisual } from "@/components/landing/LandingHeroVisual";
import { LandingKnowledgeTree } from "@/components/landing/LandingKnowledgeTree";
import { Compass, Gauge, Map, Radar, UserRound } from "lucide-react";

const questions = [
  "What matters?",
  "What should I learn next?",
  "How does it connect?",
  "What's changing?",
  "Am I still in sync?",
];

const loop = ["Discover", "Understand", "Learn", "Track", "Stay Updated"];

const features = [
  {
    title: "LiveMap",
    kicker: "See the AI landscape.",
    body: "A living hierarchy of tracks, subjects, modules, and topics — so you can see how AI knowledge fits together.",
    icon: Map,
  },
  {
    title: "Radar",
    kicker: "Know what's changing.",
    body: "Emerging signals, announcements, and updates — ranked by relevance to your role, not by noise.",
    icon: Radar,
  },
  {
    title: "Role-based Perspective",
    kicker: "Focus on what matters to your role.",
    body: "The same landscape reads differently for an AI Engineer, Researcher, or Leader. SyncRadar keeps that lens on.",
    icon: UserRound,
  },
  {
    title: "Sync Score",
    kicker: "Know where you stand.",
    body: "See coverage against what matters for your work — and where the gaps are — without pretending you need everything.",
    icon: Gauge,
  },
];

const steps = [
  { title: "Explore", body: "Orient yourself on LiveMap. Follow Radar when something new should change what you pay attention to." },
  { title: "Learn", body: "Open the course for a topic when you need depth — lessons stay tied to the same map." },
  { title: "Track", body: "Save progress, see your Sync Score, and come back to what is still out of date." },
];

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return (
    <div className="bg-[#fbfaff] text-slate-900">
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">SyncRadar</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
          AI moves fast. <span className="text-primary">Stay in sync.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          SyncRadar helps AI professionals navigate what matters, understand where they stand, and continuously build
          relevant knowledge — without chasing every paper, model, and framework.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
            <Link to="/livemap">Explore LiveMap</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-violet-200 bg-white/80 px-7 text-base">
            <Link to="/radar">Explore Radar</Link>
          </Button>
        </div>
        <div className="mt-14">
          <LandingHeroVisual />
        </div>
      </section>

      <section className="border-y border-violet-100/80 bg-white/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            AI doesn&apos;t have an information problem. We have a relevance problem.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Models, techniques, frameworks, research, tools, and architectures arrive faster than anyone can consume.
            The hard part is not finding more content. It is knowing what deserves attention.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {questions.map((question) => (
              <span
                key={question}
                className="rounded-full border border-violet-100 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
              >
                {question}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">What is SyncRadar?</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Your knowledge operating system for AI.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          SyncRadar is a living knowledge platform. It helps you discover what is relevant, understand how it connects,
          learn the concepts that matter, track your coverage, and stay updated as the field moves.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-2">
          {loop.map((item, index) => (
            <div key={item} className="flex items-center gap-2">
              <span className="rounded-2xl border border-violet-100 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm">
                {item}
              </span>
              {index < loop.length - 1 && <span className="text-violet-300">→</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">The system, not another feed</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-violet-100 bg-white/80 p-7 shadow-[0_24px_60px_-40px_rgba(87,63,191,0.5)] backdrop-blur"
            >
              <feature.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm font-medium text-primary">{feature.kicker}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-violet-100/80 bg-white/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  0{index + 1} · {step.title}
                </p>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-start gap-3">
          <Compass className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">A living knowledge map</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              The catalogue is a hierarchy — Track → Subject → Module → Topic — and it keeps evolving as the field
              does. Radar is how new signals enter. LiveMap is how they stay connected.
            </p>
          </div>
        </div>
        <div className="mt-10">
          <LandingKnowledgeTree />
        </div>
      </section>

      <section id="about" className="scroll-mt-24 border-y border-violet-100/80 bg-white/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Why SyncRadar</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Why SyncRadar exists
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            AI knowledge is expanding faster than individuals can consume it. More courses and more feeds do not fix
            that. They add more to chase.
          </p>
          <p className="mt-6 max-w-2xl text-xl font-medium leading-relaxed text-slate-900">
            You don&apos;t need to learn everything. You need to know what matters, understand where you stand, and stay
            aware of what is changing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24 text-center">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Don&apos;t chase AI. Stay in sync with it.
        </h2>
        <div className="mt-8">
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
            <Link to="/livemap">Start Exploring →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
