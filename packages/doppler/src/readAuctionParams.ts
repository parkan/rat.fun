import { Address, Hex } from "viem"
import auctionParamsAllChains from "../auction-params.json" with { type: "json" }

export interface AuctionParams {
  poolId: Hex,
  transactionHash: Hex,
  hookAddress: Address,
  token: {
    address: Address,
    decimals: number,
    name: string,
    symbol: string
  },
  numeraire: {
    address: Address,
    decimals: number,
    name: string,
    symbol: string
  },
  auctionDurationDays: number,
  startTimeOffset: number,
  isToken0: boolean,
  startingTick: number,
  endingTick: number,
  pool: {
    fee: number,
    tickSpacing: number
  },
  userAddress: Address
}

export function readAuctionParams(chainId: number): undefined | AuctionParams {
  if (chainId in auctionParamsAllChains) {
    return auctionParamsAllChains[chainId as never] as never
  }
  return undefined
}