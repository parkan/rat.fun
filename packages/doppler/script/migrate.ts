import { Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { airlockAbi, getAddresses } from "@whetstone-research/doppler-sdk"
import dotenv from "dotenv"
import { getClients } from "./utils/getClients"
import { readAuctionParams } from "../src/readAuctionParams"
import { promptChain } from "./utils/promptChain"

dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY as Hex

const account = privateKeyToAccount(PRIVATE_KEY)

const chain = promptChain()

const { publicClient, walletClient } = getClients(account, chain)

const auctionParams = await readAuctionParams(chain.id)
if (!auctionParams) throw new Error(`Auction params not found for chainId ${chain.id}`)

const addresses = getAddresses(chain.id)

const txHash = await walletClient.writeContract({
  address: addresses.airlock,
  abi: airlockAbi,
  functionName: "migrate",
  args: [auctionParams.token.address]
})
console.log(txHash)
await publicClient.waitForTransactionReceipt({ hash: txHash })
