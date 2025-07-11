/*
 * The supported chains.
 *
 * - mudFoundry, the chain running on anvil that pnpm dev
 *   starts by default. It is similar to the viem anvil chain
 *   (see https://viem.sh/docs/clients/test.html), but with the
 *   basefee set to zero to avoid transaction fees.
 *
 */

import {
  arbitrum,
  arbitrumNova,
  arbitrumSepolia,
  holesky,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia
} from "viem/chains"
import { MUDChain, mudFoundry } from "@latticexyz/common/chains"
import { base, baseSepolia } from "$lib/mud/chainConfigs"

export const supportedChains = [
  mudFoundry,
  mainnet,
  holesky,
  sepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia,
  arbitrum,
  arbitrumNova,
  arbitrumSepolia
] as const satisfies MUDChain[]
