import { base, baseSepolia } from "viem/chains"

const availableChains = [baseSepolia, base] as const

export function validateChain(chainId: number): (typeof availableChains)[number] {
  const chain = availableChains.find(({ id }) => id === chainId)
  if (!chain) {
    throw new Error(`Invalid chain id ${chainId}`)
  }
  return chain
}
