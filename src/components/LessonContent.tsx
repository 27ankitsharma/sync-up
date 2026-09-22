import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { isEmbeddableVideoUrl, resolveCourseAssetUrl } from "@/lib/courseAssets";
import type { ContentBlock, LessonContentDoc } from "@/types/courseContent";

export function LessonContent({ content }: { content: LessonContentDoc }) {
  if (content.content.length === 0) {
    return <p className="text-sm text-muted-foreground">This lesson has no published content yet.</p>;
  }

  return (
    <div className="w-full max-w-none space-y-5 text-sm leading-relaxed text-slate-600">
      {content.content.map((block, index) => (
        <LessonBlock key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  );
}

function LessonBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading": {
      const className = block.level === 1 ? "text-xl font-bold text-foreground" : block.level === 3 ? "text-base font-semibold text-foreground" : "text-lg font-semibold text-foreground";
      return <h3 className={className}><InlineMarkdown>{block.text}</InlineMarkdown></h3>;
    }
    case "paragraph":
      return <p><InlineMarkdown>{block.text}</InlineMarkdown></p>;
    case "image":
      return <LessonImage src={block.src} alt={block.alt} />;
    case "code":
      return (
        <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-xs">
          <code>{block.code}</code>
        </pre>
      );
    case "list":
      return block.style === "ordered" ? (
        <ol className="list-decimal space-y-1 pl-5">
          {block.items.map((item, index) => (
            <li key={`${item}-${index}`}><InlineMarkdown>{item}</InlineMarkdown></li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc space-y-1 pl-5">
          {block.items.map((item, index) => (
            <li key={`${item}-${index}`}><InlineMarkdown>{item}</InlineMarkdown></li>
          ))}
        </ul>
      );
    case "link":
      return (
        <p>
          <a href={block.href} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
            <InlineMarkdown>{block.text}</InlineMarkdown>
          </a>
        </p>
      );
    case "callout":
      return (
        <div
          className={`rounded-xl border px-3 py-2 text-xs ${
            block.tone === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : block.tone === "tip"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-violet-100 bg-violet-50 text-slate-700"
          }`}
        >
          <InlineMarkdown>{block.text}</InlineMarkdown>
        </div>
      );
    case "video":
      return <LessonVideo src={block.src} title={block.title} />;
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-violet-100">
          <table className="w-full text-left text-xs">
            {block.headers && block.headers.length > 0 && (
              <thead className="bg-violet-50 text-slate-700">
                <tr>
                  {block.headers.map((header) => (
                    <th key={header} className="px-3 py-2 font-semibold">
                      <InlineMarkdown>{header}</InlineMarkdown>
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="border-t border-violet-100">
                  {row.map((cell, cellIndex) => (
                    <td key={`cell-${rowIndex}-${cellIndex}`} className="px-3 py-2">
                      <InlineMarkdown>{cell}</InlineMarkdown>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      skipHtml
      components={{
        p: ({ children: content }) => <>{content}</>,
        a: ({ href, children: content }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary hover:underline"
          >
            {content}
          </a>
        ),
        code: ({ children: content }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
            {content}
          </code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function LessonImage({ src, alt }: { src: string; alt?: string }) {
  const [failed, setFailed] = useState(false);
  const url = resolveCourseAssetUrl(src);

  if (failed) {
    return <p className="rounded-lg border border-dashed border-violet-200 bg-violet-50/50 px-3 py-2 text-xs">Image failed to load.</p>;
  }

  return (
    <figure className="overflow-hidden rounded-xl border border-violet-100 bg-white lg:aspect-video lg:bg-[#fbfaff]">
      <img
        src={url}
        alt={alt ?? ""}
        className="h-auto w-full object-contain lg:h-full lg:w-full"
        onError={() => setFailed(true)}
      />
    </figure>
  );
}

function LessonVideo({ src, title }: { src: string; title?: string }) {
  const url = resolveCourseAssetUrl(src);

  if (isEmbeddableVideoUrl(url)) {
    return (
      <div className="overflow-hidden rounded-xl border border-violet-100">
        <iframe
          title={title ?? "Lesson video"}
          src={url}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video className="w-full rounded-xl border border-violet-100" controls>
      <source src={url} />
      Your browser does not support this video.
    </video>
  );
}
