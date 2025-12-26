import { defineConfig } from "tsup"

export default defineConfig(() => ({
  target: "esnext",
  format: ["esm"],
  sourcemap: true,
  dts: true,
  clean: true,
  entry: {
    index: "./src/index.ts"
  }
}))
