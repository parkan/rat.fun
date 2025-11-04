import { Account, Chain, formatUnits, PublicClient, Transport, WalletClient } from "viem"
import { AuctionParams, balanceOf, swapExactSingle } from "../../src"

export async function swapWithLogs(
  publicClient: PublicClient<Transport, Chain>,
  walletClient: WalletClient<Transport, Chain, Account>,
  auctionParams: AuctionParams,
  amount: number,
  isOut: boolean,
) {
  console.log('before swap')
  const tokenBalanceBefore = formatUnits(await balanceOf(publicClient, auctionParams.token.address, walletClient.account.address), auctionParams.token.decimals)
  const numeraireBalanceBefore = formatUnits(await balanceOf(publicClient, auctionParams.numeraire.address, walletClient.account.address), auctionParams.numeraire.decimals)
  console.log('token:', tokenBalanceBefore)
  console.log('numeraire:', numeraireBalanceBefore)

  await swapExactSingle(
    publicClient,
    walletClient,
    auctionParams,
    amount,
    isOut
  )
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log('after swap')
  const tokenBalanceAfter = formatUnits(await balanceOf(publicClient, auctionParams.token.address, walletClient.account.address), auctionParams.token.decimals)
  const numeraireBalanceAfter = formatUnits(await balanceOf(publicClient, auctionParams.numeraire.address, walletClient.account.address), auctionParams.numeraire.decimals)
  console.log('token:', tokenBalanceAfter)
  console.log('numeraire:', numeraireBalanceAfter)

  const tokenDiff = parseFloat(tokenBalanceAfter) - parseFloat(tokenBalanceBefore)
  const numeraireDiff = parseFloat(numeraireBalanceBefore) - parseFloat(numeraireBalanceAfter)
  console.log('token diff:', tokenDiff)
  console.log('numeraire diff:', numeraireDiff)
  const effectivePrice = numeraireDiff / tokenDiff
  console.log('effective price:', effectivePrice)

  return {
    tokenBalanceBefore,
    tokenBalanceAfter,
    numeraireBalanceBefore,
    numeraireBalanceAfter,
    tokenDiff,
    numeraireDiff,
    effectivePrice
  }
}