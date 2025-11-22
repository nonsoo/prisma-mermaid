import type {
  GenerateCardinalityOptions,
  GenerateRelationshipOptions,
} from "@/utils/types/generators.type.ts";

const generateCardinality = ({
  isList,
  isRequired,
}: GenerateCardinalityOptions) => {
  if (isList) return '"*"';
  return isRequired ? '"1"' : '"0..1"';
};

export const generateRelationships = ({
  relationships,
}: GenerateRelationshipOptions) => {
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
        `${a.model} ${generateCardinality({
          isList: a.isList,
          isRequired: a.isRequired,
        })} --> "1" ${a.fieldType} : ${relName}`
      );
    } else if (sides.length === 2) {
      const a = sides[0];
      const b = sides[1];

      if (!a || !b) continue;
      lines.push(
        `${a.model} ${generateCardinality({
          isList: a.isList,
          isRequired: a.isRequired,
        })} --> ${generateCardinality({
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
          `${a.model} ${generateCardinality({
            isList: a.isList,
            isRequired: a.isRequired,
          })} --> ${generateCardinality({
            isList: b.isList,
            isRequired: b.isRequired,
          })} ${b.model} : ${relName}`
        );
      }
    }
  }

  return lines;
};
