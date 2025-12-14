import type { WalletDeeplink } from "./DeepLinkSelectModal.svelte"

/**
 * Generate wallet deeplinks for a specific domain
 * @param domain - The domain to open in wallet browsers (e.g., "rat.fun", "sale.rat.fun")
 */
export function generateWalletDeeplinks(domain: string): Record<string, WalletDeeplink> {
  const encodedUrl = encodeURIComponent(`https://${domain}`)

  return {
    coinbase: {
      ios: `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
      android: `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
      name: "BASE"
    },
    metamask: {
      ios: `https://link.metamask.io/dapp/${domain}`,
      android: `https://link.metamask.io/dapp/${domain}`,
      name: "MetaMask"
    },
    phantom: {
      ios: `https://phantom.app/ul/browse/${encodedUrl}`,
      android: `https://phantom.app/ul/browse/${encodedUrl}`,
      name: "Phantom"
    },
    rabby: {
      ios: `rabby://dapp?url=${encodedUrl}`,
      android: `rabby://dapp?url=${encodedUrl}`,
      name: "Rabby"
    }
  }
}

/**
 * Farcaster miniapp deeplink for rat.fun main client only
 * This requires an app ID specific to the main client
 */
export const FARCASTER_DEEPLINK: WalletDeeplink = {
  ios: "https://farcaster.xyz/miniapps/019a831d-c396-2146-8c71-b7bf33422d59/rat-fun",
  android: "https://farcaster.xyz/miniapps/019a831d-c396-2146-8c71-b7bf33422d59/rat-fun",
  name: "Farcaster"
}
