import { Address, Client } from "viem"
import { getCode, sendTransaction, waitForTransactionReceipt } from "viem/actions"
import { getAction } from "viem/utils"
import { DEPLOYMENT_TIMEOUTS } from "../../types"

/**
 * Smart wallet deployment utilities
 *
 * Handles counterfactual smart wallets (e.g., Coinbase Smart Wallet) that use
 * CREATE2 and exist at a deterministic address before deployment.
 */

/**
 * Check if an error indicates a wallet is already deployed
 *
 * ERC-4337 bundlers and smart wallets return specific error codes when
 * attempting to deploy an already-deployed wallet:
 * - AA10: Account already deployed (ERC-4337 bundler error code)
 * - "already constructed": Some wallet implementations
 * - "already deployed": Generic message from some bundlers
 *
 * @param errorMessage Error message to check
 * @returns True if error indicates wallet is already deployed
 */
export function isAlreadyDeployedError(errorMessage: string): boolean {
  return (
    errorMessage.includes("AA10") ||
    errorMessage.includes("already constructed") ||
    errorMessage.includes("already deployed")
  )
}

/**
 * Check if a smart wallet is deployed on-chain
 *
 * @param client Client to use for checking
 * @param address Wallet address to check
 * @returns True if deployed, false otherwise
 */
export async function isWalletDeployed(client: Client, address: Address): Promise<boolean> {
  const code = await getAction(
    client,
    getCode,
    "getCode"
  )({
    address
  })

  return code !== undefined && code !== "0x"
}

/**
 * Deploy a smart wallet using a factory contract
 *
 * This handles the deployment of counterfactual smart wallets. The wallet address
 * already exists (can receive funds) but needs on-chain deployment before it can
 * validate signatures or execute transactions.
 *
 * @param client Client to use for deployment transaction (usually session client with paymaster)
 * @param userAddress User's wallet address to deploy
 * @param factoryAddress Factory contract address that can deploy the wallet
 * @param factoryCalldata Deployment calldata for the factory
 */
export async function deployWallet(
  client: Client,
  userAddress: Address,
  factoryAddress: Address,
  factoryCalldata: Address
): Promise<void> {
  try {
    const txHash = await getAction(
      client,
      sendTransaction,
      "sendTransaction"
    )({
      account: client.account,
      chain: client.chain,
      to: factoryAddress,
      data: factoryCalldata
    })

    // Wait for deployment confirmation
    await getAction(
      client,
      waitForTransactionReceipt,
      "waitForTransactionReceipt"
    )({
      hash: txHash
    })

    // Add delay for bundler/paymaster state to update
    // After deployment, bundlers cache account state and need time to refresh
    await new Promise(resolve => setTimeout(resolve, DEPLOYMENT_TIMEOUTS.BUNDLER_STATE_SYNC))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // If already deployed, that's fine - not an error
    if (isAlreadyDeployedError(errorMessage)) {
      console.log("[drawbridge] Wallet already deployed, continuing")
      return
    }

    throw new Error(`Failed to deploy smart wallet: ${errorMessage}`)
  }
}

/**
 * Deploy a smart wallet if it's not already deployed
 *
 * @param client Client to use for deployment
 * @param userAddress User's wallet address
 * @param factoryAddress Factory contract address
 * @param factoryCalldata Deployment calldata
 * @returns True if deployment was needed and completed, false if already deployed
 */
export async function deployWalletIfNeeded(
  client: Client,
  userAddress: Address,
  factoryAddress: Address,
  factoryCalldata: Address
): Promise<boolean> {
  const deployed = await isWalletDeployed(client, userAddress)

  if (deployed) {
    return false
  }

  await deployWallet(client, userAddress, factoryAddress, factoryCalldata)

  // Verify deployment succeeded
  const nowDeployed = await isWalletDeployed(client, userAddress)
  if (!nowDeployed) {
    throw new Error(
      `Wallet deployment appeared to succeed but contract code not found at ${userAddress}`
    )
  }

  return true
}
