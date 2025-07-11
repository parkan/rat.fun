import type { LayoutLoad } from "./$types"
import { WALLET_TYPE } from "$lib/mud/enums"
import { getEnvironment } from "$lib/modules/network"

export const prerender = "auto"
export const ssr = false

const getWalletType = (url: URL) => {
  const hostname = url.hostname

  if (hostname.includes("entrykit") || url.searchParams.has("entrykit")) {
    return WALLET_TYPE.ENTRYKIT
  }

  return WALLET_TYPE.BURNER
}

export const load: LayoutLoad = async ({ url }) => {
  const environment = getEnvironment(url)
  const walletType = getWalletType(url)

  console.log("Found wallet type", walletType)

  return {
    environment: environment,
    walletType: walletType
  }
}
