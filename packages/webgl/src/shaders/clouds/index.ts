import type { ShaderSource } from "../../types"
import vertexShader from "./vertex.glsl"
import fragmentShader from "./fragment.glsl"

export const clouds: ShaderSource = {
  vertex: vertexShader,
  fragment: fragmentShader
}
