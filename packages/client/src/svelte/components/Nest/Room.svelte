<script lang="ts">
  import { fade } from "svelte/transition"
  import { createEventDispatcher } from "svelte"

  export let outcome: { eventLog: string[]; success: boolean }
  export let room: Room

  const dispatch = createEventDispatcher()

  function close() {
    dispatch("close")
  }
</script>

<div class="room">
  <!-- DESCRIPTION -->
  <div class="description">
    {room.roomPrompt}
  </div>

  <!-- LOG -->
  <div class="log">
    {#each outcome.eventLog as event, i}
      <div class="event" in:fade={{ duration: 200, delay: 500 * i }}>
        {event}
      </div>
    {/each}
  </div>

  <!-- OUTCOME -->
  {#if outcome.eventLog?.length ?? 0 > 0}
    <div
      class="outcome"
      in:fade={{ duration: 200, delay: 500 * outcome.eventLog.length + 1 }}
    >
      {#if outcome.success}
        <div class="success">Success (+50 currency)</div>
      {:else}
        <div class="failure">Failure (-50 currency)</div>
      {/if}
      <div class="return">
        <button on:click={close}>Return to nest</button>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .room {
    font-family: "courier new", monospace;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    color: white;
    z-index: 10000;
    padding: 40px;
    font-size: 34px;

    .description {
      font-size: 24px;
      margin-bottom: 20px;
      background: yellow;
      color: black;
      max-width: 800px;
    }

    .log {
      margin-bottom: 20px;
    }

    .outcome {
      max-width: 800px;
    }

    .success {
      background: green;
    }

    .failure {
      color: red;
    }

    button {
      width: 50%;
      padding: 40px;
      font-size: 32px;
      margin-top: 20px;
      cursor: pointer;
    }
  }
</style>
