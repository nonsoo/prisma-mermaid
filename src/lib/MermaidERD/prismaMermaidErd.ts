import type {
  GenerateDiagramOptions,
  Relationships,
} from "@/utils/types/generators.type.ts";

import { getDMMF } from "@prisma/internals";
import { readFileSync, writeFileSync } from "fs";
import { mkdirSync } from "node:fs";
import path from "node:path";

import { generateRelationships, getKeyConstraints } from "./utils.ts";

export const generateDiagram = async ({
  isGenerator,
  outputPath,
  schemaPath,
}: GenerateDiagramOptions) => {
  const outputDir = outputPath
    ? path.resolve(process.cwd(), `src/generated/${outputPath}`)
    : path.join(`${process.cwd()}/src/generated/diagrams`);
  const schema = isGenerator ? schemaPath : readFileSync(schemaPath, "utf-8");
  const dmmf = await getDMMF({ datamodel: schema });

  const schemaModels = dmmf.datamodel.models;
  const schemaEnums = dmmf.datamodel.enums;

  const mermaidLines: string[] = [
    "%% --------------------------------------------",
    "%% Auto-generated Mermaid ER Diagram. Do Not Edit Directly.",
    "%% --------------------------------------------\n",
    "erDiagram",
  ];
  const relationships: Relationships = {};

  schemaModels.forEach((model) => {
    mermaidLines.push(`\t${model.name} {`);

    model.fields.forEach((field) => {
      mermaidLines.push(
        `\t\t${field.type} ${field.name} ${getKeyConstraints(
          field.isId,
          field.nativeType
        )}`
      );

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

    mermaidLines.push(`\t}`);
  });

  schemaEnums.forEach((enumDef) => {
    mermaidLines.push(`\t${enumDef.name} {`);

    enumDef.values.forEach((enumValue) => {
      mermaidLines.push(`\t\t${enumValue}`);
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
};
