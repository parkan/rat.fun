import { erc20Abi } from "viem"
import mainSaleAbi from "contracts/out/MainSale.sol/MainSale.abi.json"
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json" with { type: "json" }

export const ABIS = [erc20Abi, mainSaleAbi, IWorldAbi]
