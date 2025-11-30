import { Chain, Hex, PublicClient, Transport } from "viem"
import { AbstractListener } from "./AbstractListener"
import { readERC20Allowance } from "./read"

const ALLOWANCE_INTERVAL = 60_000 // 1 minute

export class ERC20AllowanceListener extends AbstractListener<bigint> {
  constructor(
    protected publicClient: PublicClient<Transport, Chain>,
    protected ownerAddress: Hex,
    protected erc20Address: Hex,
    protected erc20SpenderAddress: Hex
  ) {
    super(publicClient, ownerAddress, ALLOWANCE_INTERVAL, 0n)
  }

  /**
   * Fetch ERC20 allowance
   */
  protected async fetchValue() {
    return await readERC20Allowance(
      this.publicClient,
      this.erc20Address,
      this.ownerAddress,
      this.erc20SpenderAddress
    )
  }
}
