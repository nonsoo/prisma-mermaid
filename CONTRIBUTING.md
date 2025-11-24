# Contributing to prisma-mermaid

Thank you for your interest in contributing! 🎉

We welcome improvements, bug fixes, documentation updates, and new ideas that help make prisma-mermaid better for everyone. This guide explains how to set up the project, contribute changes, follow coding standards, and submit pull requests.

## Development Setup

Clone repository

```bash
git clone https://github.com/<your-org>/prisma-mermaid.git
cd prisma-mermaid
```

Install Dependencies, Build the library, Run type-checking, and run Tests

```bash
npm install

npm run build

npm run test

npm run test
```

## Testing Changes to the Prisma Generator

To test how the generator behaves inside a real Prisma project:

1. Create a local example project (or use an existing one).
2. Link the library for local development by running `npm link` within the local workspace for prisma-mermaid and then `npm link @nonsoo/prisma-generate` within your example/test project.
3. Run `npx prisma generate` within your test project and verify that `.mmd` diagrams are created in the configured output folder.
