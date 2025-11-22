import type { GeneratorFunction } from "./utils/types/generators.type.ts";

import {
  generatorHandler,
  type GeneratorOptions,
} from "@prisma/generator-helper";

import { prismaGenerators } from "@/constants/prisma.ts";

generatorHandler({
  onManifest: () => {
    return {
      version: "1.0.0",
      prettyName: "Mermaid Diagram Generator",
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    const schemaPath = options.schemaPath;
    const outputDir = options.generator.output?.value ?? undefined;
    const formats = options.generator.config.format ?? "mermaid-erd";
    const disabled = process.env.PRISMA_DIAGRAM_GENERATOR_DISABLE ?? "false";

    if (disabled) {
      return;
    }

    if (Array.isArray(formats)) {
      for (const format of formats) {
        const mermaidGenerator = prismaGenerators.get(
          format as "mermaid-erd" | "mermaid-class"
        );

        if (!mermaidGenerator) continue;

        mermaidGenerator({
          isGenerator: true,
          schemaPath,
          outputPath: outputDir,
        });
      }

      return;
    }

    const mermaidGenerator = prismaGenerators.get(
      formats as "mermaid-erd" | "mermaid-class"
    );

    if (!mermaidGenerator) return;

    mermaidGenerator({ isGenerator: true, schemaPath, outputPath: outputDir });
  },
});

export { prismaGenerators };

// export type { GeneratorFunction };
