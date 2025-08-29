import { ShaderConfiguration, ShaderManager, ShaderModeConfig } from "./ShaderManager.svelte"

// Re-export all shaders from their respective folders
import { main, type ShaderMode as MainMode } from "./main"
import { noise, type ShaderMode as NoiseMode } from "./noise"
import { gradient } from "./gradient"
import { waves } from "./waves"
import { plasma } from "./plasma"
import { plasmaHue } from "./plasma-hue"
import { plasmaOptimized } from "./plasma-optimized"
import { clouds } from "./clouds"
import { zoomTunnel } from "./zoom-tunnel"
import { spiralVortex } from "./spiral-vortex"
import { colorCyclingPlasma } from "./color-cycling-plasma"
import { checkerZoomer } from "./checker-zoomer"
import { lissajousWarpField } from "./lissajous-warp-field"
import { kaleidoscopeTunnel } from "./kaleidoscope-tunnel"

const shaders = {
  main,
  noise,
  gradient,
  waves,
  plasma,
  plasmaOptimized,
  plasmaHue,
  clouds,
  zoomTunnel,
  spiralVortex,
  colorCyclingPlasma,
  checkerZoomer,
  lissajousWarpField,
  kaleidoscopeTunnel
}

/**
 * Generic shader state manager that can work with any shader configuration
 */

/**
 * Factory function for creating shader managers with configuration
 */
function createShaderManager<TMode extends string = string>(config: ShaderConfiguration<TMode>) {
  return new ShaderManager(config)
}

/**
 * Helper function to create mode configurations
 */
function defineShaderModes<TMode extends string>(
  modes: ShaderModeConfig<TMode>
): ShaderModeConfig<TMode> {
  return modes
}

type ShaderModes = {
  Main: MainMode
  Noise: NoiseMode
}

export {
  // Types
  type ShaderConfiguration,
  type ShaderModes,
  // Consts
  shaders,
  // Classes
  ShaderManager,
  // Functions
  createShaderManager,
  defineShaderModes
}
