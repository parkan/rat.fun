<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"
  import { spawn } from "@svelte/modules/action"
  import { waitForCompletion } from "@svelte/modules/action/actionSequencer/utils"
  import { playSound } from "@svelte/modules/sound"
  import { player } from "@svelte/modules/state/base/stores"
  import { ENTITY_TYPE } from "contracts/enums"

  import Spinner from "@components/Spinner/Spinner.svelte"

  const dispatch = createEventDispatcher()

  const done = () => dispatch("done")

  // $: console.log("$player", $player)

  let busy = false

  async function sendSpawn() {
    playSound("tcm", "blink")
    busy = true
    const action = spawn()
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
  <div>
    <button disabled={busy} on:click={sendSpawn}>Adopt rat</button>
  </div>
  {#if busy}
    <Spinner />
  {/if}
</div>

<style lang="scss">
  .main {
    text-align: center;
    padding: 10px;
    background: rgb(88, 88, 88);
    color: white;
    width: 100%;
  }

  button {
    padding: 20px;
    margin-top: 20px;
    font-size: 24px;
    width: 100%;
    cursor: pointer;

    &:hover {
      background: green;
    }
  }
</style>
