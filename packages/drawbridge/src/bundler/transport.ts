import { Chain, http } from "viem"
import { gasEstimator, type GasEstimates } from "./gasEstimator"

/**
 * Get bundler RPC transport for a chain
 *
 * Bundlers are special RPC endpoints that handle ERC-4337 user operations.
 * They submit user operations to the EntryPoint contract and handle gas sponsorship.
 *
 * The bundler URL must be configured in the chain's rpcUrls.bundler.http array.
 *
 * This transport is wrapped with a gas estimator that provides precise gas estimates
 * based on measured contract usage.
 *
 * @param chain Chain configuration with bundler RPC URL
 * @param gasEstimates Optional custom gas estimates for specific functions
 * @returns HTTP transport for the bundler with gas estimation
 * @throws If chain doesn't have a bundler RPC URL configured
 */
export function getBundlerTransport(chain: Chain, gasEstimates?: GasEstimates) {
  const bundlerHttpUrl = chain.rpcUrls.bundler?.http[0]

  if (bundlerHttpUrl) {
    // Wrap HTTP transport with gas estimator for precise gas estimation
    return gasEstimator(
      gasEstimates,
      http(bundlerHttpUrl, {
        onFetchRequest: async request => {
          // Log ALL bundler calls to identify rate limit sources
          try {
            if (request.body) {
              const clonedRequest = request.clone()
              const text = await clonedRequest.text()
              const body = JSON.parse(text)

              // Count calls for rate limit debugging
              if (body?.method) {
                console.log(`[Bundler RPC] ${body.method}`)
              }

              // Only log detailed gas when actually sending a user operation
              if (body?.method === "eth_sendUserOperation") {
                const userOp = body?.params?.[0]
                if (userOp) {
                  const callGas = BigInt(userOp.callGasLimit)
                  const verifyGas = BigInt(userOp.verificationGasLimit)
                  const preVerifyGas = BigInt(userOp.preVerificationGas)
                  const maxFee = BigInt(userOp.maxFeePerGas)
                  const priorityFee = BigInt(userOp.maxPriorityFeePerGas)

                  console.log("[Bundler] Sending user operation with gas:", {
                    callGasLimit: callGas.toString(),
                    verificationGasLimit: verifyGas.toString(),
                    preVerificationGas: preVerifyGas.toString(),
                    maxFeePerGas: (Number(maxFee) / 1e9).toFixed(3) + " gwei",
                    maxPriorityFeePerGas: (Number(priorityFee) / 1e9).toFixed(3) + " gwei"
                  })
                }
              }
            }
          } catch (e) {
            // Silently ignore parsing errors
          }
        }
      })
    )
  }

  throw new Error(`Chain ${chain.id} config did not include a bundler RPC URL.`)
}
