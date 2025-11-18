import { Client, Chain, Transport, Account, Address, LocalAccount } from "viem"
import { SmartAccount } from "viem/account-abstraction"

/**
 * A viem client with an account (connected wallet)
 */
export type ConnectedClient<chain extends Chain = Chain> = Client<Transport, chain, Account>

/**
 * Session client - ERC-4337 smart account extended with MUD World functionality
 *
 * This is a standard viem client with:
 * - SmartAccount (ERC-4337 account abstraction)
 * - MUD World extensions (callFrom, sendUserOperationFrom)
 * - Context properties (userAddress, worldAddress, internal_signer)
 *
 * Use this to call World systems on behalf of the user via delegation.
 */
export type SessionClient<chain extends Chain = Chain> = Client<Transport, chain, SmartAccount> & {
  /** Original user's wallet address (the delegator) */
  readonly userAddress: Address
  /** MUD World contract address - all calls are routed through this */
  readonly worldAddress: Address
  /** Session private key - used for signing messages on behalf of session account */
  readonly internal_signer: LocalAccount
}
