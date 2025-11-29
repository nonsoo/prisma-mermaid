import type {
  GenerateDiagramOptions,
  Relationships,
} from "@/utils/types/generators.type.ts";

import pkg from "@prisma/internals";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import { mermaidClassDiagramConfig } from "@/constants/mermaid.ts";
import { generateMermaidConfig } from "@/utils/mermaid.ts";

import { generateRelationships } from "./utils.ts";

const { getDMMF } = pkg;

/**
 * Generates a Mermaid **Class Diagram** from a Prisma schema.
 *
 * This function reads the Prisma schema (via a provided DMMF document or by
 * reading and parsing the schema file), extracts all models, enums, and
 * relationships, and constructs a Mermaid `classDiagram` definition.
 *
 * The output file is written to:
 *   `<outputPath>/mermaidClassDiagram.mmd`
 * or, if `outputPath` is omitted:
 *   `<projectRoot>/src/generated/diagrams/mermaidClassDiagram.mmd`
 */

export const generateDiagram = async ({
  outputPath,
  schemaPath,
  generatorPrismaDocument,
  config,
}: GenerateDiagramOptions) => {
  const outputDir = outputPath
    ? path.resolve(outputPath)
    : path.join(`${process.cwd()}/src/generated/diagrams`);

  try {
    const prismaDocument =
      generatorPrismaDocument ??
      (await getDMMF({
        datamodel: readFileSync(schemaPath, "utf-8"),
      }));

    const models = prismaDocument.datamodel.models;
    const enums = prismaDocument.datamodel.enums;

    const userGeneratedConfig =
      config?.type === "mermaid-class" ? config?.config : {};

    const diagramConfig = {
      ...mermaidClassDiagramConfig,
      ...userGeneratedConfig,
    };

    const mermaidLines: string[] = [
      "%% --------------------------------------------",
      "%% Auto-generated Mermaid Class Diagram.  Do Not Edit Directly.",
      "%% --------------------------------------------\n",
      generateMermaidConfig(diagramConfig, models),
      "classDiagram",
    ];

    const relationships: Relationships = {};

    models.forEach((model) => {
      mermaidLines.push(`\tclass ${model.name} {`);

      model.fields.forEach((field) => {
        mermaidLines.push(`\t\t${field.type} ${field.name}`);

        if (field.relationName) {
          if (!relationships[field.relationName]) {
            relationships[field.relationName] = [];
          }

          relationships[field.relationName]!.push({
            model: model.name,
            fieldType: field.type,
            isList: field.isList ?? false,
            isRequired: field.isRequired ?? false,
          });
        }
      });

      mermaidLines.push("\t}");
    });

    enums.forEach((enumDef) => {
      mermaidLines.push(`\tclass ${enumDef.name} {`);
      enumDef.values.forEach((val) => {
        mermaidLines.push(`\t\t<<enumeration>> ${val.name}`);
      });
      mermaidLines.push("\t}");
    });

    const relationLines = generateRelationships({ relationships });
    const output = mermaidLines.concat(relationLines).join("\n");

    mkdirSync(outputDir, { recursive: true });
    const outFile = path.join(outputDir, "mermaidClassDiagram.mmd");

    writeFileSync(outFile, output, "utf-8");

    console.log(`Mermaid Class Diagram generated at: ${outFile}`);

    return outFile;
  } catch (e) {
    console.error("Failed to generate Mermaid Class Diagram.", e);
    return "";
  }
};
