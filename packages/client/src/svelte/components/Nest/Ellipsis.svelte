<script>
  import { onMount } from "svelte"

  let dots = Array.from({ length: 10 }, () => ".")
  let activeIndex = 0

  onMount(() => {
    const interval = setInterval(() => {
      activeIndex = (activeIndex + 1) % (dots.length + 1)
    }, 100) // Adjust speed of animation
    return () => clearInterval(interval)
  })
</script>

<div class="ellipsis">
  {dots.slice(0, activeIndex).join("")}
</div>

<style>
  .ellipsis {
    font-size: var(--font-size-normal);
    white-space: pre;
  }
</style>
