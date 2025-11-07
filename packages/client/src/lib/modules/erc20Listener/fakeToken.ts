import { Hex } from "viem"
import { get } from "svelte/store"
import { publicNetwork } from "$lib/modules/network"
import { playerAddress } from "$lib/modules/state/stores"
import { readPlayerERC20Allowance, readPlayerERC20Balance } from "$lib/modules/erc20Listener"
import { playerFakeTokenAllowance, playerFakeTokenBalance } from "$lib/modules/erc20Listener/stores"
import {
  fakeTokenErc20Address,
  fakeTokenExchangeAddress
} from "$lib/modules/on-chain-transactions/fakeToken"

export async function refetchFakeTokenAllowance() {
  const allowance = await readPlayerERC20Allowance(
    get(publicNetwork),
    get(playerAddress) as Hex,
    fakeTokenExchangeAddress,
    fakeTokenErc20Address
  )
  playerFakeTokenAllowance.set(allowance)
}

export async function refetchFakeTokenBalance() {
  const balance = await readPlayerERC20Balance(
    get(publicNetwork),
    get(playerAddress) as Hex,
    fakeTokenErc20Address
  )
  playerFakeTokenBalance.set(balance)
}
