import { Chain, http } from "viem"
import { logUserOperationCost } from "./logging"

/**
 * Get bundler RPC transport for a chain
 *
 * Bundlers are special RPC endpoints that handle ERC-4337 user operations.
 * They submit user operations to the EntryPoint contract and handle gas sponsorship.
 *
 * The bundler URL must be configured in the chain's rpcUrls.bundler.http array.
 *
 * @param chain Chain configuration with bundler RPC URL
 * @returns HTTP transport for the bundler
 * @throws If chain doesn't have a bundler RPC URL configured
 */
export function getBundlerTransport(chain: Chain) {
  const bundlerHttpUrl = chain.rpcUrls.bundler?.http[0]

  if (bundlerHttpUrl) {
    return http(bundlerHttpUrl, {
      onFetchRequest: async request => {
        try {
          if (request.body) {
            const clonedRequest = request.clone()
            const text = await clonedRequest.text()
            const body = JSON.parse(text)

            // Log user operation details when sending
            if (body?.method === "eth_sendUserOperation") {
              const userOp = body?.params?.[0]
              if (userOp) {
                logUserOperationCost(userOp)
              }
            }
          }
        } catch (e) {
          // Silently ignore parsing errors
        }
      }
    })
  }

  throw new Error(`Chain ${chain.id} config did not include a bundler RPC URL.`)
}
