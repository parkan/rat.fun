<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"
  import { spawn } from "@modules/action"
  import { waitForCompletion } from "@modules/action/actionSequencer/utils"
  import { playSound } from "@modules/sound"
  import { player } from "@modules/state/base/stores"
  import { ENTITY_TYPE } from "contracts/enums"

  import Spinner from "@components/Spinner/Spinner.svelte"

  const dispatch = createEventDispatcher()

  const done = () => dispatch("done")

  let busy = false

  async function sendSpawn() {
    playSound("tcm", "blink")
    busy = true
    const action = spawn("alice")
    try {
      await waitForCompletion(action)
      done()
    } catch (e) {
      console.error(e)
    } finally {
      busy = false
    }
  }

  onMount(() => {
    if ($player?.entityType === ENTITY_TYPE.PLAYER) {
      done()
    }
  })
</script>

<div class="main">
  <div class="title">RESEARCH FACILITY</div>
  <button class:busy on:click={sendSpawn}>
    <span class="button-text">ENTER</span>
    {#if busy}
      <div class="spinner"><Spinner /></div>
    {/if}
  </button>
</div>

<style lang="scss">
  .main {
    text-align: center;
    padding-inline: 20px;
    background: var(--color-grey-mid);
    color: var(--white);
    width: 50%;
  }

  .title {
    font-size: var(--font-size-large);
    margin-top: 20px;
    margin-bottom: 20px;
  }

  button {
    padding: 20px;
    font-size: var(--font-size-large);
    width: 100%;
    background: var(--color-alert);
    margin-bottom: 20px;

    .spinner {
      position: relative;
      top: 2px;
      display: none;
    }

    &.busy {
      background: var(--color-alert);
      pointer-events: none;
      cursor: default;
      background: var(--color-grey-light);

      .spinner {
        display: block;
      }

      .button-text {
        display: none;
      }
    }
  }
</style>
