import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonContent } from "@/components/LessonContent";
import type { LessonContentDoc } from "@/types/courseContent";

describe("LessonContent Markdown rendering", () => {
  it("renders standard Markdown formatting instead of raw syntax", () => {
    const content: LessonContentDoc = {
      type: "doc",
      content: [
        { type: "heading", level: 2, text: "**Agent** concepts" },
        {
          type: "paragraph",
          text: "**Agent** and **bold text** with *italic text*, `inline code`, and a [link](https://example.com).",
        },
        { type: "list", style: "bullet", items: ["**Bold item**", "*Italic item*"] },
        { type: "list", style: "ordered", items: ["First", "Second"] },
        {
          type: "table",
          headers: ["**Term**", "Meaning"],
          rows: [["Agent", "*Acts toward a goal*"]],
        },
        { type: "code", language: "python", code: "print('Agent')" },
      ],
    };

    render(<LessonContent content={content} />);

    expect(screen.getAllByText("Agent")[0].tagName).toBe("STRONG");
    expect(screen.getByText("bold text").tagName).toBe("STRONG");
    expect(screen.getByText("italic text").tagName).toBe("EM");
    expect(screen.getByText("inline code").tagName).toBe("CODE");
    expect(screen.getByRole("link", { name: "link" })).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Bold item").tagName).toBe("STRONG");
    expect(screen.getByText("Italic item").tagName).toBe("EM");
    expect(within(screen.getByRole("table")).getByText("Term").tagName).toBe("STRONG");
    expect(screen.getByText("print('Agent')").tagName).toBe("CODE");
    expect(screen.queryByText("**bold text**")).not.toBeInTheDocument();
  });
});
