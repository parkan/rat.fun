import { erc20Abi, Hex, PublicClient } from "viem";

export async function getDecimals(publicClient: PublicClient, address: Hex) {
  return await publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'decimals',
    args: [],
  })
}

export async function getName(publicClient: PublicClient, address: Hex) {
  return await publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'name',
    args: [],
  })
}

export async function getSymbol(publicClient: PublicClient, address: Hex) {
  return await publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'symbol',
    args: [],
  })
}

export async function balanceOf(
  publicClient: PublicClient,
  address: Hex,
  holderAddress: Hex
) {
  return await publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [holderAddress],
  })
}