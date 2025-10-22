<script lang="ts">
  import { onMount } from "svelte"
  import { page } from "$app/state"
  import { initPublicNetwork } from "$lib/initPublicNetwork"
  import { initEntities } from "$lib/modules/systems/initEntities"
  import { blockNumber, loadingMessage, loadingPercentage, ready } from "$lib/modules/network"
  import { ENVIRONMENT } from "$lib/mud/enums"

  const {
    environment,
    loaded = () => {},
    minimumDuration = 1500
  }: {
    environment: ENVIRONMENT
    loaded: () => void
    minimumDuration?: number
  } = $props()

  let minimumDurationComplete = $state(false)

  // Wait for both chain sync and minimum duration to complete
  $effect(() => {
    if ($ready && minimumDurationComplete) {
      // ??? Explain what this does
      initEntities()

      // Return
      loaded()
    }
  })

  onMount(async () => {
    // This sets up the public network and listens to the SyncProgress component
    // When sync is complete, the ready store is set to true
    // We listen to for this in the $effect above
    await initPublicNetwork(environment, page.url)

    // Start the minimum duration timer
    setTimeout(() => {
      minimumDurationComplete = true
    }, minimumDuration)
  })
</script>

<div class="loading">
  <div class="status-box">
    <div>BlockNumber: {$blockNumber}</div>
    <div>LoadingMsg: {$loadingMessage}</div>
    <div>Loading%: {$loadingPercentage}</div>
    <div>Ready? {$ready}</div>
  </div>
</div>

<style lang="scss">
  .loading {
    position: fixed;
    top: 0;
    left: 0;
    color: var(--foreground);
    font-size: var(--font-size-normal);
    width: 100vw;
    height: 100vh;
    z-index: var(--z-top);
    display: flex;
    justify-content: center;
    align-items: center;
    .status-box {
      width: 400px;
      height: 200px;
      padding: 10px;
      background: yellow;
      font-size: 10px;
      color: black;
      font-size: var(--font-size-large);
    }
  }
</style>
