import { Hex, getAddress, createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { Command } from "commander"
import dotenv from "dotenv"
import { getChain } from "@ratfun/common/basic-network"
import { derc20BuyLimitAbi } from "../src/abis"

dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY as Hex
const RPC_URL_BASE = process.env.RPC_URL_BASE as string

if (!RPC_URL_BASE) {
  console.error("Error: RPC_URL_BASE not set in .env")
  process.exit(1)
}

const account = privateKeyToAccount(PRIVATE_KEY)

// Set up command line options
const program = new Command()
program
  .requiredOption("-c, --chain-id <CHAINID>", "Chain id", (val: string) => parseInt(val), 8453)
  .requiredOption("-t, --token <ADDRESS>", "Token address")
  .requiredOption("-u, --uri <URI>", "Token URI (e.g., ipfs://... or https://...)")
  .parse(process.argv)

const options = program.opts()

const chainId: number = options.chainId
const chain = getChain(chainId)
const tokenAddress = getAddress(options.token)
const tokenURI: string = options.uri

const transport = http(RPC_URL_BASE)

const publicClient = createPublicClient({
  chain,
  transport
})

const walletClient = createWalletClient({
  chain,
  transport,
  account
})

// Read current tokenURI
const currentURI = await publicClient.readContract({
  address: tokenAddress,
  abi: derc20BuyLimitAbi,
  functionName: "tokenURI"
})

console.log("RPC URL:", RPC_URL_BASE)
console.log("Token address:", tokenAddress)
console.log("Current tokenURI:", currentURI || "(empty)")
console.log("New tokenURI:", tokenURI)
console.log("Sender:", account.address)
console.log("")

// Simulate the transaction first
console.log("Simulating transaction...")
try {
  await publicClient.simulateContract({
    address: tokenAddress,
    abi: derc20BuyLimitAbi,
    functionName: "updateTokenURI",
    args: [tokenURI],
    account
  })
  console.log("Simulation successful!")
} catch (error) {
  console.error("Simulation failed:", error)
  process.exit(1)
}

// Send the transaction
console.log("Sending transaction...")
const hash = await walletClient.writeContract({
  address: tokenAddress,
  abi: derc20BuyLimitAbi,
  functionName: "updateTokenURI",
  args: [tokenURI]
})

console.log("Transaction hash:", hash)

// Wait for confirmation
console.log("Waiting for confirmation...")
const receipt = await publicClient.waitForTransactionReceipt({ hash })

if (receipt.status === "success") {
  console.log("Transaction confirmed in block:", receipt.blockNumber)

  // Verify the update
  const newURI = await publicClient.readContract({
    address: tokenAddress,
    abi: derc20BuyLimitAbi,
    functionName: "tokenURI"
  })
  console.log("Verified new tokenURI:", newURI)
} else {
  console.error("Transaction failed!")
  process.exit(1)
}
