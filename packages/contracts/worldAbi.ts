import _IWorldAbi from "./out/IWorld.sol/IWorld.abi.json" with { type: "json" }
import IRatERC20Abi from "./out/RatERC20.sol/RatERC20.abi.json" with { type: "json" }

// add erc20 abi for better reporting of its events/errors
export const IWorldAbi = [
  ..._IWorldAbi,
  ...IRatERC20Abi.filter(({ type }: { type: string }) => type !== "function")
] as typeof _IWorldAbi
