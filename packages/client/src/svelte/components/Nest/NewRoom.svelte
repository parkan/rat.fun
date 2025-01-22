<script lang="ts">
  import { createRoom } from "@modules/action"
  import { waitForCompletion } from "@modules/action/actionSequencer/utils"
  import { player } from "@modules/state/base/stores"

  let busy = false
  let newPrompt: string

  async function sendCreateRoom() {
    busy = true
    const action = createRoom(newPrompt)
    try {
      await waitForCompletion(action)
    } catch (e) {
      console.error(e)
    } finally {
      busy = false
      newPrompt = ""
    }
  }
</script>

<div class="create-room">
  <textarea rows="5" placeholder="Room prompt" bind:value={newPrompt}
  ></textarea>
  <button disabled={busy || $player.balance < 100} on:click={sendCreateRoom}>
    Create room (Cost: $100)
  </button>
</div>

<style lang="scss">
  .create-room {
    width: 100%;
    padding: 10px;
    background: var(--color-grey-mid);

    textarea {
      width: 100%;
      padding: 5px;
      background: var(--color-grey-light);
      font-family: var(--typewrite-stack);
      outline-color: var(--color-alert);
      border-radius: 0;
      font-size: var(--font-size-normal);
      border: none;
    }

    button {
      padding: 10px;
      margin-top: 10px;
      cursor: pointer;
      font-size: var(--font-size-normal);
      background: var(--color-secondary);

      &:active {
        background: var(--color-alert);
      }
    }
  }
</style>
