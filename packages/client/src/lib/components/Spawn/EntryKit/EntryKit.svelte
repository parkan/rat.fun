<script lang="ts">
  import type { Hex } from "viem"
  import { WagmiProvider } from "wagmi"

  import { getNetworkConfig } from "$lib/mud/getNetworkConfig"
  import { getEnvironment } from "$lib/modules/network"

  import { page } from "$app/state"
  import { createElement } from "react"
  import { createRoot } from "react-dom/client"
  import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
  import { defineConfig, AccountButton, EntryKitProvider } from "@latticexyz/entrykit/internal"

  import { entryKitAccountConnected, entryKitSession } from "$lib/modules/entry-kit/stores"
  import { paymasters } from "$lib/modules/entry-kit/paymasters"
  import { wagmiConfig } from "$lib/modules/entry-kit/wagmiConfig"
  import SessionBridge from "$lib/modules/entry-kit/SessionBridge"

  let rootEl: HTMLElement

  const environment = getEnvironment(page.url)
  const networkConfig = getNetworkConfig(environment, page.url)
  const queryClient = new QueryClient()

  let {
    hidden = false,
    onMounted = () => {},
    onAccountConnected = () => {}
  }: { hidden: boolean; onMounted?: () => void; onAccountConnected?: () => void } = $props()

  let isMounted = $state(false)
  let hasNotifiedMount = $state(false)

  // Create a wrapper component that notifies when mounted
  const MountNotifier = ({
    children,
    onMount
  }: {
    children: React.ReactNode
    onMount: () => void
  }) => {
    const ref = (node: HTMLElement | null) => {
      if (node && !hasNotifiedMount) {
        // Use setTimeout to ensure React has finished rendering
        setTimeout(() => {
          onMount()
          hasNotifiedMount = true
        }, 0)
      }
    }

    return createElement("div", { ref, style: { display: "contents" } }, children)
  }

  // Watch for account connection
  $effect(() => {
    if ($entryKitAccountConnected && isMounted) {
      onAccountConnected()
    }
  })

  // Watch for session changes after mount
  $effect(() => {
    if ($entryKitSession?.userAddress && isMounted) {
      onAccountConnected()
    }
  })

  $effect(() => {
    const root = createRoot(rootEl)

    const handleMount = () => {
      console.log("EntryKit React components mounted")
      isMounted = true
      onMounted()
    }

    const config = wagmiConfig()
    const entrykit = createElement(
      EntryKitProvider,
      {
        config: defineConfig({
          chainId: networkConfig.chainId,
          worldAddress: networkConfig.worldAddress as Hex,
          paymasterOverride: paymasters[networkConfig.chainId]
        })
      },
      [
        createElement(AccountButton, { key: "account-button" }),
        createElement(SessionBridge, { key: "session-bridge" })
      ]
    )

    const wrappedEntrykit = createElement(MountNotifier, { onMount: handleMount }, entrykit)

    const providers = createElement(
      WagmiProvider,
      { config },
      createElement(QueryClientProvider, { client: queryClient }, wrappedEntrykit)
    )

    root.render(providers)

    return () => {
      isMounted = false
      hasNotifiedMount = false
      root.unmount()
    }
  })
</script>

<div bind:this={rootEl} class:hidden class="root"></div>

<style>
  .root {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .hidden {
    display: none;
  }
</style>
