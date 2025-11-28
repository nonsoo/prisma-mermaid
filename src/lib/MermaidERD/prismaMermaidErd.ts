import type {
  GenerateDiagramOptions,
  Relationships,
} from "@/utils/types/generators.type.ts";

import pkg from "@prisma/internals";
import { readFileSync, writeFileSync } from "fs";
import { mkdirSync } from "node:fs";
import path from "node:path";

import { mermaidERDiagramConfig } from "@/constants/mermaid.ts";
import { generateMermaidConfig } from "@/utils/mermaid.ts";

import {
  generateRelationships,
  getKeyConstraints,
  getOptionalitySymbol,
  validateForeignKeys,
} from "./utils.ts";

const { getDMMF } = pkg;

/**
 * Generates a Mermaid ERD (Entity-Relationship Diagram) from a Prisma schema.
 *
 * This function reads the Prisma schema (either from the provided DMMF document
 * or by loading and parsing the schema file), extracts all models, enums, and
 * relationships, and then produces a `.mmd` Mermaid ER diagram file.
 *
 * The output file is written to:
 *   `<outputPath>/mermaidErdDiagram.mmd`
 * or, if no output path is provided:
 *   `<projectRoot>/src/generated/diagrams/mermaidErdDiagram.mmd`
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

    const schemaModels = prismaDocument.datamodel.models;
    const schemaEnums = prismaDocument.datamodel.enums;

    const userGeneratedConfig =
      config?.type === "mermaid-erd" ? config?.config : {};

    const diagramConfig = {
      ...mermaidERDiagramConfig,
      ...userGeneratedConfig,
    };

    const mermaidLines: string[] = [
      "%% --------------------------------------------",
      "%% Auto-generated Mermaid ER Diagram. Do Not Edit Directly.",
      "%% --------------------------------------------\n",
      generateMermaidConfig(diagramConfig, schemaModels),
      "erDiagram",
    ];
    const relationships: Relationships = {};

    schemaModels.forEach((model) => {
      mermaidLines.push(`\t${model.name} {`);

      const foreignKeyLocation = new Map<string, number>();
      const foreignKeys = new Set<string>();

      model.fields.forEach((field) => {
        if (field.relationFromFields && field.relationFromFields.length > 0) {
          field.relationFromFields.forEach((fk) => {
            foreignKeys.add(fk);
          });
        }

        mermaidLines.push(
          `\t\t${field.type} ${field.name} ${getKeyConstraints(
            field.isId,
            field.name,
            foreignKeys
          )} ${getOptionalitySymbol(field.isRequired)}`
        );

        foreignKeyLocation.set(field.name, mermaidLines.length - 1);

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

      validateForeignKeys({
        foreignKeyLocation,
        foreignKeys,
        mermaidLines,
      });

      mermaidLines.push(`\t}`);
    });

    schemaEnums.forEach((enumDef) => {
      mermaidLines.push(`\t${enumDef.name} {`);

      enumDef.values.forEach((enumValue) => {
        mermaidLines.push(`\t\t${enumValue.name}`);
      });

      mermaidLines.push(`\t}`);
    });

    const relationLines = generateRelationships({ relationships });
    const output = mermaidLines.concat(relationLines);

    mkdirSync(outputDir, { recursive: true });
    const outFile = path.join(outputDir, "mermaidErdDiagram.mmd");

    writeFileSync(outFile, output.join("\n"));

    console.log(`Mermaid ERD generated at: ${outFile}`);

    return outFile;
  } catch {
    console.error("Failed to generate Mermaid ER Diagram.");
    return "";
  }
};
