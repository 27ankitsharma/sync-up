import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/Layout";

vi.mock("@/hooks/useAuth", () => ({
  useAuthUser: () => ({
    data: { id: "user-1", email: "learner@example.com" },
    isLoading: false,
  }),
  useSignOut: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/contexts/LensContext", () => ({
  useLens: () => ({ selectedLens: "AI Engineer" }),
}));

vi.mock("@/hooks/useUser", () => ({
  useSyncMetrics: () => ({
    data: {
      knowledgeSync: {
        percent: 72,
        eligibleTopics: 25,
        completedTopics: 18,
        progressUnits: 18,
      },
      radarSync: {
        percent: 48,
        eligibleTopics: 10,
        completedTopics: 4,
        progressUnits: 4.8,
      },
    },
    isError: false,
  }),
}));

describe("authenticated header sync metrics", () => {
  it("shows two clickable, distinctly styled canonical metrics", () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    );

    const knowledge = screen.getByRole("link", { name: "Knowledge Sync 72%" });
    const radar = screen.getByRole("link", { name: "Radar Sync 48%" });

    expect(knowledge).toHaveAttribute("href", "/livemap");
    expect(knowledge).toHaveClass("text-[#2563EB]");
    expect(radar).toHaveAttribute("href", "/radar");
    expect(radar).toHaveClass("text-[#059669]");
    expect(screen.queryByText(/^Sync /)).not.toBeInTheDocument();
  });
});
