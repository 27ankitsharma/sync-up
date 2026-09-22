import type {
  CalloutTone,
  ContentBlock,
  CourseContentStatus,
  LessonContentDoc,
} from "@/types/courseContent";

const BLOCK_TYPES = new Set([
  "heading",
  "paragraph",
  "image",
  "code",
  "list",
  "link",
  "callout",
  "video",
  "table",
]);

export function emptyLessonContent(): LessonContentDoc {
  return { type: "doc", content: [] };
}

export function parseLessonContent(value: unknown): LessonContentDoc {
  if (!value || typeof value !== "object") return emptyLessonContent();

  const record = value as Record<string, unknown>;
  const blocks = Array.isArray(record.content) ? record.content : [];

  return {
    type: "doc",
    content: blocks.map(parseContentBlock).filter((block): block is ContentBlock => Boolean(block)),
  };
}

export function isPublishedStatus(status: string): status is CourseContentStatus {
  return status === "published";
}

function parseContentBlock(value: unknown): ContentBlock | null {
  if (!value || typeof value !== "object") return null;
  const block = value as Record<string, unknown>;
  const type = typeof block.type === "string" ? block.type : "";
  if (!BLOCK_TYPES.has(type)) return null;

  switch (type) {
    case "heading": {
      const level = block.level === 1 || block.level === 3 ? block.level : 2;
      const text = asString(block.text);
      return text ? { type: "heading", level, text } : null;
    }
    case "paragraph": {
      const text = asString(block.text);
      return text ? { type: "paragraph", text } : null;
    }
    case "image": {
      const src = asString(block.src);
      return src ? { type: "image", src, alt: asString(block.alt) || undefined } : null;
    }
    case "code": {
      const code = asString(block.code);
      return code ? { type: "code", language: asString(block.language) || undefined, code } : null;
    }
    case "list": {
      const items = Array.isArray(block.items) ? block.items.map(asString).filter(Boolean) : [];
      const style = block.style === "ordered" ? "ordered" : "bullet";
      return items.length > 0 ? { type: "list", style, items } : null;
    }
    case "link": {
      const href = asString(block.href);
      const text = asString(block.text);
      return href && text ? { type: "link", href, text } : null;
    }
    case "callout": {
      const text = asString(block.text);
      const tone = parseCalloutTone(block.tone);
      return text ? { type: "callout", tone, text } : null;
    }
    case "video": {
      const src = asString(block.src);
      return src ? { type: "video", src, title: asString(block.title) || undefined } : null;
    }
    case "table": {
      const rows = Array.isArray(block.rows)
        ? block.rows
            .filter((row): row is unknown[] => Array.isArray(row))
            .map((row) => row.map(asString))
        : [];
      const headers = Array.isArray(block.headers) ? block.headers.map(asString) : undefined;
      return rows.length > 0 ? { type: "table", headers, rows } : null;
    }
    default:
      return null;
  }
}

function parseCalloutTone(value: unknown): CalloutTone | undefined {
  if (value === "info" || value === "warning" || value === "tip") return value;
  return undefined;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}
