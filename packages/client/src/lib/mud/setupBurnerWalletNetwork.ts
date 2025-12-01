/*
 * The MUD client code is built on top of viem
 * (https://viem.sh/docs/getting-started.html).
 * This line imports the functions we need from it.
 */
import { createWalletClient, Hex, ClientConfig, parseEther } from "viem"

import { createBurnerAccount, transportObserver } from "@latticexyz/common"
import { transactionQueue } from "@latticexyz/common/actions"

import { SetupPublicNetworkResult, setupWalletNetwork } from "@ratfun/common/mud"
import { errorHandler, FaucetError } from "$lib/modules/error-handling"

export function setupBurnerWalletNetwork(publicNetwork: SetupPublicNetworkResult) {
  const networkConfig = publicNetwork.config

  /*
   * Create a temporary wallet and a viem client for it
   * (see https://viem.sh/docs/clients/wallet.html).
   */
  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex)

  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(publicNetwork.transport),
    pollingInterval: 2000 // Match public network polling to reduce RPC calls
  } as const satisfies ClientConfig

  const burnerWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount
  })

  burnerWalletClient.extend(transactionQueue())

  if (networkConfig.faucetServiceUrl) {
    setupDrip(
      publicNetwork.publicClient,
      networkConfig.faucetServiceUrl,
      burnerWalletClient.account.address
    )
  }

  return setupWalletNetwork(publicNetwork, burnerWalletClient)
}

async function setupDrip(
  publicClient: SetupPublicNetworkResult["publicClient"],
  faucetServiceUrl: string,
  address: Hex
) {
  /*
   * If there is a faucet, request (test) ETH if you have
   * less than 0.01 ETH. Repeat every 20 seconds to ensure you don't
   * run out.
   */
  console.info("[Dev Faucet]: Player address -> ", address)

  const requestDrip = async () => {
    const balance = await publicClient.getBalance({ address })
    console.info(`[Dev Faucet]: Player balance -> ${balance}`)
    const lowBalance = balance < parseEther("0.01")
    if (faucetServiceUrl && lowBalance) {
      console.info("[Dev Faucet]: Balance is low, dripping funds to player")
      // Drip
      await drip(faucetServiceUrl, address)
    }
  }

  async function drip(url: string, address: string): Promise<void> {
    const data = { address }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new FaucetError(`HTTP error! status: ${response.status}`)
      }

      await response.json()
    } catch (error) {
      errorHandler(error)
    }
  }

  requestDrip()
  setInterval(requestDrip, 20000)
}
