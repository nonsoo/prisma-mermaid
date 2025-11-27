import type { DMMF } from "@prisma/generator-helper";

type ConfigTheme =
  | "default"
  | "redux-dark"
  | "forest"
  | "neutral"
  | "mc"
  | "base"
  | "redux"
  | "redux-dark";

type ConfigLook = "classic" | "handDrawn" | "neo";
type ConfigLayout = "dagre" | "elk";

export type MermaidERDiagramConfig = {
  type: Exclude<PrismaGeneratorsKeys, "mermaid-class">;
  config: Partial<{
    theme: ConfigTheme;
    layout: ConfigLayout;
    look: ConfigLook;
    themeVariables: Partial<{
      fontSize: string;
      fontFamily: string;
      padding: string;
      lineHeight: string;
      nodeSpacing: number;
      edgeSpacing: number;
    }>;
    flowchart: Partial<{
      nodeSpacing: number;
      rankSpacing: number;
      htmlLabels: boolean;
    }>;
  }>;
};

export type MermaidClassDiagramConfig = {
  type: Exclude<PrismaGeneratorsKeys, "mermaid-erd">;
  config: Partial<{
    theme: ConfigTheme;
    layout: ConfigLayout;
    look: ConfigLook;
    themeVariables: Partial<{
      fontFamily: string;
      lineHeight: string;
      nodeSpacing: number;
      edgeSpacing: number;
    }>;
    flowchart: Partial<{
      nodeSpacing: number;
      rankSpacing: number;
      htmlLabels: boolean;
    }>;
    class: Partial<{
      hideEmptyMembersBox: boolean;
    }>;
  }>;
};

export type MermaidDiagramConfig =
  | MermaidERDiagramConfig
  | MermaidClassDiagramConfig;

export type GenerateDiagramOptions = {
  generatorPrismaDocument?: DMMF.Document;
  config?: MermaidDiagramConfig;
  schemaPath: string;
  outputPath: string | undefined;
};

export type Relationships = {
  [key: string]: Array<{
    model: string;
    fieldType: string;
    isList: boolean;
    isRequired: boolean;
  }>;
};

export type GenerateRelationshipOptions = {
  relationships: Relationships;
};

export type GenerateCardinalityOptions = {
  isList: boolean;
  isRequired: boolean;
};

export type ClassCardinality = '"*"' | '"1"' | '"0..1"';
export type ERDCardinality = "||" | "}|" | "o|";

// Utility functions types

export type GenerateDiagram = (
  options: GenerateDiagramOptions
) => Promise<string>;

export type GenerateRelationships = (
  options: GenerateRelationshipOptions
) => string[];

export type GenerateCardinality = (
  options: GenerateCardinalityOptions
) => ClassCardinality | ERDCardinality;

export type GenerateDiagramSpacingOptions = {
  models: DMMF.Datamodel["models"];
  baseNode: number;
  baseEdge: number;
};

export type PrismaGeneratorsKeys = "mermaid-erd" | "mermaid-class";
