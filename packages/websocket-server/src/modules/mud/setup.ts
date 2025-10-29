/*
 * This file sets up all the definitions required for a MUD client.
 */

import { setupNetwork } from "./setupNetwork"

export type SetupResult = Awaited<ReturnType<typeof setup>>

export async function setup(
  privateKey: string,
  chainId: number
): Promise<{
  network: Awaited<ReturnType<typeof setupNetwork>>
}> {
  const network = await setupNetwork(privateKey, chainId)

  return {
    network
  }
}
