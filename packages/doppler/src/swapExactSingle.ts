import { Account, Chain, maxUint256, parseEventLogs, parseUnits, PublicClient, Transport, WalletClient, zeroAddress } from "viem"
import { CommandBuilder, V4ActionBuilder, V4ActionType } from 'doppler-router'
import { getAddresses } from "@whetstone-research/doppler-sdk";
import { AuctionParams } from "./readAuctionParams"
import { getPoolKey } from "./getPoolKey";
import { preparePermit2ForUniversalRouter } from "./permit2";
import { CustomQuoter } from "./CustomQuoter";

const universalRouterAbi = [{"inputs":[{"components":[{"internalType":"address","name":"permit2","type":"address"},{"internalType":"address","name":"weth9","type":"address"},{"internalType":"address","name":"v2Factory","type":"address"},{"internalType":"address","name":"v3Factory","type":"address"},{"internalType":"bytes32","name":"pairInitCodeHash","type":"bytes32"},{"internalType":"bytes32","name":"poolInitCodeHash","type":"bytes32"},{"internalType":"address","name":"v4PoolManager","type":"address"},{"internalType":"address","name":"v3NFTPositionManager","type":"address"},{"internalType":"address","name":"v4PositionManager","type":"address"}],"internalType":"struct RouterParameters","name":"params","type":"tuple"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"BalanceTooLow","type":"error"},{"inputs":[],"name":"ContractLocked","type":"error"},{"inputs":[{"internalType":"Currency","name":"currency","type":"address"}],"name":"DeltaNotNegative","type":"error"},{"inputs":[{"internalType":"Currency","name":"currency","type":"address"}],"name":"DeltaNotPositive","type":"error"},{"inputs":[],"name":"ETHNotAccepted","type":"error"},{"inputs":[{"internalType":"uint256","name":"commandIndex","type":"uint256"},{"internalType":"bytes","name":"message","type":"bytes"}],"name":"ExecutionFailed","type":"error"},{"inputs":[],"name":"FromAddressIsNotOwner","type":"error"},{"inputs":[],"name":"InputLengthMismatch","type":"error"},{"inputs":[],"name":"InsufficientBalance","type":"error"},{"inputs":[],"name":"InsufficientETH","type":"error"},{"inputs":[],"name":"InsufficientToken","type":"error"},{"inputs":[{"internalType":"bytes4","name":"action","type":"bytes4"}],"name":"InvalidAction","type":"error"},{"inputs":[],"name":"InvalidBips","type":"error"},{"inputs":[{"internalType":"uint256","name":"commandType","type":"uint256"}],"name":"InvalidCommandType","type":"error"},{"inputs":[],"name":"InvalidEthSender","type":"error"},{"inputs":[],"name":"InvalidPath","type":"error"},{"inputs":[],"name":"InvalidReserves","type":"error"},{"inputs":[],"name":"LengthMismatch","type":"error"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"NotAuthorizedForToken","type":"error"},{"inputs":[],"name":"NotPoolManager","type":"error"},{"inputs":[],"name":"OnlyMintAllowed","type":"error"},{"inputs":[],"name":"SliceOutOfBounds","type":"error"},{"inputs":[],"name":"TransactionDeadlinePassed","type":"error"},{"inputs":[],"name":"UnsafeCast","type":"error"},{"inputs":[{"internalType":"uint256","name":"action","type":"uint256"}],"name":"UnsupportedAction","type":"error"},{"inputs":[],"name":"V2InvalidPath","type":"error"},{"inputs":[],"name":"V2TooLittleReceived","type":"error"},{"inputs":[],"name":"V2TooMuchRequested","type":"error"},{"inputs":[],"name":"V3InvalidAmountOut","type":"error"},{"inputs":[],"name":"V3InvalidCaller","type":"error"},{"inputs":[],"name":"V3InvalidSwap","type":"error"},{"inputs":[],"name":"V3TooLittleReceived","type":"error"},{"inputs":[],"name":"V3TooMuchRequested","type":"error"},{"inputs":[{"internalType":"uint256","name":"minAmountOutReceived","type":"uint256"},{"internalType":"uint256","name":"amountReceived","type":"uint256"}],"name":"V4TooLittleReceived","type":"error"},{"inputs":[{"internalType":"uint256","name":"maxAmountInRequested","type":"uint256"},{"internalType":"uint256","name":"amountRequested","type":"uint256"}],"name":"V4TooMuchRequested","type":"error"},{"inputs":[],"name":"V3_POSITION_MANAGER","outputs":[{"internalType":"contract INonfungiblePositionManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"V4_POSITION_MANAGER","outputs":[{"internalType":"contract IPositionManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"commands","type":"bytes"},{"internalType":"bytes[]","name":"inputs","type":"bytes[]"}],"name":"execute","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes","name":"commands","type":"bytes"},{"internalType":"bytes[]","name":"inputs","type":"bytes[]"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"execute","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"msgSender","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolManager","outputs":[{"internalType":"contract IPoolManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"uniswapV3SwapCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"data","type":"bytes"}],"name":"unlockCallback","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}] as const
const swapEventAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"PoolId","name":"id","type":"bytes32"},{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"int128","name":"amount0","type":"int128"},{"indexed":false,"internalType":"int128","name":"amount1","type":"int128"},{"indexed":false,"internalType":"uint160","name":"sqrtPriceX96","type":"uint160"},{"indexed":false,"internalType":"uint128","name":"liquidity","type":"uint128"},{"indexed":false,"internalType":"int24","name":"tick","type":"int24"},{"indexed":false,"internalType":"uint24","name":"fee","type":"uint24"}],"name":"Swap","type":"event"}] as const

