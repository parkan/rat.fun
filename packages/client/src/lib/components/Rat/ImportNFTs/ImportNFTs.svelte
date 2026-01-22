<script lang="ts">
  import { onMount } from "svelte"
  import { get } from "svelte/store"
  import { publicNetwork } from "$lib/modules/network"
  import { itemNftConfig, playerAddress, player, rat } from "$lib/modules/state/stores"
  import { ItemNFTAbi } from "contracts/externalAbis"
  import { importNFTToItem } from "$lib/modules/on-chain-transactions"
  import { errorHandler } from "$lib/modules/error-handling"
  import { playSound } from "$lib/modules/sound"
  import { createLogger } from "$lib/modules/logger"
  import { BackButton } from "$lib/components/Shared"
  import { ratState, RAT_BOX_STATE } from "$lib/components/Rat/state.svelte"
  import { getRatInventory, waitForInventoryChange } from "$lib/modules/state/utils"
  import NFTItem from "$lib/components/Rat/NFTItem/NFTItem.svelte"

  const logger = createLogger("[ImportNFTs]")

  const MAX_INVENTORY_SIZE = 6

  interface OwnedNFT {
    tokenId: bigint
    itemId: string
    name: string
    value: number
  }

  let ownedNFTs = $state<OwnedNFT[]>([])
  let loading = $state(true)
  let importing = $state<bigint | null>(null)

  // Get current rat ID
  let ratId = $derived($player?.currentRat as string | undefined)

  // Get current inventory size
  let inventorySize = $derived($rat ? getRatInventory($rat).length : 0)
  let inventoryFull = $derived(inventorySize >= MAX_INVENTORY_SIZE)

  // Get ItemNFT address from store
  function getItemNftAddress(): string | null {
    const config = get(itemNftConfig)
    if (
      config?.itemNftAddress &&
      config.itemNftAddress !== "0x0000000000000000000000000000000000000000"
    ) {
      return config.itemNftAddress
    }
    return null
  }

  async function loadOwnedNFTs() {
    const itemNftAddress = getItemNftAddress()

    if (!itemNftAddress) {
      logger.log("ItemNFT address not configured")
      loading = false
      return
    }

    const publicClient = get(publicNetwork).publicClient
    const account = get(playerAddress)

    if (!account) {
      logger.log("No account connected")
      loading = false
      return
    }

    try {
      const balance = (await publicClient.readContract({
        address: itemNftAddress as `0x${string}`,
        abi: ItemNFTAbi,
        functionName: "balanceOf",
        args: [account as `0x${string}`]
      })) as bigint

      logger.log("NFT balance:", { count: Number(balance) })

      const nfts: OwnedNFT[] = []

      for (let i = 0n; i < balance; i++) {
        const tokenId = (await publicClient.readContract({
          address: itemNftAddress as `0x${string}`,
          abi: ItemNFTAbi,
          functionName: "tokenOfOwnerByIndex",
          args: [account as `0x${string}`, i]
        })) as bigint

        const itemId = (await publicClient.readContract({
          address: itemNftAddress as `0x${string}`,
          abi: ItemNFTAbi,
          functionName: "getItemId",
          args: [tokenId]
        })) as `0x${string}`

        const [name, value] = (await publicClient.readContract({
          address: itemNftAddress as `0x${string}`,
          abi: ItemNFTAbi,
          functionName: "getItemData",
          args: [tokenId]
        })) as [string, bigint]

        nfts.push({
          tokenId,
          itemId: itemId.toString(),
          name,
          value: Number(value)
        })
      }

      ownedNFTs = nfts
      logger.log("Loaded NFTs:", { count: nfts.length })

      // If no NFTs, go back to HAS_RAT
      if (nfts.length === 0) {
        ratState.state.transitionTo(RAT_BOX_STATE.HAS_RAT)
      }
    } catch (e) {
      logger.error("Error loading NFTs:", e)
    } finally {
      loading = false
    }
  }

  async function handleImport(tokenId: bigint) {
    if (!ratId || inventoryFull) return

    importing = tokenId
    // Get current inventory length before import
    const currentInventoryLength = get(rat)?.inventory?.length ?? 0

    try {
      logger.log("Importing NFT:", { tokenId: tokenId.toString(), ratId })
      await importNFTToItem(ratId, tokenId)
      logger.log("NFT imported, waiting for inventory update...")

      // Wait for the inventory to actually update in the store
      await waitForInventoryChange(rat, currentInventoryLength)
      logger.log("Inventory updated")
      playSound({ category: "ratfunUI", id: "itemPositive" })

      // Reload NFTs (the imported one should now be gone)
      await loadOwnedNFTs()
    } catch (e) {
      errorHandler(e)
    } finally {
      importing = null
    }
  }

  const handleBack = () => {
    playSound({ category: "ratfunUI", id: "smallButtonUp" })
    ratState.state.transitionTo(RAT_BOX_STATE.HAS_RAT)
  }

  onMount(() => {
    loadOwnedNFTs()
  })
</script>

<div class="import-nfts">
  <div class="back-button-container">
    <BackButton onclick={handleBack} />
  </div>

  <div class="header">
    <div class="title">PSYCHO OBJECT VAULT</div>
    <div class="inventory-status">
      {#if inventoryFull}
        <span class="full-warning">(Full)</span>
      {/if}
    </div>
  </div>

  <div class="nft-list-container">
    {#if loading}
      <div class="loading">Loading NFTs...</div>
    {:else if ownedNFTs.length === 0}
      <div class="empty">No Item NFTs owned</div>
    {:else}
      <div class="nft-grid">
        {#each ownedNFTs as nft, index (nft.tokenId.toString())}
          <div class="nft-item-wrapper" style="animation-delay: {index * 50}ms">
            <NFTItem
              name={nft.name}
              value={nft.value}
              actionText={importing === nft.tokenId ? "Injecting..." : "Inject"}
              actionDisabled={importing !== null || !ratId || inventoryFull}
              onAction={() => handleImport(nft.tokenId)}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .import-nfts {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-image: url("/images/texture-2.png");
    background-size: 200px;
  }

  .header {
    line-height: 40px;
    height: 40px;
    border-bottom: var(--default-border-style);
    padding-inline: 20px;
    display: flex;
    overflow: hidden;
    position: sticky;
    top: 0;
    z-index: var(--z-high);
    background-repeat: repeat;
    text-align: center;
    justify-content: center;
    background: var(--background-semi-transparent);
    user-select: none;
    text-align: right;
    color: var(--foreground);
    font-size: var(--font-size-normal);
    font-family: var(--special-font-stack);

    .inventory-status {
      font-family: var(--typewriter-font-stack);
      font-size: var(--font-size-small);
      color: var(--foreground);
      opacity: 0.8;

      .full-warning {
        color: var(--color-red);
      }
    }
  }

  .nft-list-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background-image: url("/images/texture-3.png");
  }

  .loading,
  .empty {
    text-align: center;
    padding: 40px;
    font-family: var(--typewriter-font-stack);
    color: var(--foreground);
    opacity: 0.7;
  }

  .nft-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    @media (max-width: 800px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .nft-item-wrapper {
    animation: scaleIn 0.2s ease-out both;
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .back-button-container {
    border-top: var(--default-border-style);
    display: flex;
    justify-content: center;
    height: 60px;
  }
</style>
