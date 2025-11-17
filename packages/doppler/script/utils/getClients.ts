import {
  Account,
  Chain,
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  Transport,
  WalletClient
} from "viem"
import { DopplerSDK } from "@whetstone-research/doppler-sdk"

export function getClients(
  account: Account,
  chain: Chain
): {
  publicClient: PublicClient<Transport, Chain>
  walletClient: WalletClient<Transport, Chain, Account>
  sdk: DopplerSDK
} {
  // Set up viem clients
  const publicClient = createPublicClient({
    chain,
    transport: http()
  })

  const walletClient = createWalletClient({
    chain,
    transport: http(),
    account
  })

  // Initialize the SDK
  const sdk = new DopplerSDK({
    publicClient,
    walletClient: walletClient as any,
    chainId: chain.id
  })

  return {
    publicClient,
    walletClient,
    sdk
  }
}
