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
  nativeTypes?: readonly [string, readonly string[]] | null
) => {
  if (isId) return "PK";

  if (nativeTypes) {
    const allNativeTypes = nativeTypes.flatMap((nativeType) => nativeType);

    if (!isId && allNativeTypes.includes("UniqueIdentifier")) return "FK";
  }

  return "";
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
