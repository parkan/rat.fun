<script lang="ts">
  import { get } from "svelte/store"
  import { player, rat } from "$lib/modules/state/stores"
  import { playSound } from "$lib/modules/sound"
  import { BigButton } from "$lib/components/Shared"
  import { ratState, RAT_BOX_STATE } from "$lib/components/Rat/state.svelte"
  import NFTItem from "$lib/components/Rat/NFTItem/NFTItem.svelte"
  import { exportItemToNFT } from "$lib/modules/on-chain-transactions"
  import { errorHandler } from "$lib/modules/error-handling"
  import { createLogger } from "$lib/modules/logger"
  import { waitForInventoryChange } from "$lib/modules/state/utils"

  const logger = createLogger("[ConfirmExtractNFT]")

  // Get item data from ratState
  let itemId = $derived(ratState.exportItem.itemId)
  let itemName = $derived(ratState.exportItem.itemName)
  let itemValue = $derived(ratState.exportItem.itemValue)

  // Get current rat ID
  let ratId = $derived($player?.currentRat as string | undefined)

  let isExtracting = $state(false)

  const onClickConfirm = async () => {
    if (!itemId || !ratId) return

    isExtracting = true
    // Get current inventory length before export
    const currentInventoryLength = get(rat)?.inventory?.length ?? 0

    try {
      logger.log("Exporting item to NFT:", { itemId, ratId })
      await exportItemToNFT(ratId, itemId)
      logger.log("Item exported, waiting for inventory update...")

      // Wait for the inventory to actually update in the store
      await waitForInventoryChange(rat, currentInventoryLength)
      logger.log("Inventory updated")
      playSound({ category: "ratfunUI", id: "itemPositive" })
    } catch (e) {
      errorHandler(e)
    } finally {
      isExtracting = false
      ratState.exportItem.clear()
      ratState.state.transitionTo(RAT_BOX_STATE.HAS_RAT)
    }
  }

  const onClickAbort = () => {
    playSound({ category: "ratfunUI", id: "smallButtonUp" })
    ratState.exportItem.clear()
    ratState.state.transitionTo(RAT_BOX_STATE.HAS_RAT)
  }
</script>

<div class="confirm-export">
  <div class="confirm-export-content">
    <!-- <div class="header">EXPORT TO NFT</div> -->

    <div class="warning-text">
      This will remove the item from your RAT's inventory and mint it as an NFT to your wallet.
    </div>

    <div class="item-preview">
      <NFTItem name={itemName ?? "Unknown Item"} value={itemValue ?? 0} />
    </div>

    <div class="button-container">
      <div class="abort-button-container">
        <BigButton text="Cancel" type="abort" onclick={onClickAbort} disabled={isExtracting} />
      </div>
      <div class="confirm-button-container">
        <BigButton text="Extract" type="confirm" onclick={onClickConfirm} disabled={isExtracting} />
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .confirm-export {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    background-image: url("/images/texture-2.png");
    background-size: 200px;

    .confirm-export-content {
      width: calc(100% - 40px);
      display: flex;
      flex-direction: column;
      gap: 16px;

      .item-preview {
        width: 200px;
        margin: 0 auto;
      }

      .warning-text {
        padding: 10px;
        background: var(--foreground-semi-transparent);
        color: var(--background);
        font-family: var(--special-font-stack);
        font-size: var(--font-size-large);
        margin-bottom: 20px;
      }

      .button-container {
        overflow: hidden;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        gap: 10px;
        height: 80px;
        margin-top: 20px;

        @media (max-width: 800px) {
          width: 100%;
          flex-direction: column;
          height: auto;
        }

        .abort-button-container {
          width: 100%;
          height: 100%;

          @media (max-width: 800px) {
            order: 3;
          }
        }

        .confirm-button-container {
          width: 100%;
          height: 100%;

          @media (max-width: 800px) {
            order: 1;
          }
        }
      }
    }
  }
</style>
