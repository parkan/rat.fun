# Farcaster MiniApp Wallet - UnsupportedProviderMethodError Debug

## Error Summary

```
UnsupportedProviderMethodError: The provider does not support the requested method.
Details: The provider does not support the requested method.
Version: viem@2.39.0
```

Occurs when users connect with the Farcaster internal wallet (`xyz.farcaster.MiniAppWallet`) during the allowance approval flow.

---

## Root Cause Analysis

### The Problem

The error occurs when the **Farcaster MiniApp wallet** is used. The flow:

1. User connects via Farcaster MiniApp → wallet detected via `injected()` connector
2. User clicks "AUTHORIZE REWIRING" → `AllowanceLoading.svelte` mounts
3. Component calls `approveMax()` → `executeTransaction(WorldFunctions.Approve, ...)`
4. **Critical path**: Since `walletType === WALLET_TYPE.DRAWBRIDGE`, `useConnectorClient = true`
5. `prepareConnectorClientForTransaction()` is called → returns the raw wagmi connector client
6. `client.writeContract()` is called on the ERC20 contract for approval

### The Root Cause

The issue is **NOT** with the session client (Drawbridge) - it's with the **raw wagmi connector client** when calling `writeContract` on the Farcaster MiniApp provider.

Looking at `executeTransaction.ts:33-35`:

```typescript
const client: WalletTransactionClient = useConnectorClient
  ? await prepareConnectorClientForTransaction()  // ← Uses raw wagmi connector
  : get(walletNetwork).walletClient               // ← Uses Drawbridge session client
```

For `Approve` operations, it uses `useConnectorClient = true`, meaning it goes through the **raw wagmi connector client**, not the Drawbridge session client.

The Farcaster MiniApp wallet provider (exposed via `window.ethereum` or `sdk.wallet.getEthereumProvider()`) has **limited RPC method support**. When viem's `writeContract` is called, it internally tries to:

1. Call `eth_estimateGas` to estimate gas
2. Call `eth_sendTransaction` to send the transaction

The Farcaster wallet likely doesn't support `eth_estimateGas` (or possibly other preparatory methods like `eth_call`), causing the `UnsupportedProviderMethodError`.

### Evidence

From the Viem documentation:

> Wallet Client doesn't support public actions because wallet providers (Injected window.ethereum, WalletConnect v2, etc.) may not provide a large majority of "node"/"public" RPC methods like eth_call, eth_newFilter, eth_getLogs, etc. This is because these methods are not required for a wallet provider to function properly.

---

## Fix Options

### Option 1: Use the Official Farcaster MiniApp Connector (Recommended)

**Problem**: Using the generic `injected()` connector which doesn't handle Farcaster-specific quirks.

**Solution**: Install and use `@farcaster/miniapp-wagmi-connector`

```bash
pnpm add @farcaster/miniapp-wagmi-connector
```

Update `packages/client/src/lib/modules/drawbridge/getConnectors.ts`:

```typescript
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { sdk } from '@farcaster/miniapp-sdk'

export function getConnectors(): CreateConnectorFn[] {
  const connectors: CreateConnectorFn[] = []

  // Check if we're in a Farcaster Mini App context
  const isFarcasterMiniApp = typeof window !== 'undefined' && sdk?.context?.client?.clientFid

  if (isFarcasterMiniApp) {
    // Use official Farcaster connector for Mini Apps
    connectors.push(farcasterMiniApp())
  } else {
    // Standard injected connector for other environments
    connectors.push(injected())
  }

  // ... rest of connectors
}
```

The official connector may properly handle the limited RPC methods.

---

### Option 2: Configure Gas Manually for Approve Transactions

**Problem**: `writeContract` calls `eth_estimateGas` which isn't supported.

**Solution**: Provide explicit gas limits to bypass gas estimation:

Update `packages/client/src/lib/modules/on-chain-transactions/executeTransaction.ts`:

```typescript
if (systemId === WorldFunctions.Approve) {
  if (params.length === 2) {
    tx = await client.writeContract({
      address: get(externalAddressesConfig).erc20Address,
      abi: erc20Abi,
      functionName: "approve",
      args: params as [`0x${string}`, bigint],
      gas: 60_000n  // ERC20 approve typically needs ~46k gas, use 60k for safety
    })
  }
}
```

---

### Option 3: Use Separate Public Client for Gas Estimation

**Problem**: The wallet provider can't estimate gas.

**Solution**: Use the public client (with RPC transport) for gas estimation, then only use the wallet for signing:

```typescript
import { encodeFunctionData } from 'viem'

// In executeTransaction.ts
if (systemId === WorldFunctions.Approve) {
  const publicClient = get(publicNetwork).publicClient

  // Estimate gas using public RPC (not wallet provider)
  const gas = await publicClient.estimateGas({
    account: client.account.address,
    to: get(externalAddressesConfig).erc20Address,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: params as [`0x${string}`, bigint]
    })
  })

  tx = await client.writeContract({
    address: get(externalAddressesConfig).erc20Address,
    abi: erc20Abi,
    functionName: "approve",
    args: params as [`0x${string}`, bigint],
    gas: gas + (gas / 10n)  // Add 10% buffer
  })
}
```

---

### Option 4: Detect Farcaster Wallet and Route Differently

Add detection for the Farcaster wallet and use a different transaction path:

```typescript
// In getConnectors.ts, add detection
export function isFarcasterMiniAppWallet(): boolean {
  if (typeof window === 'undefined') return false
  const eth = window.ethereum as any
  // Farcaster injects as xyz.farcaster.MiniAppWallet
  return eth?.isFrame || eth?.isFarcaster || navigator.userAgent.includes('Farcaster')
}
```

Then in transaction handling, use `wallet_sendCalls` (EIP-5792) which Farcaster explicitly supports:

```typescript
// Use useSendCalls for Farcaster wallets
import { useSendCalls } from 'wagmi/experimental'
```

---

## Recommended Implementation Order

1. **Quick Fix (Option 2)**: Add explicit gas limit to approve transactions - lowest risk, immediate fix
2. **Proper Fix (Option 1)**: Add official `@farcaster/miniapp-wagmi-connector` - better long-term solution
3. **Enhancement (Option 3/4)**: Add robust wallet detection and use EIP-5792 `wallet_sendCalls` for batch operations

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/client/src/lib/modules/drawbridge/getConnectors.ts` | Wallet connector configuration |
| `packages/client/src/lib/modules/drawbridge/connector.ts` | `prepareConnectorClientForTransaction()` |
| `packages/client/src/lib/modules/on-chain-transactions/executeTransaction.ts` | Transaction execution logic |
| `packages/client/src/lib/modules/on-chain-transactions/index.ts` | `approveMax()` function |
| `packages/client/src/lib/components/Spawn/Allowance/Loading/AllowanceLoading.svelte` | UI component that triggers approval |

---

## Sources

- [Farcaster MiniApp Wallet Guide](https://miniapps.farcaster.xyz/docs/guides/wallets)
- [Farcaster MiniApp SDK Changelog](https://miniapps.farcaster.xyz/docs/sdk/changelog)
- [@farcaster/miniapp-wagmi-connector npm](https://www.npmjs.com/package/@farcaster/miniapp-wagmi-connector)
- [Viem FAQ on Wallet Client Limitations](https://viem.sh/docs/faq)
- [Wagmi writeContract](https://wagmi.sh/core/api/actions/writeContract)
