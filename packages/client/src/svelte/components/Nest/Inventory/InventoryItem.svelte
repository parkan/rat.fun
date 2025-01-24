<script lang="ts">
  import { transferItemToLoadOut } from "@svelte/modules/action"
  import { waitForCompletion } from "@modules/action/actionSequencer/utils"
  import { playSound } from "@modules/sound"
  import type { ItemChange } from "../types"

  export let key: string = ""
  export let item: Item | ItemChange

  let busy = false

  async function sendTransferItemToLoadOut() {
    playSound("tcm", "selectionEnter")
    busy = true
    const action = transferItemToLoadOut(key)
    try {
      await waitForCompletion(action)
    } catch (e) {
      console.error(e)
    } finally {
      busy = false
    }
  }
</script>

<button class="item" disabled={busy} on:click={sendTransferItemToLoadOut}>
  <div class="text">{item.name} (${item.value})</div>
</button>

<style lang="scss">
  .item {
    border: none;
    font-size: var(--font-size-normal);
    padding: 10px;
    background: var(--color-item);
    display: inline-block;
    cursor: pointer;
    margin-right: 5px;
    margin-bottom: 5px;
    text-transform: uppercase;

    .text {
      position: relative;
      top: 2px;
    }
  }
</style>
