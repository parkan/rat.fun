/*
 * Network specific configuration for the client.
 * By default connect to the anvil test network.
 *
 */

import { MUDChain } from "@latticexyz/common/chains"
import { getChain } from "./utils"
import { ENVIRONMENT } from "./enums"
import { ChainNotFoundError } from "../error-handling/errors"

export interface BasicNetworkConfig {
  chainId: number
  chain: MUDChain
}

export interface ChainRpcUrls {
  http: readonly string[]
  webSocket?: readonly string[] | undefined
}

export function getBasicNetworkConfig(
  environment: ENVIRONMENT,
  overrideDefaultRpcUrls: ChainRpcUrls | null = null
): BasicNetworkConfig {
  // Default to local development chain
  let chainId = 31337

  switch (environment) {
    case ENVIRONMENT.BASE_SEPOLIA:
      chainId = 84532
      break
    case ENVIRONMENT.BASE:
      chainId = 8453
      break
    default:
      chainId = 31337
      break
  }

  const chain = getChain(chainId)

  if (!chain) {
    throw new ChainNotFoundError(chainId.toString())
  }

  return {
    chainId,
    chain: {
      ...chain,
      rpcUrls: {
        default: overrideDefaultRpcUrls ?? chain.rpcUrls.default
      }
    }
  }
}
