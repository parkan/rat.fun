import type { ShaderSource } from "../../types"
import vertexShader from "./vertex.glsl"
import fragmentShader from "./fragment.glsl"

export const plasmaOptimized: ShaderSource = {
  vertex: vertexShader,
  fragment: fragmentShader
}