/**
 * Swap numeraire for token
 * @param amount exact amount in/out depending on `isOut`
 * @param isOut if false, give exact `amount` of numeraire, otherwise receive exact `amount` of tokens
 */
export async function swapExactSingle(
  publicClient: PublicClient<Transport, Chain>,
  walletClient: WalletClient<Transport, Chain, Account>,
  auctionParams: AuctionParams,
  amount: number | string,
  isOut: boolean = false,
) {
  if (publicClient.chain.id !== walletClient.chain.id) {
    throw new Error("public and wallet client chains mismatch")
  }
  const chainId = publicClient.chain.id

  const addresses = getAddresses(chainId)

  let amountIn: bigint
  if (isOut) {
    const quoter = new CustomQuoter(publicClient, chainId, auctionParams)
    const input = await quoter.quoteExactOutputV4(amount, true)

    amountIn = input.amountIn
  } else {
    amountIn = parseUnits(amount.toString(), auctionParams.numeraire.decimals)
  }

  // Build poolKey and zeroForOne as in the quoting example
  const poolKey = getPoolKey(auctionParams)
  const parsedAmount = parseUnits(amount.toString(), auctionParams.numeraire.decimals)
  const zeroForOne = !auctionParams.isToken0

  // Build V4 swap actions
  const actionBuilder = new V4ActionBuilder()
  // TODO minimum amount out/in? (what's currently 0n)
  if (isOut) {
    actionBuilder.addSwapExactOutSingle(poolKey, zeroForOne, parsedAmount, 0n, '0x')
  } else {
    console.log(amount)
    actionBuilder.addSwapExactInSingle(poolKey, zeroForOne, parsedAmount, 0n, '0x')
  }
  // Settle and take ensures outputs are transferred correctly
  actionBuilder.addAction(V4ActionType.SETTLE_ALL, [zeroForOne ? poolKey.currency0 : poolKey.currency1, maxUint256])
  actionBuilder.addAction(V4ActionType.TAKE_ALL,   [zeroForOne ? poolKey.currency1 : poolKey.currency0, 0n])

  const [actions, params] = actionBuilder.build()

  // If swapping native currency rather than an ERC20 token, skip permit and send value to router
  const swapFromNative = zeroForOne && poolKey.currency0 === zeroAddress

  const commandBuilder = new CommandBuilder()

  // Permit2
  if (!swapFromNative) {
    const { permit, permitSignature } = await preparePermit2ForUniversalRouter(
      publicClient,
      walletClient,
      zeroForOne ? poolKey.currency0 : poolKey.currency1,
      amountIn
    )
    commandBuilder.addPermit2Permit(permit, permitSignature)
  }

  // Encode Universal Router command
  commandBuilder.addV4Swap(actions, params)
  const [commands, inputs] = commandBuilder.build()

  // Execute
  const txHash = await walletClient.writeContract({
    address: addresses.universalRouter,
    abi: [
      ...universalRouterAbi,
      ...universalRouterErrors,
    ],
    functionName: 'execute',
    args: [commands, inputs],
    // Send ETH when swapping from native currency
    value: swapFromNative ? amountIn : 0n,
  })
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  
  const parsedLogs = parseEventLogs({
    abi: swapEventAbi,
    logs: receipt.logs
  })
  const swapLogs = parsedLogs.filter(({ eventName, args }) => eventName === "Swap" && args.liquidity > 0)
  return swapLogs
}

// Helps viem decode some common errors that aren't present in the abi
const universalRouterErrors = [
  {
    type: "error",
    name: "AllowanceExpired",
    inputs: [
      {
        name: "deadline",
        type: "uint256",
      },
    ]
  },
  {
    type: "error",
    name: "WrappedError",
    inputs: [
      {
        name: "target",
        type: "address",
      },
      {
        name: "selector",
        type: "bytes4",
      },
      {
        name: "reason",
        type: "bytes",
      },
      {
        name: "details",
        type: "bytes",
      }
    ]
  }
]