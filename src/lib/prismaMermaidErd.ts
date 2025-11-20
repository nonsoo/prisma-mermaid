import { getDMMF } from "@prisma/internals";
import { readFileSync, writeFileSync } from "fs";
import { mkdirSync } from "node:fs";
import path from "node:path";

const getCardinality = ({
  isList,
  isRequired,
}: {
  isList: boolean;
  isRequired: boolean;
}) => {
  if (isList) {
    // shows many relationship
    return "}|";
  }

  // shows one or zero-one relationship
  return isRequired ? "||" : "o|";
};

const getKeyConstraints = (
  isId: boolean,
  nativeTypes?: readonly [string, readonly string[]] | null
) => {
  if (isId) return "PK";

  if (nativeTypes) {
    const allNativeTypes = nativeTypes.flatMap((nativeType) => nativeType);

    if (!isId && allNativeTypes.includes("UniqueIdentifier")) return "FK";
  }

  return "";
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
  const relationLines: Array<string> = [];

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
      relationLines.push(
        `\t${a.model} ${getCardinality({
          isList: a.isList,
          isRequired: a.isRequired,
        })}--${getCardinality({ isList: false, isRequired: true })} ${
          a.fieldType
        } : ${relName}`
      );
    } else if (sides.length === 2) {
      const a = sides[0];
      const b = sides[1];

      if (!a || !b) continue;

      relationLines.push(
        `\t${a.model} ${getCardinality({
          isList: a.isList,
          isRequired: a.isRequired,
        })}--${getCardinality({
          isList: b.isList,
          isRequired: b.isRequired,
        })} ${b.model} : ${relName}`
      );
    } else {
      // More than 2 Sides
      for (let i = 1; i < sides.length; i++) {
        const a = sides[0];
        const b = sides[i];

        if (!a || !b) continue;

        relationLines.push(
          `\t${a.model} ${getCardinality({
            isList: a.isList,
            isRequired: a.isRequired,
          })}--${getCardinality({
            isList: b.isList,
            isRequired: b.isRequired,
          })} ${b.model} : ${relName}`
        );
      }
    }
  }

  return relationLines;
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

  const schemaModels = dmmf.datamodel.models;
  const schemaEnums = dmmf.datamodel.enums;

  const mermaidLines: string[] = [
    "%% --------------------------------------------",
    "%% Auto-generated Mermaid ER Diagram. Do Not Edit Directly.",
    "%% --------------------------------------------\n",
    "erDiagram",
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
