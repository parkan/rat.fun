import { AuctionParams } from "./types"
import auctionParamsAllChains from "../auction-params.json" with { type: "json" }

export function readAuctionParams(chainId: number): undefined | AuctionParams {
  if (chainId in auctionParamsAllChains) {
    return auctionParamsAllChains[chainId as never] as never
  }
  return undefined
}
