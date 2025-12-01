import type { LayoutLoad } from "./$types"
import { get } from "svelte/store"
import { getEnvironmentFromUrl, getWalletTypeFromUrl } from "$lib/modules/network"
import { ENVIRONMENT, WALLET_TYPE, SALE_STATUS } from "@ratfun/common/basic-network"
import { PUBLIC_SALE_STATUS } from "$env/static/public"
import {
  environment as environmentStore,
  walletType as walletTypeStore,
  saleStatus as saleStatusStore
} from "$lib/modules/network"

export const ssr = false
export const prerender = false

export const load: LayoutLoad = async ({ url }) => {
  let environment: ENVIRONMENT = get(environmentStore)
  let walletType: WALLET_TYPE = get(walletTypeStore)
  let saleStatus: SALE_STATUS = get(saleStatusStore)

  // *****************************
  // We only want to get the environment and and wallet type once in a session
  // the url and particularly the searchparams are unreliable
  // *****************************

  if (environment === ENVIRONMENT.UNKNOWN) {
    environment = getEnvironmentFromUrl(url)
    // Set the environment store
    environmentStore.set(environment)
  }

  if (walletType === WALLET_TYPE.UNKNOWN) {
    walletType = getWalletTypeFromUrl(url)
    // Set the wallet type store
    walletTypeStore.set(walletType)
  }

  if (saleStatus === SALE_STATUS.UNKNOWN) {
    saleStatus = (PUBLIC_SALE_STATUS ?? SALE_STATUS.NOT_STARTED) as SALE_STATUS
    // Set the sale status store
    saleStatusStore.set(saleStatus)
  }
}
