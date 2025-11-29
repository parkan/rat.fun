<script lang="ts">
  import { get } from "svelte/store"
  import { formatUnits } from "viem"
  import type { GetProofReturnType } from "merkle-tree-airdrop"
  import { BigButton } from "$lib/components/Shared"
  import { prepareConnectorClientForTransaction } from "$lib/modules/drawbridge/connector"
  import { ERC20AirdropMerkleProofAbi } from "contracts/externalAbis"
  import { userAddress } from "$lib/modules/drawbridge"
  import { networkConfig } from "$lib/network"

  let {
    proof
  }: {
    proof: GetProofReturnType
  } = $props()

  async function sendClaim() {
    if (!$userAddress) throw new Error("wallet not connected")

    const config = get(networkConfig)
    if (!config) throw new Error("network not initialized")

    const client = await prepareConnectorClientForTransaction()
    client.writeContract({
      address: config.airdropContractAddress,
      abi: ERC20AirdropMerkleProofAbi,
      functionName: "claim",
      args: [$userAddress, proof.value, proof.proof]
    })
  }
</script>

<div>
  available: {formatUnits(proof.value, 18)}

  <BigButton
    text="Claim"
    onclick={() => {
      sendClaim()
    }}
  />
</div>

<style lang="scss">
</style>
