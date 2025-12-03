import { erc20Abi, Hex } from "viem"
import { SetupPublicNetworkResult } from "@ratfun/common/mud"

/**
 * Read the ERC20 balance for a given address
 * @param publicNetwork - The public network to read the balance from
 * @param address - The address to read the balance for
 * @param erc20Address - The address of the ERC20 token to read the balance for
 * @returns The balance of the address's ERC20 token
 */
export async function readERC20Balance(
  publicNetwork: SetupPublicNetworkResult,
  address: Hex,
  erc20Address: Hex
): Promise<number> {
  const balance = await publicNetwork.publicClient.readContract({
    address: erc20Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address]
  })

  console.log("readERC20Balance", erc20Address, address)

  return Number(balance / 10n ** 18n)
}

/**
 * Read ERC20 balances for multiple addresses
 * @param publicNetwork - The public network to read the balances from
 * @param addresses - The addresses to read the balances for
 * @param erc20Address - The address of the ERC20 token to read the balances for
 * @returns A map of address to balance
 */
export async function readMultipleERC20Balances(
  publicNetwork: SetupPublicNetworkResult,
  addresses: Hex[],
  erc20Address: Hex
): Promise<Record<string, number>> {
  const balances: Record<string, number> = {}

  // Fetch all balances in parallel
  const balancePromises = addresses.map(async address => {
    try {
      const balance = await readERC20Balance(publicNetwork, address, erc20Address)
      return { address, balance }
    } catch (error) {
      console.error(`Failed to fetch ERC20 balance for ${address}:`, error)
      return { address, balance: 0 }
    }
  })

  const results = await Promise.all(balancePromises)

  // Convert array to record
  results.forEach(({ address, balance }) => {
    balances[address] = balance
  })

  return balances
}
