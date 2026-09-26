import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RadarHeader } from "@/components/radar/RadarHeader";
import { RadarFilterProvider } from "@/contexts/RadarFilterContext";
import { isWithinTimeRange } from "@/lib/radarDiscoveryUtils";

describe("RadarHeader", () => {
  it("removes For You, defaults to All, and keeps remaining tabs interactive", () => {
    render(
      <RadarFilterProvider>
        <RadarHeader total={4} />
      </RadarFilterProvider>,
    );

    expect(screen.queryByRole("button", { name: "For You" })).not.toBeInTheDocument();
    expect(screen.getByText("This month")).toBeInTheDocument();

    const all = screen.getByRole("button", { name: "All" });
    const newTopics = screen.getByRole("button", { name: "New Topics" });
    expect(all).toHaveClass("bg-primary");

    fireEvent.click(newTopics);
    expect(newTopics).toHaveClass("bg-primary");
    expect(all).not.toHaveClass("bg-primary");
  });

  it("supports an unbounded All time range", () => {
    expect(isWithinTimeRange("2000-01-01T00:00:00.000Z", "all")).toBe(true);
  });
});
