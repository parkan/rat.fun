import { Hex} from "viem"
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from "dotenv"
import { getClients } from "./utils/getClients";
import { readAuctionParams } from "../src/readAuctionParams";
import { promptChain } from "./utils/promptChain";
import { univ2getPairInfo, univ2getPairReserves, univ2removeLiquidity } from "../src/uniswapv2";
import { getAssetData } from "../src/getAssetData";
import { balanceOf } from "../src/erc20";

dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY as Hex

const account = privateKeyToAccount(PRIVATE_KEY)

const chain = promptChain()

const { publicClient, walletClient, sdk } = getClients(account, chain)

const auctionParams = await readAuctionParams(chain.id)
if (!auctionParams) throw new Error(`Auction params not found for chainId ${chain.id}`)

// 20% liquidity is expected to remain locked
const k = 20n

const assetData = await getAssetData(publicClient, chain.id, auctionParams.token.address)

const dynamicAuction = await sdk.getDynamicAuction(auctionParams.hookAddress)
const hookInfo = await dynamicAuction.getHookInfo()

const pairReserves = await univ2getPairReserves(publicClient, assetData.migrationPool)
const pairInfo = await univ2getPairInfo(publicClient, assetData.migrationPool)

// We have to remove enough liquidity to keep only `k` percent locked
const minNumeraireReserve = (hookInfo.totalProceeds * k) / 100n
const currentNumeraireReserve = auctionParams.isToken0 ? pairReserves.reserve1 : pairReserves.reserve0
if (currentNumeraireReserve <= minNumeraireReserve) {
  throw new Error(`current numeraire reserve ${currentNumeraireReserve} is not above expected minimum ${minNumeraireReserve}`)
}
const removableLiquidity = (currentNumeraireReserve - minNumeraireReserve) * pairInfo.totalSupply / currentNumeraireReserve

// Liquidity belonging to the current wallet
const pairBalance = await balanceOf(publicClient, assetData.migrationPool, walletClient.account.address)

// Whether the wallet has enough liquidity to remove to get to `k` percent locked
let balanceToRemove
if (pairBalance <= removableLiquidity) {
  console.log(`Suspiciously low pair balance ${pairBalance} compared to removable liquidity ${removableLiquidity}`)
  balanceToRemove = pairBalance
} else {
  balanceToRemove = removableLiquidity
}

if (balanceToRemove < BigInt(1e9)) {
  console.log(`balanceToRemove too low ${balanceToRemove}`)
  process.exit(1)
}

// Send transaction to v2 router
const txHash = await univ2removeLiquidity(
  publicClient,
  walletClient,
  assetData.migrationPool,
  auctionParams.token.address,
  auctionParams.numeraire.address,
  balanceToRemove,
  walletClient.account.address,

)
console.log(txHash)
await publicClient.waitForTransactionReceipt({ hash: txHash })
