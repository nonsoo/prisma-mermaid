export type GenerateDiagramOptions = {
  isGenerator: boolean;
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
export type ERDCardinality = "||" | "}o" | "|o" | "}|" | "}{";

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
