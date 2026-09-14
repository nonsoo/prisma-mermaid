import { readFileSync, rmSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { generateMermaidClass, generateMermaidERD } from "@/index.ts";

const schema = `
generator client {
  provider = "prisma-client"
}

enum Role {
  USER
  ADMIN
}

model User {
  id    Int    @id
  name  String
  bio   String?
  role  Role   @default(USER)
  posts Post[] @relation("UserPosts")
}

model Post {
  id     Int  @id
  userId Int
  title  String
  user   User @relation("UserPosts", fields: [userId], references: [id])
}
`;

const temporaryDirectories: string[] = [];

const createSchema = () => {
  const directory = mkdtempSync(path.join(tmpdir(), "prisma-mermaid-"));
  temporaryDirectories.push(directory);

  const schemaPath = path.join(directory, "schema.prisma");
  writeFileSync(schemaPath, schema);

  return { outputPath: path.join(directory, "diagrams"), schemaPath };
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("generateMermaidClass", () => {
  it("writes models, enums, fields, and relationships", async () => {
    const paths = createSchema();
    const outputPath = await generateMermaidClass(paths);
    const diagram = readFileSync(outputPath, "utf8");

    expect(outputPath).toBe(
      path.join(paths.outputPath, "mermaidClassDiagram.mmd")
    );
    expect(diagram).toContain("classDiagram");
    expect(diagram).toContain("class User {");
    expect(diagram).toContain("Int id");
    expect(diagram).toContain("String bio");
    expect(diagram).toContain("<<enumeration>> ADMIN");
    expect(diagram).toContain('User "*" --> "1" Post : UserPosts');
  });

  it("merges a matching custom configuration into the diagram header", async () => {
    const paths = createSchema();
    const outputPath = await generateMermaidClass({
      ...paths,
      config: {
        type: "mermaid-class",
        config: { title: "Domain model", layout: "elk" },
      },
    });
    const diagram = readFileSync(outputPath, "utf8");

    expect(diagram).toContain("title: Domain model");
    expect(diagram).toContain("layout: elk");
  });
});

describe("generateMermaidERD", () => {
  it("writes models, enum values, primary keys, foreign keys, and relationships", async () => {
    const paths = createSchema();
    const outputPath = await generateMermaidERD(paths);
    const diagram = readFileSync(outputPath, "utf8");

    expect(outputPath).toBe(
      path.join(paths.outputPath, "mermaidErdDiagram.mmd")
    );
    expect(diagram).toContain("erDiagram");
    expect(diagram).toContain("Int id PK");
    expect(diagram).toContain('String bio  "?"');
    expect(diagram).toContain("Int userId FK");
    expect(diagram).toContain("ADMIN");
    expect(diagram).toContain("User }|--|| Post : UserPosts");
  });

  it("returns an empty string when the schema cannot be loaded", async () => {
    const paths = createSchema();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      generateMermaidERD({
        ...paths,
        schemaPath: path.join(paths.outputPath, "missing.prisma"),
      })
    ).resolves.toBe("");

    errorSpy.mockRestore();
  });
});
