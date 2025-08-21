import type { LayoutLoad } from "./$types"
import { getEnvironmentFromUrl, getWalletTypeFromUrl } from "$lib/modules/network"
import { getNetworkConfig } from "$lib/mud/getNetworkConfig"

export const ssr = false
export const prerender = false

export const load: LayoutLoad = async ({ url }) => {
  // Pass all kinds of Network stuff to the main layout
  const environment = getEnvironmentFromUrl(url)
  const networkConfig = getNetworkConfig(environment, url)
  const walletType = getWalletTypeFromUrl(url)

  return {
    environment: environment,
    walletType: walletType,
    networkConfig
  }
}
