import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Home from "@/routes/Home";

describe("Home landing page", () => {
  it("introduces SyncRadar and links into LiveMap and Radar", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /AI moves fast/i })).toBeInTheDocument();
    expect(screen.getByText("What matters?")).toBeInTheDocument();
    expect(screen.getByText("What should I learn next?")).toBeInTheDocument();
    expect(screen.getByText("How does it connect?")).toBeInTheDocument();
    expect(screen.getByText("What's changing?")).toBeInTheDocument();
    expect(screen.getByText("Am I still in sync?")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "One system. Four ways to stay in sync." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your role changes what matters." })).toBeInTheDocument();
    expect(screen.queryByText(/information problem/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Why SyncRadar exists/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore LiveMap →" })).toHaveAttribute("href", "/livemap");
    expect(screen.getByRole("link", { name: "Explore Radar" })).toHaveAttribute("href", "/radar");
    expect(screen.getByRole("link", { name: "Start Exploring →" })).toHaveAttribute("href", "/livemap");
  });
});
