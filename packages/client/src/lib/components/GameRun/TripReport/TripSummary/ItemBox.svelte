<script lang="ts">
  import type { EnterTripReturnValue } from "@server/modules/types"
  import { gsap } from "gsap"

  let {
    result,
    onTimeline
  }: {
    result: EnterTripReturnValue
    onTimeline?: (timeline: ReturnType<typeof gsap.timeline>, offset: number | string) => void
  } = $props()

  let itemsElement = $state<HTMLDivElement | null>(null)

  const empty = $derived(result.itemChanges?.length === 0)

  // Create timeline
  const timeline = gsap.timeline()

  const prepare = () => {
    gsap.set(itemsElement, { opacity: 0 })
  }

  const main = () => {
    timeline.to(itemsElement, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    })
  }

  const done = () => {
    if (timeline && onTimeline) {
      onTimeline(timeline, 0)
    }
  }

  const run = () => {
    prepare()
    main()
    done()
  }

  $effect(() => {
    if (itemsElement) {
      run()
    }
  })
</script>

<!-- ITEMS -->
<div class="items" bind:this={itemsElement} class:empty>
  {#each result.itemChanges as itemChange}
    {itemChange.type}:{itemChange.name}:{itemChange.type === "add" ? "+" : "-"}{itemChange.value}
  {/each}
</div>

<style lang="scss">
  .items {
    border: 1px solid white;
    border-bottom: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 80px;

    &.empty {
      display: none;
    }
  }
</style>
