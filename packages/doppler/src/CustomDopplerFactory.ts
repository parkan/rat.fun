import { CreateDynamicAuctionParams, CreateParams, DopplerFactory, SupportedChainId } from "@whetstone-research/doppler-sdk";
import { Address, encodeAbiParameters } from "viem";

export class CustomDopplerFactory<C extends SupportedChainId = SupportedChainId> extends DopplerFactory<C> {
  async encodeCreateDynamicAuctionParams(params: CreateDynamicAuctionParams<C>): Promise<{
    createParams: CreateParams,
    hookAddress: Address,
    tokenAddress: Address
  }> {
    const result = await super.encodeCreateDynamicAuctionParams(params)
    result.createParams.governanceFactoryData = encodeAbiParameters(
      [
        { type: 'address' },
      ],
      [
        params.userAddress,
      ]
    )
    return result
  }
}