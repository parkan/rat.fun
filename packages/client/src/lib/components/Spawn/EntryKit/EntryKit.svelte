<script lang="ts">
  import { entrykit, sessionClient, wagmiConfig } from "$lib/modules/entry-kit"
  import { getConnectorClient, watchAccount } from "@wagmi/core"
  import { get } from "svelte/store"
  import { UIState } from "$lib/modules/ui/state.svelte"
  import { UI } from "$lib/modules/ui/enums"
  import { errorHandler } from "$lib/modules/error-handling"

  let lastConnectedAddress = $state("")
  let isConnecting = false

  function _errorHandler(error: unknown) {
    console.error("EntryKit error:", error)
    errorHandler(error)
  }

  // Watch for session changes
  $effect(() => {
    if ($sessionClient) {
      const address = $sessionClient.account.address

      if (lastConnectedAddress && lastConnectedAddress !== address) {
        // Account changed - reset to spawning
        UIState.set(UI.SPAWNING)
      }

      lastConnectedAddress = address
    } else if (lastConnectedAddress) {
      // Disconnected
      UIState.set(UI.SPAWNING)
      lastConnectedAddress = ""
    }
  })

  // Watch for wagmi account changes and setup entrykit
  async function handleAccountChange(account: any) {
    if (isConnecting) return

    try {
      const config = get(wagmiConfig)
      if (!config) return

      if (account.isConnected && account.address && account.chainId) {
        isConnecting = true

        const walletClient = await getConnectorClient(config)

        // Ensure client has chain
        if (!walletClient.chain) {
          console.warn("Wallet client has no chain, waiting...")
          isConnecting = false
          return
        }

        // Connect entrykit
        await entrykit.connect(walletClient)

        // Check if setup needed
        const prereqs = await entrykit.checkPrerequisites()
        if (!prereqs.isReady) {
          await entrykit.setupSession(walletClient)
        }

        isConnecting = false
      } else if (!account.isConnected && account.address === undefined) {
        // Wallet disconnected
        entrykit.disconnect()
        isConnecting = false
      }
    } catch (error) {
      isConnecting = false
      _errorHandler(error)
    }
  }

  // Setup wagmi account watcher
  $effect(() => {
    const config = get(wagmiConfig)
    if (!config) return

    const unwatch = watchAccount(config, {
      onChange: handleAccountChange
    })

    return () => unwatch()
  })
</script>
