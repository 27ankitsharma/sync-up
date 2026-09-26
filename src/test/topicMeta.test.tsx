import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TopicMeta, TopicRelevantRoles } from "@/components/TopicMeta";
import type { Topic } from "@/lib/types";

const topic = {
  _id: "t1",
  title: "Agent Definition",
  slug: { current: "agent-definition" },
  roles: ["AI Engineer", "ML Engineer", "AI Researcher", "AI/ML Leader", "AI Product Manager"],
  difficulty: "beginner",
  layer: "Models & Architectures",
  status: "published",
  lastUpdated: "2026-01-01",
  priority: "high",
} satisfies Topic;

describe("TopicMeta", () => {
  it("renders a compact metadata row", () => {
    render(<TopicMeta topic={topic} lessonCount={5} totalMinutes={53} />);
    expect(screen.getByText("Beginner · 53 min · 5 lessons · High · Models & Architectures")).toBeInTheDocument();
  });

  it("shows the first three roles and expands the rest", () => {
    render(<TopicRelevantRoles roles={topic.roles} />);
    expect(screen.getByText("AI Engineer")).toBeInTheDocument();
    expect(screen.queryByText("AI Product Manager")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "+2 roles" }));
    expect(screen.getByText("AI Product Manager")).toBeInTheDocument();
  });
});
