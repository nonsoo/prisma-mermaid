import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/lib/PrismaMermaidGenerators/bin.ts"],
  outDir: "build",
  splitting: true,
  dts: true,
  clean: true,
  treeshake: true,
  platform: "node",
  target: "node22",
  format: ["esm"],
  esbuildOptions: (options) => {
    options.alias = {
      "@": "./src",
    };
  },
});
