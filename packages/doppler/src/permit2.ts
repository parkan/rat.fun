import { getAddresses } from "@whetstone-research/doppler-sdk"
import { Account, Chain, erc20Abi, Hex, maxUint256, parseAbi, PublicClient, Transport, TypedData, WalletClient } from "viem"

const permit2Abi = parseAbi([
  'function allowance(address user, address token, address spender) external view returns (uint160 amount, uint48 expiration, uint48 nonce)'
])

const PERMIT2_PERMIT_TYPE: TypedData = {
  PermitDetails: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint160' },
    { name: 'expiration', type: 'uint48' },
    { name: 'nonce', type: 'uint48' },
  ],
  PermitSingle: [
    { name: 'details', type: 'PermitDetails' },
    { name: 'spender', type: 'address' },
    { name: 'sigDeadline', type: 'uint256' },
  ],
};

/**
 * Prepares permit2 data for uniswap v4 swaps via universal router
 */
export async function preparePermit2ForUniversalRouter(
  publicClient: PublicClient<Transport, Chain>,
  walletClient: WalletClient<Transport, Chain, Account>,
  tokenAddress: Hex,
  amount: bigint,
) {
  const addresses = getAddresses(publicClient.chain.id)

  return await preparePermit2(publicClient, walletClient, tokenAddress, addresses.universalRouter, amount)
}

/**
 * Prepares permit2 data
 * - The permit2 contract itself can require approval (generally one time per wallet)
 * - Then only a signature to approve the router is requested
 */
export async function preparePermit2(
  publicClient: PublicClient<Transport, Chain>,
  walletClient: WalletClient<Transport, Chain, Account>,
  tokenAddress: Hex,
  spender: Hex,
  amount: bigint,
) {
  if (publicClient.chain.id !== walletClient.chain.id) {
    throw new Error("public and wallet client chains mismatch")
  }

  const addresses = getAddresses(publicClient.chain.id)

  // Give permit2 contract max allowance via token contract if missing
  // (this could be always present due to the wallet using uniswap itself, since permit2 is a global contract)
  const allowance = await publicClient.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [walletClient.account.address, addresses.permit2],
  })
  if (allowance < maxUint256) {
    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [addresses.permit2, maxUint256],
    })
    // TODO the manual 2 sec timeout isn't really necessary, but it helped avoid rpc issues
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await publicClient.waitForTransactionReceipt({ hash: txHash })
  }

  // Get account's current permit2 nonce, as stored in the permit2 contract (not related to transaction nonce)
  const permit2Allowance = await publicClient.readContract({
    address: addresses.permit2,
    abi: permit2Abi,
    functionName: 'allowance',
    args: [walletClient.account.address, tokenAddress, addresses.universalRouter],
  })
  const nonce = BigInt(permit2Allowance[2])

  // Permit router to spend tokens
  const nowSec = BigInt(Math.floor(Date.now() / 1000))
  const permit = {
    details: {
      token: tokenAddress,
      amount,
      expiration: nowSec + 3600n,
      nonce: nonce,
    },
    spender: spender,
    sigDeadline: nowSec + 3600n,
  } as const

  const permitSignature = await walletClient.signTypedData({
    account: walletClient.account,
    domain: {
      name: 'Permit2',
      chainId: publicClient.chain.id,
      verifyingContract: addresses.permit2,
    },
    types: PERMIT2_PERMIT_TYPE,
    primaryType: 'PermitSingle',
    message: permit,
  });

  return { permit, permitSignature }
}