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
  root: 32,
  track: 24,
  subject: 18,
  module: 14,
  topic: 10,
};

const nodeColors: Record<string, string> = {
  root: "hsl(221, 83%, 53%)",
  track: "hsl(221, 83%, 53%)",
  subject: "hsl(221, 83%, 65%)",
  module: "hsl(214, 95%, 73%)",
  topic: "hsl(220, 14%, 76%)",
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

  const renderTree = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    initializedRef.current = false;

    const el = svgRef.current!;
    const width = el.clientWidth;
    const height = el.clientHeight;

    // Create hierarchy
    const root = d3.hierarchy<MindMapNode>(data) as HierarchyNode;

    // Collapse all children initially except root
    root.children?.forEach(collapse);

    root.x0 = height / 2;
    root.y0 = width / 2;

    const g = svg
      .append("g")
      .attr("class", "mind-map-container");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Center initially
    const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8);
    svg.call(zoom.transform, initialTransform);

    const treeLayout = d3.tree<MindMapNode>()
      .nodeSize([60, 180])
      .separation((a, b) => (a.parent === b.parent ? 1.2 : 2));

    function collapse(d: HierarchyNode) {
      if (d.children) {
        (d as any)._children = d.children;
        d.children = undefined as any;
        (d as any)._children.forEach(collapse);
      }
    }

    function update(source: HierarchyNode) {
      const duration = initializedRef.current ? 500 : 0;
      initializedRef.current = true;

      treeLayout(root);

      const nodes = root.descendants() as HierarchyNode[];
      const links = root.links();

      // --- LINKS ---
      const link = g.selectAll<SVGPathElement, d3.HierarchyPointLink<MindMapNode>>("path.link")
        .data(links, (d: any) => d.target.data.id);

      const linkEnter = link.enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "hsl(220, 13%, 85%)")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.6)
        .attr("d", () => {
          const o = { x: source.x0 ?? 0, y: source.y0 ?? 0 };
          return diagonal({ source: o, target: o } as any);
        });

      linkEnter.merge(link)
        .transition()
        .duration(duration)
        .attr("d", (d: any) => diagonal(d));

      link.exit()
        .transition()
        .duration(duration)
        .attr("d", () => {
          const o = { x: source.x!, y: source.y! };
          return diagonal({ source: o, target: o } as any);
        })
        .remove();

      // --- NODES ---
      const node = g.selectAll<SVGGElement, HierarchyNode>("g.node")
        .data(nodes, (d: any) => d.data.id);

      const nodeEnter = node.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", `translate(${source.y0 ?? 0},${source.x0 ?? 0})`)
        .attr("cursor", "pointer")
        .on("click", (_event, d) => {
          if (d.data.type === "topic" && d.data.slug) {
            navigate(`/topic/${d.data.slug}`);
            return;
          }
          if ((d as any)._children) {
            d.children = (d as any)._children;
            (d as any)._children = undefined;
          } else if (d.children) {
            (d as any)._children = d.children;
            d.children = undefined as any;
          }
          update(d);
        });

      // Node circle
      nodeEnter.append("circle")
        .attr("r", 0)
        .attr("fill", (d) => nodeColors[d.data.type])
        .attr("stroke", (d) => d.data.type === "topic" ? "hsl(220, 13%, 91%)" : "hsl(221, 83%, 40%)")
        .attr("stroke-width", (d) => d.data.type === "root" || d.data.type === "track" ? 2.5 : 1.5)
        .attr("stroke-opacity", 0.4);

      // Expand indicator
      nodeEnter.append("text")
        .attr("class", "expand-indicator")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "white")
        .attr("font-size", (d) => Math.max(nodeRadius[d.data.type] * 0.8, 8))
        .attr("font-weight", "bold")
        .attr("pointer-events", "none");

      // Label
      nodeEnter.append("text")
        .attr("class", "label")
        .attr("dy", (d) => nodeRadius[d.data.type] + 14)
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(220, 20%, 14%)")
        .attr("font-size", (d) => textSize[d.data.type])
        .attr("font-weight", (d) => d.data.type === "track" || d.data.type === "root" ? "600" : "400")
        .attr("pointer-events", "none")
        .text((d) => truncate(d.data.label, 22));

      // Icon/emoji for tracks
      nodeEnter.filter((d) => !!d.data.icon)
        .append("text")
        .attr("class", "icon")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", (d) => nodeRadius[d.data.type] * 0.9)
        .attr("pointer-events", "none")
        .text((d) => d.data.icon || "");

      // MERGE
      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate.transition()
        .duration(duration)
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

      nodeUpdate.select("circle")
        .transition()
        .duration(duration)
        .attr("r", (d) => nodeRadius[d.data.type])
        .attr("fill", (d) => {
          const hasHidden = !!(d as any)._children;
          if (hasHidden) return nodeColors[d.data.type];
          if (d.children) return adjustAlpha(nodeColors[d.data.type], 0.7);
          return nodeColors[d.data.type];
        });

      nodeUpdate.select(".expand-indicator")
        .text((d) => {
          if (d.data.icon) return "";
          if ((d as any)._children) return "+";
          if (d.children && d.children.length > 0) return "−";
          return "";
        });

      // EXIT
      const nodeExit = node.exit()
        .transition()
        .duration(duration)
        .attr("transform", `translate(${source.y!},${source.x!})`)
        .remove();

      nodeExit.select("circle").attr("r", 0);
      nodeExit.select(".label").attr("fill-opacity", 0);

      // Save positions
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
    return () => window.removeEventListener("resize", handleResize);
  }, [renderTree]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-background"
      style={{ minHeight: "100%" }}
    />
  );
}

function diagonal(d: { source: { x: number; y: number }; target: { x: number; y: number } }) {
  return `M${d.source.y},${d.source.x}
    C${(d.source.y + d.target.y) / 2},${d.source.x}
     ${(d.source.y + d.target.y) / 2},${d.target.x}
     ${d.target.y},${d.target.x}`;
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function adjustAlpha(hslStr: string, factor: number) {
  return hslStr.replace(")", ` / ${factor})`).replace("hsl(", "hsla(");
}
