import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/lib/PrismaMermaidGenerators/bin.ts"],
  outDir: "build",
  dts: true,
  clean: true,
  platform: "node",
  target: "node22",
  format: ["esm", "cjs"],
  alias: {
    "@": "./src",
  },
});
