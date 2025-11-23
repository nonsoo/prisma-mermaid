import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/lib/PrismaMermaidGenerators/bin.ts"],
  outDir: "build",
  splitting: false,
  treeshake: false,
  dts: true,
  clean: true,
  platform: "node",
  target: "node22",
  format: ["esm", "cjs"],
  esbuildOptions: (options) => {
    options.alias = {
      "@": "./src",
    };
  },
});
