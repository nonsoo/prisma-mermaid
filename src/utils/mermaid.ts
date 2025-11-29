import type {
  GenerateDiagramSpacingOptions,
  MermaidDiagramConfig,
} from "@/utils/types/generators.type.ts";

import { dump } from "js-yaml";

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
  config: MermaidDiagramConfig["config"],
  models: GenerateDiagramSpacingOptions["models"]
) => {
  if (config["themeVariables"]) {
    const { edgeSpacing, nodeSpacing } = generateDiagramSpacing({
      baseEdge: DEFAULT_BASE_EDGE_SPACING,
      baseNode: DEFAULT_BASE_NODE_SPACING,
      models,
    });

    config["themeVariables"] = {
      ...config["themeVariables"],
      edgeSpacing,
      nodeSpacing,
    };
  }

  const finalConfig = {
    config,
  };

  const yamlString = dump(finalConfig, {
    indent: 2,
    lineWidth: 1000,
  });

  console.log(yamlString);

  return `---\n${yamlString}---\n`;
};

export { generateMermaidConfig, generateDiagramSpacing };
