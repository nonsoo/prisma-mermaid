export const mermaidERDiagramConfig = {
  theme: "neutral",
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
};
export const mermaidClassDiagramConfig = {
  theme: "neutral",
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
};

export const DEFAULT_BASE_NODE_SPACING = 100;
export const DEFAULT_BASE_EDGE_SPACING = 150;
