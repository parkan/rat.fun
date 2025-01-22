<script lang="ts">
  import { addItemToLoadOut } from "@svelte/modules/action"
  import { waitForCompletion } from "@modules/action/actionSequencer/utils"
  import { playSound } from "@modules/sound"
  // import { NewItem } from "@components/Nest/types"

  type NewItem = {
    name: string
    value: number
  }

  export let key: string = ""
  export let item: Item | NewItem

  let busy = false

  async function sendAddItemToLoadOut() {
    console.log("sendAddItemToLoadOut", key, item)
    playSound("tcm", "selectionEnter")
    busy = true
    const action = addItemToLoadOut(key)
    try {
      await waitForCompletion(action)
    } catch (e) {
      console.error(e)
    } finally {
      busy = false
    }
  }
</script>

<button class="item" disabled={busy} on:click={sendAddItemToLoadOut}>
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
