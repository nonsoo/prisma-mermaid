import type { GenerateDiagramSpacingOptions } from "@/utils/types/generators.type.ts";

import {
  DEFAULT_BASE_EDGE_SPACING,
  DEFAULT_BASE_NODE_SPACING,
} from "@/constants/mermaid.ts";

const generateDiagramSpacing = ({
  baseEdge,
  baseNode,
  models,
}: GenerateDiagramSpacingOptions) => {
  const totalFields = models.reduce((sum, m) => sum + m.fields.length, 0);
  const totalRelations = models.reduce(
    (sum, m) =>
      sum +
      m.fields.filter((f) => f.relationName && f.relationFromFields?.length)
        .length,
    0
  );

  return {
    nodeSpacing: baseNode + models.length * 6 + totalFields * 2,
    edgeSpacing: baseEdge + models.length * 4 + totalRelations * 4,
  };
};

const generateMermaidConfig = (
  config: Record<string, unknown>,
  models: GenerateDiagramSpacingOptions["models"]
) => {
  if (config["themeVariables"]) {
    const { edgeSpacing, nodeSpacing } = generateDiagramSpacing({
      baseEdge: DEFAULT_BASE_EDGE_SPACING,
      baseNode: DEFAULT_BASE_NODE_SPACING,
      models,
    });

    config["themeVariables"] = {
      ...(config["themeVariables"] as Record<string, unknown>),
      edgeSpacing,
      nodeSpacing,
    };
  }

  const json = JSON.stringify(config, null, 2);
  return `%%{init: ${json}}%%\n`;
};

export { generateMermaidConfig, generateDiagramSpacing };
