import type {
  GenerateCardinalityOptions,
  GenerateRelationshipOptions,
} from "@/utils/types/generators.type.ts";

const generateCardinality = ({
  isList,
  isRequired,
}: GenerateCardinalityOptions) => {
  if (isList) {
    // shows many relationship
    return "}|";
  }

  // shows one or zero-one relationship
  return isRequired ? "||" : "o|";
};

export const getKeyConstraints = (
  isId: boolean,
  fieldName: string,
  foreignKeys: Set<string>,
  nativeTypes?: readonly [string, readonly string[]] | null
) => {
  if (isId) return "PK";

  if (nativeTypes) {
    const allNativeTypes = nativeTypes.flatMap((nativeType) => nativeType);

    if (!isId && allNativeTypes.includes("UniqueIdentifier")) {
      return "FK";
    }
  }

  if (!isId && foreignKeys.has(fieldName)) return "FK";

  return "";
};

export const getOptionalitySymbol = (isRequired: boolean) => {
  return isRequired ? "" : `"?"`;
};

export const generateRelationships = ({
  relationships,
}: GenerateRelationshipOptions) => {
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
        `\t${a.model} ${generateCardinality({
          isList: a.isList,
          isRequired: a.isRequired,
        })}--${generateCardinality({ isList: false, isRequired: true })} ${
          a.fieldType
        } : ${relName}`
      );
    } else if (sides.length === 2) {
      const a = sides[0];
      const b = sides[1];

      if (!a || !b) continue;

      relationLines.push(
        `\t${a.model} ${generateCardinality({
          isList: a.isList,
          isRequired: a.isRequired,
        })}--${generateCardinality({
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
          `\t${a.model} ${generateCardinality({
            isList: a.isList,
            isRequired: a.isRequired,
          })}--${generateCardinality({
            isList: b.isList,
            isRequired: b.isRequired,
          })} ${b.model} : ${relName}`
        );
      }
    }
  }

  return relationLines;
};

/**
 * Ensures that the foreign key ident is placed in the correct position for the foreign key field regardless of where the
 * FK field occurs within the model of the schema
 */
export const validateForeignKeys = ({
  foreignKeys,
  foreignKeyLocation,
  mermaidLines,
}: {
  foreignKeys: Set<string>;
  foreignKeyLocation: Map<string, number>;
  mermaidLines: Array<string>;
}) => {
  if (foreignKeys.size > 0) {
    for (const key of foreignKeys) {
      const keyIndexMermaidLines = foreignKeyLocation.get(key);

      if (!keyIndexMermaidLines) continue;

      const currentLine = mermaidLines[keyIndexMermaidLines];

      if (!currentLine) continue;

      const lineArray = currentLine.split(" ");

      lineArray[2] = "FK";

      const finalLine = lineArray.join(" ");

      mermaidLines[keyIndexMermaidLines] = finalLine;
    }
  }
};
