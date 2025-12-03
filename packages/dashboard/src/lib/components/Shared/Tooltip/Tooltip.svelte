<script lang="ts">
  import type { Snippet } from "svelte"
  import { tippy } from "svelte-tippy"
  import type { Props } from "tippy.js"

  let {
    content,
    props = {},
    svg = false,
    children
  }: {
    content?: string
    props?: Partial<Props>
    svg?: boolean
    children: Snippet
  } = $props()

  // Disabled tooltips on mobile
  const tooltipsEnabled = $derived(window.innerWidth >= 700)

  // Cast tippy to accept SVG elements (works at runtime but types don't support it)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let conditionalAction = $derived(content && tooltipsEnabled ? tippy : ((() => {}) as any))
  let tippyOptions = $derived({ content, ...props })
</script>

{#if svg}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <g use:conditionalAction={tippyOptions}>
    {@render children()}
  </g>
{:else}
  <span use:conditionalAction={tippyOptions}>
    {@render children()}
  </span>
{/if}

<style lang="scss">
  span,
  g {
    width: 100%;
    height: 100%;
  }
</style>
