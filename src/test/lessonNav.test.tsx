import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LessonNav } from "@/components/LessonNav";

const lessons = [
  { id: "agent-definition-what-is-an-agent", title: "What Exactly Is an AI Agent and What Is It Not?" },
  { id: "agent-definition-agent-vs-model-vs-automation", title: "When to Build an Agent vs Model vs Automation?" },
  { id: "agent-definition-architecture", title: "Architecture of an AI Agent" },
];

describe("LessonNav", () => {
  it("highlights the active lesson and jumps when a name is clicked", () => {
    const onSelect = vi.fn();

    render(<LessonNav lessons={lessons} activeIndex={0} completedIds={[]} onSelect={onSelect} />);

    expect(screen.getByRole("button", { name: /1\. What Exactly Is an AI Agent/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("0 of 3 complete")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /3\. Architecture of an AI Agent/ }));

    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
