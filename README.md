# Prisma to Mermaid Generator

Generate Mermaid class diagrams and Mermaid ERD diagrams directly from your Prisma schema. This package exposes a Prisma generator that runs during `prisma generate` as well as two helpers functions -- generateMermaidClass and generateMermaidERD.

## Installation

```bash
npm i --save-dev @nonsoo/prisma-mermaid @mermaid-js/mermaid-cli
```

## Usage (Prisma Generator)

Add the following generator to your prisma schema and run `npx prisma generate` in your terminal.

```prisma
generator diagram {
  provider = "prisma-mermaid"
  output   = "../src/generated/diagrams"
  format   = "mermaid-erd"
}
```

Once Mermaid files `.mmd` are generated you can use the mermaid cli to render the file as an SVG, PNG, embed it in Markdown, etc.

Run the the following command to generate SVG

```bash
npx mmdc -i <path/input-file>.mmd -o <path/output-file>.svg
```

### Format options

| Format Value  | Description                       |
| ------------- | --------------------------------- |
| mermaid-erd   | Generates a Mermaid ERD diagram   |
| mermaid-class | Generates a Mermaid class diagram |

### Disabling the Diagram Generator (Useful for CI)

Set the following environment variable in your .env:

```bash
PRISMA_DIAGRAM_GENERATOR_DISABLE=true
```

## Usage (Internal Functions)

You can also call the underlying functions directly if you want to generate diagrams outside of the Prisma CLI.

```js
import {
  generateMermaidClass,
  generateMermaidERD,
} from "@nonsoo/prisma-mermaid";

await generateMermaidClass({
  schemaPath: "./prisma/schema.prisma",
  output: "./diagrams/classDiagram.mmd",
});

await generateMermaidERD({
  schemaPath: "./prisma/schema.prisma",
  output: "./diagrams/erdDiagram.mmd",
});
```

## Purpose

Documentation should evolve alongside the code it describes. Diagrams-as-code tools such as Mermaid make it easier for teams to maintain clear, accurate diagrams as their systems grow and change. However, creating these diagrams manually — especially for database schemas — still introduces friction and the risk of diagrams falling out of sync with the system.

Prisma already provides a single source of truth for your data model through the Prisma schema. Therefore, by generating diagrams directly from the schema, we can ensure documentation stays automatically aligned with the current state of the database models.

This library bridges that gap. It transforms your Prisma schema into a Mermaid ERD or class diagrams, combining code generation with diagrams-as-code. Once generated, these diagrams can be used to create Markdown files, SVGs, PDFs, or any other Mermaid-supported output — always consistent, always up to date.
