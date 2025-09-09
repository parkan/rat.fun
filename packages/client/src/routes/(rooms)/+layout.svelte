<script lang="ts">
  import "../../app.css"
  import "tippy.js/dist/tippy.css"
  import type { LayoutProps } from "./$types"
  import { onMount } from "svelte"
  import { initSound } from "$lib/modules/sound"
  import { MainLayout } from "$lib/components/Shared"

  let { children, data }: LayoutProps = $props()

  const { environment } = data

  let initingSound = $state(false)

  // Enable audio on first user interaction
  const enableAudio = async () => {
    if (initingSound) return false

    initingSound = true

    console.log("init sound called")
    await initSound()

    document.removeEventListener("click", enableAudio)
    document.removeEventListener("touchstart", enableAudio)
    document.removeEventListener("keydown", enableAudio)
    console.log("event listeners were removed")
  }

  onMount(async () => {
    // Remove preloader
    document.querySelector(".preloader")?.remove()

    document.addEventListener("click", enableAudio)
    document.addEventListener("touchstart", enableAudio)
    document.addEventListener("keydown", enableAudio)
  })
</script>

<MainLayout {environment}>
  {@render children?.()}
</MainLayout>
