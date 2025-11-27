import type {
  MermaidClassDiagramConfig,
  MermaidERDiagramConfig,
} from "@/utils/types/generators.type.ts";

export const DEFAULT_BASE_NODE_SPACING = 100;
export const DEFAULT_BASE_EDGE_SPACING = 150;

export const mermaidERDiagramConfig = {
  theme: "neutral",
  layout: "dagre",
  look: "classic",
  themeVariables: {
    fontSize: "20px",
    fontFamily: "Arial",
    padding: "12px",
    lineHeight: "1.4",
  },
  flowchart: {
    nodeSpacing: 80,
    rankSpacing: 120,
    htmlLabels: true,
  },
} satisfies MermaidERDiagramConfig["config"];

export const mermaidClassDiagramConfig = {
  theme: "neutral",
  layout: "dagre",
  look: "classic",
  themeVariables: {
    fontFamily: "Arial",
    lineHeight: "1.4",
  },
  flowchart: {
    nodeSpacing: 300,
    rankSpacing: 120,
    htmlLabels: true,
  },
  class: {
    hideEmptyMembersBox: true,
  },
} satisfies MermaidClassDiagramConfig["config"];
