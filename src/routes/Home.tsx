import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          AI moves fast.{" "}
          <span className="text-primary">Stay in sync.</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
          The Knowledge OS for AI professionals: LiveMap for orientation, Radar for what changed, and a persistent hub for what to learn next.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="font-medium">
            <Link to="/livemap">Explore LiveMap</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-medium">
            <Link to="/radar">Open Radar</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-16 grid grid-cols-3 gap-8 text-center"
      >
        {[
          { stat: "5+", label: "Tracks" },
          { stat: "∞", label: "Always Updated" },
          { stat: "⚡", label: "AI-Curated" },
        ].map((item) => (
          <div key={item.label}>
            <div className="text-2xl font-bold text-primary">{item.stat}</div>
            <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
