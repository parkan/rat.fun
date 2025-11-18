import { Hex, encodeFunctionData, zeroAddress, Client, Address } from "viem"
import {
  sendUserOperation,
  waitForUserOperationReceipt,
  SmartAccount,
  UserOperationReceipt
} from "viem/account-abstraction"
import { waitForTransactionReceipt } from "viem/actions"
import { getAction } from "viem/utils"
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json"
import { systemsConfig as worldSystemsConfig } from "@latticexyz/world/mud.config"
import { unlimitedDelegationControlId, worldAbi, SessionClient, ConnectedClient } from "../../types"
import { callWithSignature } from "../patterns/call-with-signature"
import { deployWalletIfNeeded, isWalletDeployed } from "../patterns/wallet-deployment"

/**
 * Smart account with optional factory properties (internal use only)
 * Some smart account implementations add these properties dynamically
 */
type SmartAccountWithFactory = SmartAccount & {
  factory?: Address
  factoryData?: Hex
}

export type SetupSessionStatus =
  | { type: "checking_wallet"; message: string }
  | { type: "deploying_wallet"; message: string }
  | { type: "wallet_deployed"; message: string }
  | { type: "registering_delegation"; message: string }
  | { type: "deploying_session"; message: string }
  | { type: "complete"; message: string }
  | { type: "error"; message: string; error?: Error }

export type SetupSessionParams = {
  /** Public client for reading blockchain state */
  client: Client
  /** User's connected wallet client (EOA or Smart Account) */
  userClient: ConnectedClient
  /** Session smart account client with MUD extensions */
  sessionClient: SessionClient
  /** MUD World contract address */
  worldAddress: Hex
  /** Whether to register delegation (default: true) */
  registerDelegation?: boolean
  /** Progress callback for status updates */
  onStatus?: (status: SetupSessionStatus) => void
}

/**
 * Setup session by registering delegation and deploying session account
 *
 * Flow differs based on wallet type:
 *
 * **Smart Account Wallet:**
 * - Sends user operation to register delegation
 * - User's smart account submits the operation
 *
 * **EOA (Externally Owned Account):**
 * - Uses CallWithSignature pattern (gasless for user)
 * - User signs a message (EIP-712)
 * - Session account submits the signature + call
 * - World validates signature and executes as user
 *
 * **Finally:**
 * - Deploys session account if not yet deployed (via empty user operation)
 *
 * @param params Setup parameters
 */
