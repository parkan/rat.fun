import { Command } from "commander"
import { createPublicClient, http, Chain } from "viem"
import { readAuctionParams } from "../src/readAuctionParams"
import { CustomQuoter } from "../src/CustomQuoter"
import { validateChain } from "./utils/validateChain"

// Set up command line options
const program = new Command()
program
  .requiredOption("-c, --chain-id <CHAINID>", "Chain id", parseInt, 84532)
  .requiredOption("-n, --amount <AMOUNT>", "Token amount, not multiplied by decimals")
  .option("-o, --out", "Specify exact out amount, instead of exact in")
  .parse(process.argv)

const options = program.opts()

const chainId: number = options.chainId
const chain = validateChain(chainId)

const isOut: boolean = options.out ?? false
const amount: string = options.amount

const publicClient = createPublicClient({
  chain: chain as Chain,
  transport: http()
})

const auctionParams = readAuctionParams(chain.id)
if (!auctionParams) throw new Error(`Auction params not found for chainId ${chain.id}`)

const quoter = new CustomQuoter(publicClient, chain.id, auctionParams)
console.log("isToken0", quoter.isToken0)
console.log("zeroForOne", quoter.zeroForOne(true))

let inputAmount
let outputAmount
if (isOut) {
  outputAmount = amount
  const input = await quoter.quoteExactOutputV4(outputAmount, true)
  inputAmount = input.formattedAmount

  console.log("input:", inputAmount)
  console.log("exact output:", outputAmount)
} else {
  inputAmount = amount
  const output = await quoter.quoteExactInputV4(inputAmount, true)
  outputAmount = output.formattedAmount

  console.log("exact input:", inputAmount)
  console.log("output:", outputAmount)
}

const lens = await quoter.quoteExactInputV4Lens(inputAmount, true)
const lensTokenAmount = lens.isToken0 ? lens.formattedAmount0 : lens.formattedAmount1
const lensNumeraireAmount = lens.isToken0 ? lens.formattedAmount1 : lens.formattedAmount0
console.log("lens token:", lensTokenAmount)
console.log("lens numeraire:", lensNumeraireAmount)

/*
Tick range: 315400 329400
poolAddress 0x8E75fFb8Ffb13e0E7597d89dB39a8ac9e2A21d96
tokenAddress 0x8ff20b81a520D3fa7976b4E0085E7E9d592e58b7
{
  address: '0x8E75fFb8Ffb13e0E7597d89dB39a8ac9e2A21d96',
  tokenAddress: '0x8ff20b81a520D3fa7976b4E0085E7E9d592e58b7',
  numeraireAddress: '0x5E92d42E243eb652a555Ab6d7F0C863419110b78',
  fee: 10000,
  liquidity: 0n,
  sqrtPriceX96: 1125517062146956935007998405487190254n
}
0n
const input = await quoter.quoter.quoteExactInputV3({
    tokenIn: weth,
    tokenOut: usdc,
    amountIn: parseEther('1'),
    fee: 3000 // 0.3% fee tier
  })
*/
