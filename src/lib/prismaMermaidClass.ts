import { mermaidClassDiagramConfig } from "@/constants/prisma.ts";
import { getDMMF } from "@prisma/internals";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { inspect } from "node:util";

const getCardinality = ({
  isList,
  isRequired,
}: {
  isList: boolean;
  isRequired: boolean;
}) => {
  if (isList) return '"*"';
  return isRequired ? '"1"' : '"0..1"';
};

const generateRelationships = ({
  relationships,
}: {
  relationships: Record<
    string,
    {
      model: string;
      fieldType: string;
      isList: boolean;
      isRequired: boolean;
    }[]
  >;
}) => {
  const lines: string[] = [];

  for (const relName in relationships) {
    /*
      Side describes how many "sides" of the relation Prisma exposes rather than the cardinality
      Here we counts the side for each relation and then determine the cardinality

    */
    const sides = relationships[relName];

    if (!sides) continue;

    if (sides.length === 1) {
      const a = sides[0];
      if (!a) continue;
      lines.push(
        `${a.model} ${getCardinality({
          isList: a.isList,
          isRequired: a.isRequired,
        })} --> "1" ${a.fieldType} : ${relName}`
      );
    } else if (sides.length === 2) {
      const a = sides[0];
      const b = sides[1];

      if (!a || !b) continue;
      lines.push(
        `${a.model} ${getCardinality({
          isList: a.isList,
          isRequired: a.isRequired,
        })} --> ${getCardinality({
          isList: b.isList,
          isRequired: b.isRequired,
        })} ${b.model} : ${relName}`
      );
    } else {
      for (let i = 1; i < sides.length; i++) {
        const a = sides[0];
        const b = sides[i];
        if (!a || !b) continue;
        lines.push(
          `${a.model} ${getCardinality({
            isList: a.isList,
            isRequired: a.isRequired,
          })} --> ${getCardinality({
            isList: b.isList,
            isRequired: b.isRequired,
          })} ${b.model} : ${relName}`
        );
      }
    }
  }

  return lines;
};

export const generateDiagram = async ({
  isGenerator,
  outputPath,
  schemaPath,
}: {
  isGenerator: boolean;
  schemaPath: string;
  outputPath: string | undefined;
}) => {
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

  const relationships: Record<
    string,
    Array<{
      model: string;
      fieldType: string;
      isList: boolean;
      isRequired: boolean;
    }>
  > = {};

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
