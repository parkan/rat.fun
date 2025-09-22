import vertexShader from "./vertex.glsl"
import fragmentShader from "./fragment.glsl"
import { type ShaderConfiguration } from "$lib/modules/webgl/shaders/index.svelte"

export type ShaderMode = "normal"

export const shaderConfig: ShaderConfiguration<ShaderMode> = {
  initialMode: "normal",
  modes: {
    normal: {}
  },
  tweens: {}
}

export const blank = {
  vertex: vertexShader,
  fragment: fragmentShader,
  config: shaderConfig
}
