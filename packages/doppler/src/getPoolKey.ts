import { DYNAMIC_FEE_FLAG } from '@whetstone-research/doppler-sdk'
import { AuctionParams } from './types'

export function getPoolKey(auctionParams: AuctionParams) {
  const token = auctionParams.token.address
  const numeraire = auctionParams.numeraire.address

  const [currency0, currency1] = [token, numeraire]
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))

  return {
    currency0,
    currency1,
    fee: DYNAMIC_FEE_FLAG,
    tickSpacing: auctionParams.pool.tickSpacing,
    hooks: auctionParams.hookAddress,
  }
}
