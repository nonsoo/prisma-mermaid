# Prisma to Mermaid Generator

Generate Mermaid class diagrams and Mermaid ERD diagrams directly from your Prisma schema. This package exposes a Prisma generator that runs during `prisma generate` as well as two programmatic helpers -- generateMermaidClass and generateMermaidERD.

## Installation

```bash
npm i --save-dev @nonsoo/prisma-mermaid @mermaid-js/mermaid-cli
```

## Usage (Prisma Generator)

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

generator diagram {
  provider = "prisma-mermaid"
  output   = "../src/generated/diagrams"
  format   = "mermaid-erd"
}
```

`format` Options

| Value         | Description                       |
| ------------- | --------------------------------- |
| mermaid-erd   | Generates a Mermaid ERD diagram   |
| mermaid-class | Generates a Mermaid class diagram |

### Disabling the Generator (Useful for CI)

Set the following environment variable in your .env:

```bash
PRISMA_DIAGRAM_GENERATOR_DISABLE=true
```

## Usage (Internal Functions)

You can also call the underlying functions directly if you want to generate diagrams outside of Prisma CLI.

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
