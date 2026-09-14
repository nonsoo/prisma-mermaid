import js from "@eslint/js";
import globals from "globals";
import tseslint, { parser } from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig([
  globalIgnores([
    "node_modules",
    "dist",
    "build",
    "coverage",
    "public",
    "scripts",
    "test",
    "tests",
    "tmp",
    "vendor",
    "eslint.config.ts",
    "vitest.config.ts",
    "tsup.config.ts",
  ]),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, perfectionist },
    extends: ["js/recommended", prettierConfig],
    languageOptions: {
      globals: globals.node,
      parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "block-scoped-var": "error",
      "default-case-last": "error",
      eqeqeq: "error",
      "no-alert": "error",
      "no-eval": "error",
      "no-return-assign": "error",
      "no-useless-concat": "error",
      "no-useless-return": "warn",
      "prefer-const": "warn",
      "no-unneeded-ternary": "error",
      "prefer-object-spread": "warn",
      "no-undef-init": "warn",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          types: ["array", "string", "number", "boolean"],
          leadingUnderscore: "allow",
          trailingUnderscore: "forbid",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE"],
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
      ],
      "max-classes-per-file": ["error", 1],
      "no-empty-function": [
        "error",
        {
          allow: ["arrowFunctions", "functions", "methods"],
        },
      ],
      "perfectionist/sort-imports": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          fallbackSort: { type: "unsorted" },
          ignoreCase: true,
          specialCharacters: "keep",
          internalPattern: ["^~/.+"],
          partitionByComment: false,
          partitionByNewLine: false,
          newlinesBetween: 1,
          groups: [
            "type",
            "type-internal",
            "absolute-internal-module-type",
            { group: ["builtin", "external"], type: "alphabetical" },
            "internal",
            "absolute-internal-module",
            { group: ["parent", "sibling", "index"], type: "alphabetical" },
            "style",
            "unknown",
          ],
          customGroups: [
            {
              groupName: "absolute-internal-module-type",
              elementNamePattern: ["^@/.+"],
              selector: "type",
            },
            {
              groupName: "absolute-internal-module",
              elementNamePattern: ["^@/.+"],
            },
          ],
          environment: "node",
        },
      ],
    },
  },
  tseslint.configs.recommended,
]);
