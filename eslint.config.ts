import js from "@eslint/js";
import globals from "globals";
import tseslint, { parser } from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";

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
    "vitest.config.mts",
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
          newlinesBetween: "always",
          maxLineLength: undefined,
          groups: [
            "type",
            "internal-type",
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
            "style",
            "object",
            "unknown",
          ],
          customGroups: { type: {}, value: {} },
          environment: "node",
          tsconfigRootDir: ".",
        },
      ],
    },
  },
  tseslint.configs.recommended,
]);
