<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { playSound } from "$lib/modules/sound"

  let { soundOn = false }: { soundOn?: boolean } = $props()

  let spinnerChars = ["/", "-", "\\", "|"]
  let currentIndex = $state(0)
  let interval: ReturnType<typeof setInterval>

  onMount(() => {
    interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % spinnerChars.length
      if (soundOn) {
        playSound("ratfunUI", "tick")
      }
    }, 100)
  })

  onDestroy(() => {
    if (interval) clearInterval(interval)
  })
</script>

<span class="spinner">{spinnerChars[currentIndex]}</span>

<style>
  .spinner {
    display: inline-block;
    font-family: monospace;
  }
</style>
