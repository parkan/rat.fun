<script lang="ts">
  import { removeItemFromLoadOut } from "@svelte/modules/action"
  import { waitForCompletion } from "@modules/action/actionSequencer/utils"
  import { playSound } from "@modules/sound"

  export let key: string
  export let item: Item

  let busy = false

  async function sendRemoveItemFromLoadOut() {
    console.log("sendRemoveItemFromInventory", key, item)
    playSound("tcm", "selectionEnter")
    busy = true
    const action = removeItemFromLoadOut(key)
    try {
      await waitForCompletion(action)
    } catch (e) {
      console.error(e)
    } finally {
      busy = false
    }
  }
</script>

<button class="item" disabled={busy} on:click={sendRemoveItemFromLoadOut}>
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
    margin-right: 10px;
    text-transform: uppercase;

    .text {
      position: relative;
      top: 2px;
    }
  }
</style>
