import type {
  GenerateDiagram,
  PrismaGeneratorsKeys,
} from "@/utils/types/generators.type.ts";

import { generateDiagram as generateMermaidClass } from "@/lib/MermaidClass/prismaMermaidClass.ts";
import { generateDiagram as generateMermaidERD } from "@/lib/MermaidERD/prismaMermaidErd.ts";

const prismaGenerators = new Map<PrismaGeneratorsKeys, GenerateDiagram>([
  ["mermaid-erd", generateMermaidERD],
  ["mermaid-class", generateMermaidClass],
]);

export { generateMermaidClass, generateMermaidERD, prismaGenerators };

export * from "@/utils/types/generators.type.ts";
