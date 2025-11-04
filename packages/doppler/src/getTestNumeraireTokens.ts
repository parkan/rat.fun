import { Account, Chain, Transport, WalletClient } from "viem"
import { SupportedChainId } from "@whetstone-research/doppler-sdk"
import { getNumeraire } from "./getNumeraire"

/**
 * Get free tokens for TestNumeraireToken
 */
export async function getTestNumeraireTokens(
  walletClient: WalletClient<Transport, Chain, Account>,
  amount: bigint,
) {
  const numeraire = getNumeraire(walletClient.chain.id as SupportedChainId)
  return await walletClient.writeContract({
    address: numeraire,
    abi: [
      {
        "type": "function",
        "name": "getTokens",
        "inputs": [
          {
            "name": "receiver",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "amount",
            "type": "uint256",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      }
    ] as const,
    functionName: 'getTokens',
    args: [walletClient.account.address, amount],
  })
}
