import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router-dom";

export interface MindMapNode {
  id: string;
  label: string;
  type: "root" | "track" | "subject" | "module" | "topic";
  icon?: string;
  slug?: string;
  children?: MindMapNode[];
}

interface HierarchyNode extends d3.HierarchyPointNode<MindMapNode> {
  _children?: HierarchyNode[];
  x0?: number;
  y0?: number;
}

const nodeRadius: Record<string, number> = {
  root: 34,
  track: 26,
  subject: 20,
  module: 15,
  topic: 11,
};

const nodeColors: Record<string, string> = {
  root: "#7c3aed",
  track: "#4f46e5",
  subject: "#2563eb",
  module: "#16a34a",
  topic: "#f59e0b",
};

const textSize: Record<string, number> = {
  root: 14,
  track: 13,
  subject: 12,
  module: 11,
  topic: 10,
};

interface Props {
  data: MindMapNode;
}

export function MindMapGraph({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const renderTree = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    initializedRef.current = false;

    const el = svgRef.current!;
    const width = el.clientWidth;
    const height = el.clientHeight;

    if (!tooltipRef.current) {
      tooltipRef.current = d3
        .select("body")
        .append("div")
        .attr("class", "mindmap-tooltip")
        .style("position", "absolute")
        .style("padding", "8px 12px")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "white")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .node() as HTMLDivElement;
    }

    const tooltip = d3.select(tooltipRef.current);

    const root = d3.hierarchy<MindMapNode>(data) as HierarchyNode;

    root.children?.forEach(collapse);

    root.x0 = height / 2;
    root.y0 = width / 2;

    const g = svg.append("g").attr("class", "mind-map-container");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        tooltip.style("opacity", 0);
      });

    svg.call(zoom);

    // Center initially
    const initialTransform = d3.zoomIdentity.translate(width * 0.2, height / 2).scale(0.8);
    svg.call(zoom.transform, initialTransform);

    const treeLayout = d3
      .tree<MindMapNode>()
      .nodeSize([65, 190])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 2));

    function collapse(d: HierarchyNode) {
      if (d.children) {
        d._children = d.children;
        d.children = undefined;
        d._children.forEach(collapse);
      }
    }

    function highlightPath(d: HierarchyNode) {
      g.selectAll("path.link").attr("stroke-opacity", 0.2);

      let current: HierarchyNode | null = d;
      const ids = new Set<string>();

      while (current) {
        ids.add(current.data.id);
        current = current.parent as HierarchyNode;
      }

      g.selectAll<SVGPathElement, any>("path.link")
        .filter((l: any) => ids.has(l.target.data.id))
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 1);
    }

    function update(source: HierarchyNode) {
      const duration = initializedRef.current ? 450 : 0;
      initializedRef.current = true;

      treeLayout(root);

      if (root.descendants().length > 10000) {
        root.eachBefore((d: any, i) => {
          if (i > 10000 && d.children) {
            d._children = d.children;
            d.children = undefined;
          }
        });
      }

      const nodes = root.descendants() as HierarchyNode[];
      const links = root.links();

      const link = g
        .selectAll<SVGPathElement, any>("path.link")
        .data(links, (d: any) => d.target.data.id);

      const linkEnter = link
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.6)
        .attr("d", () => {
          const o = { x: source.x0 ?? 0, y: source.y0 ?? 0 };
          return diagonal({ source: o, target: o } as any);
        });

      linkEnter
        .merge(link)
        .transition()
        .duration(duration)
        .attr("d", (d: any) => diagonal(d));

      link
        .exit()
        .transition()
        .duration(duration)
        .remove();

      const node = g
        .selectAll<SVGGElement, HierarchyNode>("g.node")
        .data(nodes, (d: any) => d.data.id);

      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", `translate(${source.y0 ?? 0},${source.x0 ?? 0})`)
        .attr("cursor", "pointer")

        .on("click", (_event, d) => {
          highlightPath(d);

          if (d.data.type === "topic" && d.data.slug) {
            tooltip.style("opacity", 0);
            navigate(`/topic/${d.data.slug}`);
            return;
          }

          if (d._children) {
            d.children = d._children;
            d._children = undefined;
          } else if (d.children) {
            d._children = d.children;
            d.children = undefined;
          }

          update(d);
        })

        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget)
            .select("circle")
            .transition()
            .duration(150)
            .attr("stroke-width", 3)
            .attr("stroke", "#111");

          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.data.label}</strong><br/>Type: ${d.data.type}`
            );
        })

        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY + 12 + "px");
        })

        .on("mouseout", (event, d) => {
          d3.select(event.currentTarget)
            .select("circle")
            .transition()
            .duration(150)
            .attr(
              "stroke-width",
              d.data.type === "root" || d.data.type === "track" ? 2.5 : 1.5
            )
            .attr(
              "stroke",
              d.data.type === "topic"
                ? "hsl(220,13%,91%)"
                : "hsl(221,83%,40%)"
            );

          tooltip.style("opacity", 0);
        });

      nodeEnter
        .append("circle")
        .attr("r", 0)
        .attr("fill", (d) => nodeColors[d.data.type])
        .attr("stroke", "#1f2937")
        .attr("stroke-opacity", 0.4);

      nodeEnter
        .append("text")
        .attr("class", "label")
        .attr("dy", (d) => nodeRadius[d.data.type] + 14)
        .attr("text-anchor", "middle")
        .attr("font-size", (d) => textSize[d.data.type])
        .attr("fill", "#111827")
        .text((d) => truncate(d.data.label, 22));

      nodeEnter
        .filter((d) => !!d.data.icon)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", (d) => nodeRadius[d.data.type] * 0.9)
        .text((d) => d.data.icon || "");

      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

      nodeUpdate
        .select("circle")
        .transition()
        .duration(duration)
        .attr("r", (d) => {
          const base = nodeRadius[d.data.type];
          const children =
            d.children?.length || d._children?.length || 0;
          return base + Math.min(children * 0.8, 6);
        })
        .attr("fill", (d) => nodeColors[d.data.type]);

      node.exit().remove();

      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    update(root);
  }, [data, navigate]);

  useEffect(() => {
  renderTree();

  const handleResize = () => renderTree();
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);

    // 🧹 remove tooltip when component unmounts
    if (tooltipRef.current) {
      d3.select(tooltipRef.current).remove();
      tooltipRef.current = null;
    }
  };
}, [renderTree]);


  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-background"
      style={{
        minHeight: "100%",
        willChange: "transform",
      }}
    />
  );
}

function diagonal(d: {
  source: { x: number; y: number };
  target: { x: number; y: number };
}) {
  return `M${d.source.y},${d.source.x}
    C${(d.source.y + d.target.y) / 2},${d.source.x}
     ${(d.source.y + d.target.y) / 2},${d.target.x}
     ${d.target.y},${d.target.x}`;
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}