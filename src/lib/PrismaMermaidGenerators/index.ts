import {
  generatorHandler,
  type GeneratorOptions,
} from "@prisma/generator-helper";

import { prismaGenerators } from "@/lib/PrismaMermaidGenerators/generator.ts";

import packageData from "../../../package.json" with { type: "json" };

generatorHandler({
  onManifest: () => {
    return {
      version: packageData["version"],
      prettyName: "Mermaid Diagram",
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    const schemaPath = options.schemaPath;
    const outputDir = options.generator.output?.value ?? undefined;
    const formats = options.generator.config.format ?? "mermaid-erd";
    const disabled = process.env.PRISMA_DIAGRAM_GENERATOR_DISABLE ?? "false";
    const generatorPrismaDocument = options.dmmf;

    if (disabled === "true") {
      return;
    }

    if (Array.isArray(formats)) {
      for await (const format of formats) {
        const mermaidGenerator = prismaGenerators.get(
          format as "mermaid-erd" | "mermaid-class"
        );

        if (!mermaidGenerator) continue;

        await mermaidGenerator({
          schemaPath,
          outputPath: outputDir,
          generatorPrismaDocument,
        });
      }

      return;
    }

    const mermaidGenerator = prismaGenerators.get(
      formats as "mermaid-erd" | "mermaid-class"
    );

    if (!mermaidGenerator) return;

    await mermaidGenerator({
      schemaPath,
      outputPath: outputDir,
      generatorPrismaDocument,
    });
  },
});
