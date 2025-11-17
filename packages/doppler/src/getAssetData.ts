import { airlockAbi, getAddresses } from "@whetstone-research/doppler-sdk"
import { Hex, PublicClient } from "viem"

export async function getAssetData(publicClient: PublicClient, chainId: number, tokenAddress: Hex) {
  const [
    numeraire,
    timelock,
    governance,
    liquidityMigrator,
    poolInitializer,
    pool,
    migrationPool,
    numTokensToSell,
    totalSupply,
    integrator
  ] = await publicClient.readContract({
    address: getAddresses(chainId).airlock,
    abi: airlockAbi,
    functionName: "getAssetData",
    args: [tokenAddress]
  })

  return {
    numeraire,
    timelock,
    governance,
    liquidityMigrator,
    poolInitializer,
    pool,
    migrationPool,
    numTokensToSell,
    totalSupply,
    integrator
  }
}