export async function setupSession({
  client,
  userClient,
  sessionClient,
  worldAddress,
  registerDelegation = true,
  onStatus
}: SetupSessionParams): Promise<void> {
  const sessionAddress = sessionClient.account.address
  const userAddress = userClient.account.address

  console.log("[entrykit-drawbridge] Setup session:", {
    userAddress,
    accountType: userClient.account.type
  })

  if (userClient.account.type === "smart") {
    // ===== Smart Account Flow =====
    onStatus?.({ type: "checking_wallet", message: "Checking wallet status..." })

    // CHECK AND DEPLOY USER'S WALLET IF NEEDED
    const account = userClient.account as SmartAccountWithFactory
    const factoryArgs = await account.getFactoryArgs()
    const hasFactoryData = factoryArgs.factory && factoryArgs.factoryData

    console.log("[entrykit-drawbridge] Smart wallet check:", { hasFactoryData, userAddress })

    const alreadyDeployed = await isWalletDeployed(sessionClient, userAddress)

    if (alreadyDeployed && hasFactoryData) {
      // Wallet deployed but has factory data - remove it
      console.log("[entrykit-drawbridge] Removing factory data from deployed wallet")
      onStatus?.({ type: "wallet_deployed", message: "Wallet ready" })

      delete account.factory
      delete account.factoryData
      account.factory = undefined
      account.factoryData = undefined

      console.log("[entrykit-drawbridge] Factory removed:", { stillHasFactory: !!account.factory })
    } else if (!alreadyDeployed && hasFactoryData) {
      // Wallet not deployed - deploy it
      console.log("[entrykit-drawbridge] Deploying user wallet...")
      onStatus?.({ type: "deploying_wallet", message: "Deploying wallet (one-time setup)..." })

      await deployWalletIfNeeded(
        sessionClient,
        userAddress,
        factoryArgs.factory!,
        factoryArgs.factoryData!
      )

      onStatus?.({ type: "wallet_deployed", message: "Wallet deployed successfully!" })

      // Remove factory/factoryData after deployment
      delete account.factory
      delete account.factoryData
      account.factory = undefined
      account.factoryData = undefined

      console.log("[entrykit-drawbridge] Wallet deployed, factory removed")
    } else {
      onStatus?.({ type: "wallet_deployed", message: "Wallet ready" })
    }

    // Proceed with delegation registration
    const calls = []

    if (registerDelegation) {
      calls.push({
        to: worldAddress,
        abi: worldAbi,
        functionName: "registerDelegation",
        args: [sessionAddress, unlimitedDelegationControlId, "0x"]
      })
    }

    if (!calls.length) return

    onStatus?.({ type: "registering_delegation", message: "Setting up session..." })

    // Final check: if factory/factoryData still present, try aggressive removal
    const accountBeforeSend = userClient.account as SmartAccountWithFactory
    console.log("[entrykit-drawbridge] Before sendUserOperation:", {
      hasFactory: !!accountBeforeSend.factory,
      hasFactoryData: !!accountBeforeSend.factoryData
    })

    if (accountBeforeSend.factory || accountBeforeSend.factoryData) {
      console.warn("[entrykit-drawbridge] Factory still present, attempting aggressive removal...")

      try {
        Object.defineProperty(accountBeforeSend, "factory", {
          value: undefined,
          writable: true,
          configurable: true
        })
        Object.defineProperty(accountBeforeSend, "factoryData", {
          value: undefined,
          writable: true,
          configurable: true
        })
      } catch (err) {
        console.error("[entrykit-drawbridge] Could not remove factory (readonly property)")
      }
    }

    try {
      const hash = await getAction(userClient, sendUserOperation, "sendUserOperation")({ calls })
      console.log("[entrykit-drawbridge] User operation sent:", hash)

      const receipt = await getAction(
        userClient,
        waitForUserOperationReceipt,
        "waitForUserOperationReceipt"
      )({ hash })

      if (!receipt.success) {
        throw new Error("User operation failed during session setup")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("[entrykit-drawbridge] User operation error:", errorMessage)

      if (errorMessage.includes("AA10") || errorMessage.includes("already constructed")) {
        const helpfulError = new Error(
          "Smart wallet deployment conflict. Please try again - it should work on the second attempt."
        )
        onStatus?.({ type: "error", message: "Please try again", error: helpfulError })
        throw helpfulError
      }

      onStatus?.({ type: "error", message: "Session setup failed", error: error as Error })
      throw error
    }
  } else {
    // ===== EOA Flow (CallWithSignature) =====
    const txs: Hex[] = []

    if (registerDelegation) {
      const tx = await callWithSignature({
        client: sessionClient,
        userClient,
        sessionClient,
        worldAddress,
        systemId: worldSystemsConfig.systems.RegistrationSystem.systemId,
        callData: encodeFunctionData({
          abi: IBaseWorldAbi,
          functionName: "registerDelegation",
          args: [sessionAddress, unlimitedDelegationControlId, "0x"]
        })
      })
      txs.push(tx)
    }

    if (!txs.length) return

    for (const hash of txs) {
      const receipt = await getAction(
        client,
        waitForTransactionReceipt,
        "waitForTransactionReceipt"
      )({ hash })

      if (receipt.status === "reverted") {
        throw new Error("Delegation registration transaction reverted")
      }
    }
  }

  // ===== Deploy Session Account =====
  const sessionDeployed = await sessionClient.account.isDeployed?.()
  console.log("[entrykit-drawbridge] Session account deployed:", sessionDeployed)

  if (!sessionDeployed) {
    onStatus?.({ type: "deploying_session", message: "Finalizing session setup..." })

    try {
      const hash = await getAction(
        sessionClient,
        sendUserOperation,
        "sendUserOperation"
      )({
        calls: [{ to: zeroAddress }]
      })

      console.log("[entrykit-drawbridge] Session deploy tx:", hash)

      // Add timeout
      const receiptPromise = getAction(
        sessionClient,
        waitForUserOperationReceipt,
        "waitForUserOperationReceipt"
      )({ hash })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Session deployment timeout after 30s")), 30000)
      )

      const receipt = (await Promise.race([receiptPromise, timeoutPromise])) as UserOperationReceipt

      if (!receipt.success) {
        throw new Error("Failed to deploy session account")
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error("[entrykit-drawbridge] Session deployment error:", errorMsg)

      // Check if timeout but actually deployed
      if (errorMsg.includes("timeout")) {
        const nowDeployed = await sessionClient.account.isDeployed?.()
        if (nowDeployed) {
          console.log("[entrykit-drawbridge] Session deployed despite timeout")
          onStatus?.({ type: "complete", message: "Session setup complete!" })
          return
        }
      }

      onStatus?.({ type: "error", message: "Session deployment failed", error: error as Error })
      throw error
    }
  }

  console.log("[entrykit-drawbridge] Setup session complete")
  onStatus?.({ type: "complete", message: "Session setup complete!" })
}
