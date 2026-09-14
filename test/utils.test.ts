import type { DMMF } from "@prisma/generator-helper";

import { describe, expect, it } from "vitest";

import { generateRelationships as generateClassRelationships } from "@/lib/MermaidClass/utils.ts";
import {
  generateRelationships as generateErdRelationships,
  getKeyConstraints,
  getOptionalitySymbol,
  validateForeignKeys,
} from "@/lib/MermaidERD/utils.ts";
import { generateDiagramSpacing } from "@/utils/mermaid.ts";

const relationship = {
  model: "User",
  fieldType: "Post",
  isList: true,
  isRequired: true,
};

describe("relationship formatting", () => {
  it("formats class cardinalities for one-sided and two-sided relations", () => {
    expect(
      generateClassRelationships({ relationships: { Posts: [relationship] } })
    ).toEqual(['User "*" --> "1" Post : Posts']);
    expect(
      generateClassRelationships({
        relationships: {
          Posts: [
            relationship,
            { ...relationship, model: "Post", isList: false },
          ],
        },
      })
    ).toEqual(['User "*" --> "1" Post : Posts']);
    expect(
      generateClassRelationships({
        relationships: {
          Profile: [
            {
              ...relationship,
              fieldType: "Profile",
              isList: false,
              isRequired: false,
            },
          ],
        },
      })
    ).toEqual(['User "0..1" --> "1" Profile : Profile']);
  });

  it("formats ERD cardinalities and expands relations with more than two sides", () => {
    expect(
      generateErdRelationships({ relationships: { Posts: [relationship] } })
    ).toEqual(["\tUser }|--|| Post : Posts"]);
    expect(
      generateErdRelationships({
        relationships: {
          Profile: [
            {
              ...relationship,
              fieldType: "Profile",
              isList: false,
              isRequired: false,
            },
          ],
        },
      })
    ).toEqual(["\tUser o|--|| Profile : Profile"]);
    expect(
      generateErdRelationships({
        relationships: {
          Posts: [
            relationship,
            { ...relationship, model: "PostA", isList: false },
            { ...relationship, model: "PostB", isList: false },
          ],
        },
      })
    ).toEqual(["\tUser }|--|| PostA : Posts", "\tUser }|--|| PostB : Posts"]);
  });
});

describe("ERD field markers", () => {
  it("distinguishes primary, foreign, and optional fields", () => {
    expect(getKeyConstraints(true, "id", new Set())).toBe("PK");
    expect(getKeyConstraints(false, "userId", new Set(["userId"]))).toBe("FK");
    expect(getKeyConstraints(false, "name", new Set())).toBe("");
    expect(getOptionalitySymbol(true)).toBe("");
    expect(getOptionalitySymbol(false)).toBe('"?"');
  });

  it("moves the foreign-key marker onto a field declared earlier in the model", () => {
    const mermaidLines = ["\tPost {", '\t\tInt userId  "?"', "\t}"];

    validateForeignKeys({
      foreignKeys: new Set(["userId"]),
      foreignKeyLocation: new Map([["userId", 1]]),
      mermaidLines,
    });

    expect(mermaidLines[1]).toBe('\t\tInt userId FK "?"');
  });
});

describe("generateDiagramSpacing", () => {
  it("scales node and edge spacing with models, fields, and relations", () => {
    const models = [
      {
        fields: [
          { name: "id" },
          { name: "posts", relationName: "Posts", relationFromFields: ["id"] },
        ],
      },
      { fields: [{ name: "id" }] },
    ] as unknown as DMMF.Datamodel["models"];

    expect(
      generateDiagramSpacing({
        models,
        baseNode: 100,
        baseEdge: 150,
      })
    ).toEqual({ nodeSpacing: 118, edgeSpacing: 162 });
  });
});
