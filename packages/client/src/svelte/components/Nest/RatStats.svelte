<script lang="ts">
  import { rat, ratInventory } from "@modules/state/base/stores"
  import { UI } from "@modules/ui/enums"
  import { UIState } from "@modules/ui/stores"
  import {
    transferBalanceToPlayer,
    // transferBalanceToRat,
    // levelUp,
  } from "@modules/action"
  import { waitForCompletion } from "@modules/action/actionSequencer/utils"

  import Inventory from "@components/Nest/Inventory/Inventory.svelte"
  import Traits from "@components/Nest/Traits/Traits.svelte"

  let busy = false

  async function sendTransferBalanceToPlayer() {
    busy = true
    const action = transferBalanceToPlayer(100)
    try {
      await waitForCompletion(action)
    } catch (e) {
      console.error(e)
    } finally {
      busy = false
    }
  }

  //   async function sendTransferBalanceToRat() {
  //     busy = true
  //     const action = transferBalanceToRat(100)
  //     try {
  //       await waitForCompletion(action)
  //     } catch (e) {
  //       console.error(e)
  //     } finally {
  //       busy = false
  //     }
  //   }

  //   async function sendLevelUp() {
  //     busy = true
  //     const action = levelUp()
  //     try {
  //       await waitForCompletion(action)
  //     } catch (e) {
  //       console.error(e)
  //     } finally {
  //       busy = false
  //     }
  //   }

  function restart() {
    UIState.set(UI.CREATING_RAT)
  }
</script>

<!-- RAT STATS -->
{#if $rat}
  <div class="rat-stats">
    <!-- RAT -->
    <div class="stat-item">
      <div class="inner-wrapper rat">
        <div class="label">{$rat.name}</div>
      </div>
    </div>
    <!-- RAT ID-->
    <!-- <div class="stat-item">
            <div class="inner-wrapper">
              <div class="label">ID: {shortenAddress($player.ownedRat)}</div>
            </div>
          </div> -->
    <!-- Wating in room -->
    <!-- {#if $rat.waitingInRoom && $rat.waitingInRoom !== EMPTY_CONNECTION}
            <div class="stat-item">
              <div class="inner-wrapper rat">
                <div class="label">Waiting in room</div>
                <div class="value">{shortenAddress($rat.waitingInRoom)}</div>
              </div>
            </div>
          {/if} -->
    <!-- LEVEL-->
    <!-- <div class="stat-item">
            <div class="inner-wrapper rat">
              <div class="label">Level:</div>
              <div class="value">{$ratLevel?.index ?? 0}</div>
              <div class="action">
                <button
                  disabled={busy || $rat.balance < ($ratLevel?.levelUpCost ?? 0)}
                  on:click={sendLevelUp}
                >
                  Level up (costs ${$ratLevel?.levelUpCost ?? 0})
                </button>
              </div>
            </div>
          </div> -->
    <!-- HEALTH -->
    <div class="stat-item">
      <div class="inner-wrapper health">
        <div class="label">Health:</div>
        <div class="value">{$rat?.health ?? 0}</div>
      </div>
    </div>
    <!-- RAT BALANCE -->
    <div class="stat-item">
      <div class="inner-wrapper balance">
        <div class="label">Balance:</div>
        <div class="value">${$rat?.balance ?? 0}</div>
      </div>
      {#if $rat?.balance >= 100}
        <div class="action">
          <button disabled={busy} on:click={sendTransferBalanceToPlayer}>
            Send $100 to player balance
          </button>
        </div>
      {/if}
    </div>
    <!-- RAT TOTAL VALUE -->
    <!-- <div class="stat-item">
            <div class="inner-wrapper">
              <div class="label">Total value:</div>
              <div class="value">${$ratTotalValue ?? 0}</div>
            </div>
          </div> -->
    {#if !$rat?.dead}
      <!-- TRAITS -->
      <Traits />
      <!-- RAT INVENTORY -->
      <div class="stat-item">
        <Inventory isRat inventory={$ratInventory} itemKeys={$rat.inventory} />
      </div>
    {:else}
      <div class="stat-item">
        <div class="inner-wrapper dead">
          <div class="label">RAT IS DEAD</div>
        </div>
      </div>
      <div class="restart">
        <button on:click={restart}>Get new rat</button>
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .restart {
    button {
      padding: 10px;
      background: var(--color-alert);
      font-size: var(--font-size-normal);
      cursor: pointer;
    }
  }

  .rat-stats {
    position: fixed;
    top: 20px;
    left: 20px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    width: 600px;
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

      &.rat {
        color: var(--white);
        font-size: 64px;
      }

      &.health {
        background: var(--color-health);
        color: var(--black);
      }

      &.dead {
        background: var(--color-death);
        color: var(--white);
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
