<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { fade } from "svelte/transition"
  import { createWebGLRenderer } from "$lib/modules/webgl"
  import { shaders } from "$lib/modules/webgl/shaders"
  import { page } from "$app/state"

  let canvas: HTMLCanvasElement
  let renderer: any

  function setShaderMode(mode: "admin" | "home" | "outcome") {
    if (renderer) {
      renderer.setUniform("u_invert", mode === "admin" || mode === "outcome", "bool")
      renderer.setUniform("u_saturation", mode === "outcome" ? 0.2 : 1, "float")
    }
  }

  const getShaderMode = (url: URL) => {
    if (url.pathname.includes("/admin")) {
      setShaderMode("admin")
    } else if (url.pathname.includes("enter")) {
      setShaderMode("outcome")
    } else {
      setShaderMode("home")
    }
  }

  // Debounced resize handler
  let resizeTimeout: ReturnType<typeof setTimeout>

  const handleResize = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      if (renderer) {
        renderer.resize()
      }
    }, 100) // Debounce resize events
  }

  $effect(() => {
    getShaderMode(page.url)
  })

  onMount(() => {
    if (!canvas) return

    renderer = createWebGLRenderer(canvas, {
      shader: shaders.clouds,
      uniforms: {
        u_invert: { type: "bool", value: false },
        u_saturation: { type: "float", value: 1.0 }
      }
    })

    getShaderMode(page.url)

    renderer.render()

    // Add debounced resize listener
    window.addEventListener("resize", handleResize)
  })

  onDestroy(() => {
    if (renderer) {
      renderer.destroy()
    }

    // Clean up event listeners and intervals
    window.removeEventListener("resize", handleResize)
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
  })
</script>

<div class="shader-test" in:fade>
  <canvas bind:this={canvas}></canvas>
</div>

<style lang="scss">
  .shader-test {
    text-align: center;
    color: var(--white);
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
</style>
