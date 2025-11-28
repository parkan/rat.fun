import { AuctionParams, Permit2PermitData } from "doppler"
import { Hex } from "viem"
import { simulateContract, writeContract } from "viem/actions"
import { RatRouterAbi } from "contracts/externalAbis"
import { prepareConnectorClientForTransaction } from "../drawbridge/connector"
import { prepareSwapRouterPathArgs, ratRouterAddress, wethCurrency } from "./currency"

export async function swapExactIn(
  fromCurrencyAddress: Hex,
  auctionParams: AuctionParams,
  amountIn: bigint,
  permit?: Permit2PermitData,
  permitSignature?: Hex
) {
  const client = await prepareConnectorClientForTransaction()

  if (fromCurrencyAddress === wethCurrency.address) {
    const nowSec = BigInt(Math.floor(Date.now() / 1000))
    const deadline = nowSec + 3600n

    // Simulate to catch errors
    const { request } = await simulateContract(client, {
      address: ratRouterAddress,
      abi: RatRouterAbi,
      functionName: "swapExactInEth",
      args: [...prepareSwapRouterPathArgs(fromCurrencyAddress, auctionParams, false), deadline],
      value: amountIn
    })
    // Execute
    return await writeContract(client, request)
  } else {
    if (!permit || !permitSignature)
      throw new Error("Permit2 data and signature required for token swap")

    // Simulate to catch errors
    const { request } = await simulateContract(client, {
      address: ratRouterAddress,
      abi: RatRouterAbi,
      functionName: "swapExactInToken",
      args: [
        amountIn,
        ...prepareSwapRouterPathArgs(fromCurrencyAddress, auctionParams, false),
        permit,
        permitSignature
      ]
    })
    // Execute
    return await writeContract(client, request)
  }
}
