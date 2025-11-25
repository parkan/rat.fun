import { defineConfig } from "tsup"

export default defineConfig(() => ({
  target: "esnext",
  format: ["esm"],
  sourcemap: true,
  dts: false,
  clean: true,
  entry: ["src/index.ts"]
}))
