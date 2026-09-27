export function LandingHeroVisual() {
  return (
    <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] border border-violet-100/80 bg-white/70 shadow-[0_40px_90px_-48px_rgba(87,63,191,0.6)] backdrop-blur-xl sm:min-h-[460px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.18),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.12),transparent_30%)]" />
      <div className="relative flex items-center justify-between border-b border-violet-100/70 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Radar</p>
          <p className="mt-1 text-xs text-slate-500">Scanning the AI landscape</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      <div className="relative flex min-h-[320px] items-center justify-center px-5 pb-20 pt-8 sm:min-h-[390px]">
        <div className="relative h-64 w-64 sm:h-72 sm:w-72">
          <div className="absolute inset-0 rounded-full border border-violet-200/90 bg-white/20" />
          <div className="absolute inset-8 rounded-full border border-violet-200/80" />
          <div className="absolute inset-16 rounded-full border border-violet-200/70" />
          <div className="absolute inset-24 rounded-full bg-primary/10 shadow-[0_0_40px_rgba(139,92,246,0.12)]" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-violet-100" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-violet-100" />
          <div className="landing-radar-sweep absolute inset-0 rounded-full" />
          <Signal className="left-[68%] top-[25%]" />
          <Signal className="left-[27%] top-[61%]" small />
          <Signal className="left-[57%] top-[73%]" small />
        </div>

        <span className="absolute right-[5%] top-[22%] rounded-full border border-violet-100 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-violet-700 shadow-sm sm:right-[8%]">
          New topic
        </span>
        <span className="absolute bottom-[22%] left-[3%] rounded-full border border-indigo-100 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-indigo-700 shadow-sm sm:left-[7%]">
          Topic update
        </span>

        <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-2">
          {["New Topics", "Updates", "FYI"].map((signal) => (
            <div key={signal} className="rounded-xl border border-violet-100 bg-white/80 px-2 py-2 text-center text-[10px] font-medium text-slate-600 shadow-sm">
              {signal}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Signal({ className, small = false }: { className: string; small?: boolean }) {
  return (
    <span
      className={`absolute rounded-full bg-primary ${
        small
          ? "h-2 w-2 shadow-[0_0_0_5px_rgba(139,92,246,0.12)]"
          : "h-2.5 w-2.5 shadow-[0_0_0_7px_rgba(139,92,246,0.16)]"
      } ${className}`}
    />
  );
}
