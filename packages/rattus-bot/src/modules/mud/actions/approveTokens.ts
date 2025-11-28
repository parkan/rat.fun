import { maxUint256, erc20Abi, type Hex } from "viem"
import { getComponentValue } from "@latticexyz/recs"
import { singletonEntity } from "@latticexyz/store-sync/recs"
import type { SetupResult } from "../setup"

export async function approveMaxTokens(mud: SetupResult): Promise<string> {
  const externalAddresses = getComponentValue(
    mud.components.ExternalAddressesConfig,
    singletonEntity
  )
  if (!externalAddresses) {
    throw new Error("ExternalAddressesConfig not found in MUD state")
  }

  const erc20Address = externalAddresses.erc20Address as Hex
  const gamePoolAddress = externalAddresses.gamePoolAddress as Hex

  console.log(`Approving max tokens for game pool...`)
  console.log(`  ERC20 address: ${erc20Address}`)
  console.log(`  Game pool address: ${gamePoolAddress}`)

  const tx = await mud.walletClient.writeContract({
    address: erc20Address,
    abi: erc20Abi,
    functionName: "approve",
    args: [gamePoolAddress, maxUint256]
  })

  console.log(`Approve transaction sent: ${tx}`)
  await mud.publicClient.waitForTransactionReceipt({ hash: tx })
  console.log(`Tokens approved successfully!`)

  return tx
}

export async function getAllowance(mud: SetupResult, ownerAddress: Hex): Promise<bigint> {
  const externalAddresses = getComponentValue(
    mud.components.ExternalAddressesConfig,
    singletonEntity
  )
  if (!externalAddresses) {
    throw new Error("ExternalAddressesConfig not found in MUD state")
  }

  const erc20Address = externalAddresses.erc20Address as Hex
  const gamePoolAddress = externalAddresses.gamePoolAddress as Hex

  const allowance = await mud.publicClient.readContract({
    address: erc20Address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [ownerAddress, gamePoolAddress]
  })

  return allowance
}

export async function getTokenBalance(mud: SetupResult, ownerAddress: Hex): Promise<bigint> {
  const externalAddresses = getComponentValue(
    mud.components.ExternalAddressesConfig,
    singletonEntity
  )
  if (!externalAddresses) {
    throw new Error("ExternalAddressesConfig not found in MUD state")
  }

  const erc20Address = externalAddresses.erc20Address as Hex

  const balance = await mud.publicClient.readContract({
    address: erc20Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [ownerAddress]
  })

  return balance
}
