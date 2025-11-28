<script lang="ts">
  import { TRIP_EVENT_TYPE } from "$lib/components/Admin/enums"
  import { makeHref } from "$lib/components/Admin/helpers"
  import { focusEvent, selectedEvent } from "$lib/modules/ui/state.svelte"
  import type { TripEvent } from "$lib/components/Admin/types"
  import { UI_STRINGS } from "$lib/modules/ui/ui-strings"
  import { goto } from "$app/navigation"

  import { tick } from "svelte"

  import AdminEventLogItem from "./AdminEventLogItem.svelte"

  let {
    graphData,
    hideUnlockEvent = false
  }: {
    graphData: TripEvent[]
    hideUnlockEvent?: boolean
  } = $props()

  let scrollContainer = $state<HTMLElement>()
</script>

<div bind:this={scrollContainer} class="admin-event-log">
  {#each graphData as point, index (point.index)}
    <div
      class:selected={$selectedEvent === point.index}
      class:focus={$focusEvent === point.index}
      onclick={() => {
        $selectedEvent = point.index
      }}
      onpointerenter={() => ($focusEvent = point.index)}
      onpointerup={() => {
        console.log("up")
        if (
          point.eventType === TRIP_EVENT_TYPE.DEPLETED ||
          point.eventType === TRIP_EVENT_TYPE.CREATION ||
          point.eventType === TRIP_EVENT_TYPE.LIQUIDATION
        ) {
          goto(makeHref(point))
        }
      }}
      class="log-item"
    >
      <AdminEventLogItem {point} />
    </div>
  {/each}
  {#if !hideUnlockEvent}
    <button class="log-item">{UI_STRINGS.adminUnlockedMessage}</button>
  {/if}
</div>

<style lang="scss">
  .fixed-debug {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 999;
  }
  .admin-event-log {
    background: var(--color-grey-dark);
    height: 100%;
    max-height: 800px;
    overflow-y: scroll;
    flex-flow: column nowrap;
    align-items: start;
    justify-content: flex-start;
    gap: 8px;
    padding: 6px;
    user-select: none;

    .event {
      padding: 0;
      margin: 0;
      color: white;
      display: block;
      margin-bottom: 4px;
      font-size: var(--font-size-small);
    }

    .log-item {
      width: 100%;
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-small);

      &.focus {
        background: black;
      }

      &.selected {
        background: white;
        color: black;
      }
    }
  }
</style>
