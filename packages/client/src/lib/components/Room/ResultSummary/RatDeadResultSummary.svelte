<script lang="ts">
  import { fade } from "svelte/transition"
  import { frozenRat } from "$lib/components/Room/Trip/state.svelte"
  import { goto } from "$app/navigation"
  import { BigButton } from "$lib/components/Shared"
</script>

<div transition:fade|global class="summary">
  <div class="event">
    <h1>
      {$frozenRat?.name} DIED
    </h1>
  </div>
  <div class="button-container">
    <BigButton
      text="COME DOWN"
      onclick={() => {
        goto("/")
      }}
    />
  </div>
</div>

<style lang="scss">
  .summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    position: relative;
    bottom: 0;
    height: 100px;
    width: var(--game-window-width);
    background: var(--background-semi-transparent);

    .event {
      background: var(--color-death);
      margin: 0;
      padding: 0;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .button-container {
      width: 100%;
      height: 80px;
    }
  }
</style>
