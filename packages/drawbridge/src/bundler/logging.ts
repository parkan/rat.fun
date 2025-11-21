/**
 * Logging for user operation gas and cost tracking
 */

import { formatGwei, formatEther } from "viem"

const APPROXIMATE_CURRENT_ETH_PRICE = 2800

/**
 * Log user operation gas estimates and USD cost
 */
export function logUserOperationCost(userOp: {
  callGasLimit: string | bigint
  verificationGasLimit: string | bigint
  preVerificationGas: string | bigint
  paymasterVerificationGasLimit?: string | bigint
  paymasterPostOpGasLimit?: string | bigint
  maxFeePerGas: string | bigint
  maxPriorityFeePerGas: string | bigint
}): void {
  const callGas = BigInt(userOp.callGasLimit)
  const verificationGas = BigInt(userOp.verificationGasLimit)
  const preVerificationGas = BigInt(userOp.preVerificationGas)
  const paymasterVerificationGas = BigInt(userOp.paymasterVerificationGasLimit || 0)
  const paymasterPostOpGas = BigInt(userOp.paymasterPostOpGasLimit || 0)
  const maxFeePerGas = BigInt(userOp.maxFeePerGas)
  const maxPriorityFeePerGas = BigInt(userOp.maxPriorityFeePerGas)

  const totalGas =
    callGas + verificationGas + preVerificationGas + paymasterVerificationGas + paymasterPostOpGas

  // Calculate max cost in ETH and USD
  const maxCostWei = totalGas * maxFeePerGas
  const maxCostETH = formatEther(maxCostWei)
  const maxCostUSD = Number(maxCostETH) * APPROXIMATE_CURRENT_ETH_PRICE

  console.log("┌─ User Operation Gas & Cost ────────────────────────")
  console.log("│")
  console.log("│ Gas Estimates:")
  console.log("│   callGasLimit:                ", callGas.toString().padStart(7), "gas")
  console.log("│   verificationGasLimit:        ", verificationGas.toString().padStart(7), "gas")
  console.log("│   preVerificationGas:          ", preVerificationGas.toString().padStart(7), "gas")
  if (paymasterVerificationGas > 0n) {
    console.log(
      "│   paymasterVerificationGasLimit:",
      paymasterVerificationGas.toString().padStart(7),
      "gas"
    )
  }
  if (paymasterPostOpGas > 0n) {
    console.log(
      "│   paymasterPostOpGasLimit:     ",
      paymasterPostOpGas.toString().padStart(7),
      "gas"
    )
  }
  console.log("│   ─────────────────────────────────────────────")
  console.log("│   Total gas:                   ", totalGas.toString().padStart(7), "gas")
  console.log("│")
  console.log("│ Fee Parameters:")
  console.log("│   maxFeePerGas:                ", formatGwei(maxFeePerGas), "gwei")
  console.log("│   maxPriorityFeePerGas:        ", formatGwei(maxPriorityFeePerGas), "gwei")
  console.log("│")
  console.log("│ Estimated Max Cost:")
  console.log("│   ETH:  ", maxCostETH, "ETH")
  console.log(
    "│   USD:  $" + maxCostUSD.toFixed(2),
    "(at $" + APPROXIMATE_CURRENT_ETH_PRICE + " ETH)"
  )
  console.log("│")
  console.log("└────────────────────────────────────────────────────")
}
