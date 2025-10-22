import type { LayoutLoad } from "./$types"
import { get } from "svelte/store"
import { getEnvironmentFromUrl } from "$lib/modules/network"
import { SALE_STATUS } from "$lib/mud/enums"
import { PUBLIC_SALE_STATUS } from "$env/static/public"
import { ENVIRONMENT } from "$lib/mud/enums"
import {
  environment as environmentStore,
  saleStatus as saleStatusStore
} from "$lib/modules/network"

export const ssr = false
export const prerender = false

export const load: LayoutLoad = async ({ url }) => {
  let environment: ENVIRONMENT = get(environmentStore)
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

  if (saleStatus === SALE_STATUS.UNKNOWN) {
    saleStatus = (PUBLIC_SALE_STATUS ?? SALE_STATUS.NOT_STARTED) as SALE_STATUS
    // Set the sale status store
    saleStatusStore.set(saleStatus)
  }
}
