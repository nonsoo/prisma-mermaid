import type {
  GenerateDiagramOptions,
  Relationships,
} from "@/utils/types/generators.type.ts";

import { getDMMF } from "@prisma/internals";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { inspect } from "node:util";

import { mermaidClassDiagramConfig } from "@/constants/prisma.ts";

import { generateRelationships } from "./utils.ts";

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
  const models = dmmf.datamodel.models;
  const enums = dmmf.datamodel.enums;

  const mermaidLines: string[] = [
    "%% --------------------------------------------",
    "%% Auto-generated Mermaid Class Diagram.  Do Not Edit Directly.",
    "%% --------------------------------------------\n",
    `%%${inspect(mermaidClassDiagramConfig, {
      depth: null,
      colors: false,
    })}%%\n`,
    "classDiagram",
  ];

  const relationships: Relationships = {};

  models.forEach((model) => {
    mermaidLines.push(`class ${model.name} {`);

    model.fields.forEach((field) => {
      mermaidLines.push(`  ${field.type} ${field.name}`);

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

    mermaidLines.push("}");
  });

  enums.forEach((enumDef) => {
    mermaidLines.push(`class ${enumDef.name} {`);
    enumDef.values.forEach((val) => {
      mermaidLines.push(`  <<enumeration>> ${val}`);
    });
    mermaidLines.push("}");
  });

  const relationLines = generateRelationships({ relationships });
  const output = mermaidLines.concat(relationLines).join("\n");

  mkdirSync(outputDir, { recursive: true });
  const outFile = path.join(outputDir, "mermaidClassDiagram.mmd");

  writeFileSync(outFile, output, "utf-8");

  console.log(`Mermaid Class Diagram written to: ${outFile}`);

  return outFile;
};
