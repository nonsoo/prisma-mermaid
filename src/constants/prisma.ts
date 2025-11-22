export const mermaidERDiagramConfig = {
  init: JSON.stringify({
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
  }),
};

export const mermaidClassDiagramConfig = {
  init: JSON.stringify({
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
  }),
};
