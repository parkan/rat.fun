import { Chain, Hex, PublicClient, Transport } from "viem"
import { AbstractListener } from "./AbstractListener"

const BALANCE_INTERVAL = 10_000 // 10 seconds

export class ETHBalanceListener extends AbstractListener<bigint> {
  constructor(
    protected publicClient: PublicClient<Transport, Chain>,
    protected ownerAddress: Hex
  ) {
    super(publicClient, ownerAddress, BALANCE_INTERVAL, 0n)
  }

  /**
   * Fetch owner account ETH balance
   */
  protected async fetchValue() {
    return await this.publicClient.getBalance({ address: this.ownerAddress })
  }
}
