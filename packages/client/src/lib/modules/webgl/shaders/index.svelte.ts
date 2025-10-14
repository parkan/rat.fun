import { ShaderManager } from "./ShaderManager.svelte"

// Re-export all shaders from their respective folders
import { copy } from "./copy"
import { noise } from "./noise"
import { plasma } from "./plasma"
import { plasmaOptimized } from "./plasma-optimized"
import { clouds } from "./clouds"
import { colorCyclingPlasma } from "./color-cycling-plasma"
import { vortex } from "./vortex"

const shaders = {
  copy,
  noise,
  plasma,
  plasmaOptimized,
  clouds,
  colorCyclingPlasma,
  vortex
}

/**
 * Generic shader state manager that can work with any shader configuration
 */

/**
 * Factory function for creating shader managers
 */
function createShaderManager() {
  return new ShaderManager()
}

export {
  // Consts
  shaders,
  // Classes
  ShaderManager,
  // Functions
  createShaderManager
}

export const shaderManager = $state(createShaderManager())
