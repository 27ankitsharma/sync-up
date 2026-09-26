import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { MyContextSidebar } from "@/components/knowledge/MyContextSidebar";
import { RadarFilterProvider } from "@/contexts/RadarFilterContext";

vi.mock("@/contexts/LensContext", () => ({
  useLens: () => ({
    selectedLens: "AI Engineer",
    lenses: ["AI Engineer"],
    setSelectedLens: vi.fn(),
  }),
}));

vi.mock("@/hooks/useUser", () => ({
  useSyncMetrics: () => ({ data: undefined, isError: false }),
}));

describe("shared sidebar filters", () => {
  it("shows Radar filters below My Stats with This Month selected", () => {
    render(
      <MemoryRouter>
        <RadarFilterProvider>
          <MyContextSidebar />
        </RadarFilterProvider>
      </MemoryRouter>,
    );

    const filtersPanel = screen.getByText("Filters").closest("section");
    expect(filtersPanel).not.toBeNull();
    expect(within(filtersPanel!).getByRole("combobox", { name: "Priority filter" })).toBeInTheDocument();
    expect(within(filtersPanel!).getByRole("combobox", { name: "Source filter" })).toBeInTheDocument();
    expect(within(filtersPanel!).getByRole("combobox", { name: "Time filter" })).toHaveTextContent("This Month");
  });
});
