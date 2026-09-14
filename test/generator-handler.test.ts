import type { GeneratorOptions } from "@prisma/generator-helper";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  handlers: { current: undefined as unknown },
  erdGenerator: vi.fn(),
  classGenerator: vi.fn(),
  generators: new Map([
    ["mermaid-erd", vi.fn()],
    ["mermaid-class", vi.fn()],
  ]),
}));

vi.mock("@prisma/generator-helper", () => ({
  generatorHandler: (handlers: unknown) => {
    mockState.handlers.current = handlers;
  },
}));

vi.mock("@/lib/PrismaMermaidGenerators/generator.ts", () => ({
  prismaGenerators: mockState.generators,
}));

import "@/lib/PrismaMermaidGenerators/index.ts";

type RegisteredHandlers = {
  onManifest: () => { prettyName: string; version: string };
  onGenerate: (options: GeneratorOptions) => Promise<void>;
};

const getHandlers = () => mockState.handlers.current as RegisteredHandlers;

const createOptions = (format?: string | string[], output = "/tmp/diagrams") =>
  ({
    schemaPath: "schema.prisma",
    dmmf: { datamodel: { models: [], enums: [] } },
    generator: {
      output: { value: output },
      config: format === undefined ? {} : { format },
    },
  }) as unknown as GeneratorOptions;

describe("Prisma generator handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.PRISMA_DIAGRAM_GENERATOR_DISABLE;
  });

  it("exposes the package manifest", () => {
    expect(getHandlers().onManifest()).toMatchObject({
      prettyName: "Mermaid Diagram",
      version: expect.any(String),
    });
  });

  it("uses ERD generation by default", async () => {
    await getHandlers().onGenerate(createOptions());

    expect(mockState.generators.get("mermaid-erd")).toHaveBeenCalledWith({
      schemaPath: "schema.prisma",
      outputPath: "/tmp/diagrams",
      generatorPrismaDocument: { datamodel: { models: [], enums: [] } },
    });
    expect(mockState.generators.get("mermaid-class")).not.toHaveBeenCalled();
  });

  it("selects a single requested format", async () => {
    await getHandlers().onGenerate(createOptions("mermaid-class"));

    expect(mockState.generators.get("mermaid-class")).toHaveBeenCalledTimes(1);
    expect(mockState.generators.get("mermaid-erd")).not.toHaveBeenCalled();
  });

  it("runs each known format when multiple formats are configured", async () => {
    await getHandlers().onGenerate(
      createOptions(["mermaid-class", "unsupported", "mermaid-erd"])
    );

    expect(mockState.generators.get("mermaid-class")).toHaveBeenCalledTimes(1);
    expect(mockState.generators.get("mermaid-erd")).toHaveBeenCalledTimes(1);
  });

  it("does not generate diagrams when disabled", async () => {
    process.env.PRISMA_DIAGRAM_GENERATOR_DISABLE = "true";

    await getHandlers().onGenerate(createOptions("mermaid-class"));

    expect(mockState.generators.get("mermaid-class")).not.toHaveBeenCalled();
    expect(mockState.generators.get("mermaid-erd")).not.toHaveBeenCalled();
  });

  it("ignores an unsupported single format", async () => {
    await getHandlers().onGenerate(createOptions("unsupported"));

    expect(mockState.generators.get("mermaid-class")).not.toHaveBeenCalled();
    expect(mockState.generators.get("mermaid-erd")).not.toHaveBeenCalled();
  });
});
