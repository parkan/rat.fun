import type { Hex } from "viem"
import { ENTITY_TYPE } from "contracts/enums"
import { get } from "svelte/store"
import { WALLET_TYPE } from "@ratfun/common/basic-network"
import { SetupWalletNetworkResult } from "@ratfun/common/mud"
import { walletNetwork, walletType } from "$lib/modules/network"
import { player, playerAddress } from "$lib/modules/state/stores"
import { initErc20Listener } from "$lib/modules/erc20Listener"

export function initWalletNetwork(
  wallet: SetupWalletNetworkResult,
  address: Hex,
  type: WALLET_TYPE
) {
  walletType.set(type)
  walletNetwork.set(wallet)
  playerAddress.set(address)
  initErc20Listener()
  // Check if player is already spawned
  return get(player)?.entityType === ENTITY_TYPE.PLAYER ? true : false
}
