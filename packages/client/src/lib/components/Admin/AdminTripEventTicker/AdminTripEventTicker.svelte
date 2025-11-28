<script lang="ts">
  import { TRIP_EVENT_TYPE } from "$lib/components/Admin/enums"
  import { SignedNumber } from "$lib/components/Shared"
  let { event, previousEnabled, nextEnabled, previous, next } = $props()
</script>

<div class="admin-trip-event-ticker">
  <div class="buttons">
    <button onclick={next} disabled={!nextEnabled}>
      {"<"}
    </button>
    <button onclick={previous} disabled={!previousEnabled}>
      {">"}
    </button>
  </div>
  <div class="title">
    {#if event.eventType === TRIP_EVENT_TYPE.VISIT}
      <span class="summary">Flashback:</span>
      <span class="summary">
        {event.meta.playerName} sent {event.meta.ratName}
      </span>
    {:else if event.eventType === TRIP_EVENT_TYPE.DEATH}
      <span class="summary">Flashback:</span>
      <span class="summary">
        {event.meta.playerName} let {event.meta.ratName} die
      </span>
    {/if}
  </div>
  {#if event.eventType === TRIP_EVENT_TYPE.DEATH || event.eventType === TRIP_EVENT_TYPE.VISIT}
    <SignedNumber value={event.valueChange} />
  {/if}
</div>

<style lang="scss">
  .admin-trip-event-ticker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: black;
    text-align: left;
    padding: var(--trip-item-padding);
    font-size: var(--font-size-small);
  }
</style>
