import { AuctionParams } from "./types"

function adjustToPoolPrice(price: number, decimals0: number, decimals1: number) {
  // Price is supposed to be currency1/currency0, so multiply by decimals1, divide by decimals0
  const decimalAdjustment = 10 ** (decimals1 - decimals0)
  return price * decimalAdjustment
}

function adjustFromPoolPrice(price: number, decimals0: number, decimals1: number) {
  // Price is currency1/currency0, so divide by decimals1, multiply by decimals0
  const decimalAdjustment = 10 ** (decimals1 - decimals0)
  return price / decimalAdjustment
}

export function calculateTickRange(
  isToken0: boolean,
  startPrice: number,
  endPrice: number,
  tickSpacing: number,
  tokenDecimals: number,
  numeraireDecimals: number
): { startTick: number; endTick: number } {
  // Convert numeraire/token price to currency1/currency0 price
  if (!isToken0) {
    startPrice = 1 / startPrice
    endPrice = 1 / endPrice
  }
  // And set decimals accordingly
  const decimals0 = isToken0 ? tokenDecimals : numeraireDecimals
  const decimals1 = isToken0 ? numeraireDecimals : tokenDecimals

  // Adjust decimals
  startPrice = adjustToPoolPrice(startPrice, decimals0, decimals1)
  endPrice = adjustToPoolPrice(endPrice, decimals0, decimals1)

  // Convert price range to tick range, swapping the order
  const startTick = Math.floor(Math.log(endPrice) / Math.log(1.0001) / tickSpacing) * tickSpacing
  const endTick = Math.ceil(Math.log(startPrice) / Math.log(1.0001) / tickSpacing) * tickSpacing

  return { startTick, endTick }
}

export function tickToPrice(
  isToken0: boolean,
  tick: number | bigint,
  tokenDecimals: number,
  numeraireDecimals: number
) {
  const decimals0 = isToken0 ? tokenDecimals : numeraireDecimals
  const decimals1 = isToken0 ? numeraireDecimals : tokenDecimals

  const price = Math.E ** (Number(tick) * Math.log(1.0001))

  let adjustedPrice = adjustFromPoolPrice(price, decimals0, decimals1)
  if (!isToken0) {
    adjustedPrice = 1 / adjustedPrice
  }

  return adjustedPrice
}

export function tickToPriceWithParams(tick: number | bigint, auctionParams: AuctionParams) {
  return tickToPrice(
    auctionParams.isToken0,
    tick,
    auctionParams.token.decimals,
    auctionParams.numeraire.decimals
  )
}
