<script lang="ts">
  import { player, playerInventory } from "@modules/state/base/stores"
  import { transferBalanceToRat } from "@modules/action"
  import { waitForCompletion } from "@modules/action/actionSequencer/utils"

  import Inventory from "@components/Nest/Inventory/Inventory.svelte"

  let busy = false

  async function sendTransferBalanceToRat() {
    busy = true
    const action = transferBalanceToRat(100)
    try {
      await waitForCompletion(action)
    } catch (e) {
      console.error(e)
    } finally {
      busy = false
    }
  }
</script>

<!-- PLAYER STATS -->
{#if $player}
  <div class="player-stats">
    <!-- RAT KEEPER ADDRESS -->
    <div class="stat-item">
      <div class="inner-wrapper rat-keeper">
        <div class="label">Operator:</div>
        <div class="value">{$player.name}</div>
      </div>
    </div>
    <!-- RAT KEEPER BALANCE -->
    <div class="stat-item">
      <div class="inner-wrapper balance">
        <div class="label">Balance:</div>
        <div class="value">${$player?.balance ?? 0}</div>
      </div>
      {#if $player?.balance >= 100}
        <div class="action">
          <button disabled={busy} on:click={sendTransferBalanceToRat}>
            Send $100 to rat balance
          </button>
        </div>
      {/if}
    </div>
    <!-- PLAYER INVENTORY -->
    <div class="stat-item">
      <Inventory inventory={$playerInventory} itemKeys={$player.inventory} />
    </div>
  </div>
{/if}

<style lang="scss">
  .player-stats {
    position: fixed;
    top: 20px;
    right: 20px;
    padding-bottom: 10px;
    margin-bottom: 20px;
    width: 200px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .stat-item {
    margin-bottom: 10px;
    display: flex;

    .label {
      margin-right: 0.5em;
    }

    .inner-wrapper {
      display: inline-flex;
      padding: 5px;

      &.balance {
        background: var(--color-value);
        color: var(--black);
      }

      &.rat-keeper {
        background: var(--color-alert);
        color: var(--black);
      }
    }
  }

  .action {
    button {
      padding: 5px;
      color: var(--black);
      cursor: pointer;
      margin-left: 20px;
    }
  }
</style>
