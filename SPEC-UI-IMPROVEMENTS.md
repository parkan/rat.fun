# UI Improvements Spec: NFT Export/Import, Challenges, and Flat Trip Structure

## Overview

This spec outlines three major UI improvements for rat.fun:

1. Enhanced NFT export/import flow with confirmation states
2. Improved challenge mechanism visibility and layout
3. Abolishing folders in favor of a flat trip list structure

---

## 1. NFT Export/Import UI Improvements

### Current State

- NFT export is triggered from inventory items via `sendExportItemToNFT()`
- No confirmation step before export
- No dedicated UI for importing NFTs back to inventory
- NFT contract: "RAT.FUN PSYCHO OBJECT" (PSYOBJ) at `packages/contracts/src/external/ItemNFT.sol`

### 1.1 NFT Export Confirmation Flow

**Goal**: Add a confirmation state before exporting items to NFT, similar to the liquidation confirmation flow.

#### New RatBox State

Add to `RAT_BOX_STATE` enum in `packages/client/src/lib/components/Rat/state.svelte.ts`:

```typescript
CONFIRM_EXPORT_NFT = "CONFIRM_EXPORT_NFT"
```

#### State Transitions

Update `VALID_TRANSITIONS`:

```typescript
[RAT_BOX_STATE.HAS_RAT]: [
  RAT_BOX_STATE.NO_RAT,
  RAT_BOX_STATE.CONFIRM_LIQUIDATION,
  RAT_BOX_STATE.CONFIRM_EXPORT_NFT,      // New
  RAT_BOX_STATE.IMPORTING_OBJECTS_FROM_NFT, // New (see 1.2)
  RAT_BOX_STATE.PAST_TRIP_LIST,
  RAT_BOX_STATE.ERROR
],
[RAT_BOX_STATE.CONFIRM_EXPORT_NFT]: [     // New
  RAT_BOX_STATE.HAS_RAT,                  // Cancel
  RAT_BOX_STATE.ERROR
]
```

#### New Component: `ConfirmExportNFT.svelte`

Location: `packages/client/src/lib/components/Rat/ConfirmExportNFT.svelte`

**Props**:

- `itemId: string` - The item entity ID to export
- `itemName: string` - Display name
- `itemValue: number` - Item value (determines rarity color in NFT)

**UI Elements**:

- Header: "EXPORT TO NFT"
- Item preview (name, value, rarity indicator)
- Warning text: "This will remove the item from your RAT's inventory and mint it as an NFT to your wallet."
- Information about rarity colors:
  - Purple: ≥100 value
  - Yellow: ≥50 value
  - Gray: ≥20 value
  - Brown: <20 value
- Confirm button: "EXPORT" (triggers `sendExportItemToNFT()`)
- Cancel button: "CANCEL" (returns to HAS_RAT state)

#### State Management

Store selected item for export in `ratState`:

```typescript
ratState.exportItem = {
  itemId: string | null,
  itemName: string | null,
  itemValue: number | null,
  set: (id, name, value) => { ... },
  clear: () => { ... }
}
```

#### Flow

1. User clicks "Export" on an inventory item
2. Call `ratState.exportItem.set(itemId, itemName, itemValue)`
3. Call `ratState.state.transitionTo(RAT_BOX_STATE.CONFIRM_EXPORT_NFT)`
4. User sees confirmation screen with item details
5. On confirm: execute `sendExportItemToNFT()`, transition to HAS_RAT on success
6. On cancel: call `ratState.exportItem.clear()`, transition to HAS_RAT

---

### 1.2 NFT Import Flow

**Goal**: Allow operators with NFTs in their wallet to import them back to their RAT's inventory.

#### New RatBox State

Add to `RAT_BOX_STATE` enum:

```typescript
IMPORTING_OBJECTS_FROM_NFT = "IMPORTING_OBJECTS_FROM_NFT"
```

#### State Transitions

```typescript
[RAT_BOX_STATE.HAS_RAT]: [
  // ... existing
  RAT_BOX_STATE.IMPORTING_OBJECTS_FROM_NFT  // New
],
[RAT_BOX_STATE.IMPORTING_OBJECTS_FROM_NFT]: [  // New
  RAT_BOX_STATE.HAS_RAT,  // Cancel or after import
  RAT_BOX_STATE.ERROR
]
```

#### NFT Detection Store

Location: `packages/client/src/lib/modules/nft/stores.ts` (new file)

```typescript
import { derived, writable } from "svelte/store"
import { playerAddress } from "$lib/modules/wallet/stores"
import { createLogger } from "$lib/modules/logger"

const logger = createLogger("[NFTStore]")

interface OwnedNFT {
  tokenId: bigint
  itemId: string // MUD entity ID for import
  itemName: string
  itemValue: number
}

export const playerOwnedNFTs = writable<OwnedNFT[]>([])
export const hasOwnedNFTs = derived(playerOwnedNFTs, $nfts => $nfts.length > 0)

// Fetch function using ERC721Enumerable
export async function fetchPlayerNFTs(address: string, nftContract: Contract): Promise<void> {
  try {
    const balance = await nftContract.balanceOf(address)
    const nfts: OwnedNFT[] = []

    for (let i = 0; i < balance; i++) {
      const tokenId = await nftContract.tokenOfOwnerByIndex(address, i)
      const itemId = await nftContract.itemIds(tokenId)
      const itemName = await nftContract.itemNames(tokenId)
      const itemValue = await nftContract.itemValues(tokenId)

      nfts.push({
        tokenId,
        itemId: itemId.toString(),
        itemName,
        itemValue: Number(itemValue)
      })
    }

    playerOwnedNFTs.set(nfts)
    logger.log("Fetched player NFTs:", { count: nfts.length })
  } catch (error) {
    logger.error("Failed to fetch NFTs:", error)
    playerOwnedNFTs.set([])
  }
}
```

#### UI Changes to RatInfo Component

**Current**: Shows "Total Value" calculation
**New**: Replace with "IMPORT" button when player has NFTs

Location: `packages/client/src/lib/components/Rat/RatInfo.svelte`

```svelte
{#if $hasOwnedNFTs}
  <button
    class="import-nfts-button"
    onclick={() => ratState.state.transitionTo(RAT_BOX_STATE.IMPORTING_OBJECTS_FROM_NFT)}
  >
    IMPORT ({$playerOwnedNFTs.length})
  </button>
{:else}
  <!-- Keep existing total value display -->
{/if}
```

#### Remove Current Item NFTs Box

The current item NFT display (if any) should be removed as this functionality will be handled entirely in the new `IMPORTING_OBJECTS_FROM_NFT` state.

#### New Component: `ImportNFTs.svelte`

Location: `packages/client/src/lib/components/Rat/ImportNFTs.svelte`

**Layout** (full RatBox size):

```
┌─────────────────────────────────────┐
│  IMPORT PSYCHO OBJECTS              │
│  ─────────────────────────────────  │
│ ┌─────────────────────────────────┐ │
│ │  Scrollable NFT List            │ │
│ │  ┌───────────────────────────┐  │ │
│ │  │ [Rarity] ItemName    100  │  │ │
│ │  │              [IMPORT]     │  │ │
│ │  └───────────────────────────┘  │ │
│ │  ┌───────────────────────────┐  │ │
│ │  │ [Rarity] ItemName2    50  │  │ │
│ │  │              [IMPORT]     │  │ │
│ │  └───────────────────────────┘  │ │
│ │  ...                            │ │
│ └─────────────────────────────────┘ │
│                                     │
│  [BACK]                             │
└─────────────────────────────────────┘
```

Use signature Back button to create the back button here
Location: `packages/client/src/lib/components/Shared/Buttons/BackButton.svelte`

**Features**:

- Full RatBox height utilization
- Scrollable list of all NFTs in wallet
- Each item shows:
  - Rarity indicator (color based on value)
  - Item name
  - Item value
  - Individual "IMPORT" button
- Back button returns to HAS_RAT state
- Import button:
  - Disabled if RAT inventory is full (6 items max per `MAX_INVENTORY_SIZE`)
  - Calls `sendImportNFTToItem(ratId, tokenId)`
  - On success, refresh NFT list and stay in state (allows multiple imports)
  - When list becomes empty, auto-transition to HAS_RAT

---

## 2. Challenge Mechanism UI Improvements

### Current State

- Challenge folder item shows: title, countdown, attempt count
- No visibility into challenge creator or max reward
- Folders displayed in a grid layout
- Challenge computed from `activeChallenge` entity and block numbers

### 2.1 Challenge Expiry Helper

**Goal**: Make challenge expiry status easily accessible across the app.

Location: `packages/client/src/lib/modules/state/stores.ts`

Add the following

```typescript
import { derived } from "svelte/store"
import { entities, currentBlockNumber } from "$lib/modules/state/stores"
import { CHALLENGE_ACTIVE_PERIOD_BLOCKS } from "$lib/modules/state/constants"

export const BLOCK_TIME_MS = 2000 // Base L2 block time

// construct the ChallengeInfo interface from Trip with the extra properties. NB: Do not store the interface in this file!

export const challengeInfo = derived(
  [entities, currentBlockNumber],
  ([$entities, $currentBlock]): ChallengeInfo => {
    const activeChallenge = getActiveChallenge($entities)

    if (!activeChallenge) {
      return {
        tripId: null,
        isActive: false,
        creationBlock: null,
        expirationBlock: null,
        blocksRemaining: 0,
        timeRemainingMs: 0,
        creatorName: null,
        creatorAddress: null,
        maxReward: null,
        attemptCount: 0,
        canCreateNewChallenge: true
      }
    }

    const trip = $entities.trips[activeChallenge.tripId]
    const creationBlock = Number(trip.creationBlock)
    const expirationBlock = creationBlock + CHALLENGE_ACTIVE_PERIOD_BLOCKS
    const blocksRemaining = Math.max(0, expirationBlock - $currentBlock)
    const isActive = blocksRemaining > 0

    // Get creator info from trip
    const creator = $entities.players[trip.creatorId]

    return {
      tripId: activeChallenge.tripId,
      isActive,
      creationBlock,
      expirationBlock,
      blocksRemaining,
      timeRemainingMs: blocksRemaining * BLOCK_TIME_MS,
      creatorName: creator?.name ?? null,
      creatorAddress: trip.creatorId,
      maxReward: Number(trip.balance), // Full balance is max reward at 100%
      attemptCount: Number(trip.visitCount),
      canCreateNewChallenge: !isActive
    }
  }
)
```

### 2.2 Enhanced Challenge Display

**Goal**: Make challenge creator and max reward more prominent.

Location: Update `ChallengeFolderItem.svelte` → rename to `ChallengeCard.svelte`

**Layout Changes**:

```
Keep existing layout, but add two missing things:
Max reward, and trip creator
```

**Props Update**:

```typescript
let {
  challengeTripId,
  attemptCount,
  challengeCreationBlock,
  currentBlockNumber,
  challengeTitle,
  lastWinnerName,
  lastWinTimestamp,
  // New props
  creatorName,
  maxReward
}: { ... } = $props()
```

**Styling**:

- Keep existing restricted folder styling (purple theme, tot2.png background)
- Make creator name prominent (larger font, highlighted)
- Show max reward in currency symbol format
- Keep countdown timer visible

### 2.3 Challenge Always On Top

**Goal**: Challenge card should be fixed at top, not scrollable with other trips.

See Section 3 for the complete layout restructure.

---

## 3. Abolish Folders - Flat Trip Structure

### Current State

- Trips organized into folders (from Sanity CMS)
- Grid layout with folder tiles
- Click folder → see trips in that folder
- Restricted folder for challenges

### 3.1 New Trip Listing Layout

**Goal**: Replace folder grid with a flat, scrollable list of all trips. Challenge stays pinned at top.

Location: `packages/client/src/lib/components/Trip/TripListing/TripListing.svelte`

**New Layout**:

```
┌─────────────────────────────────────────────┐
│  CHALLENGE (Fixed, not scrollable)          │
│  ┌───────────────────────────────────────┐  │
│  │  ChallengeCard component              │  │
│  │  (see 2.2 above)                      │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  TRIPS (Scrollable)                         │
│  ┌───────────────────────────────────────┐  │
│  │  TripListItem                         │  │
│  │  - Trip title/description preview     │  │
│  │  - Creator name                       │  │
│  │  - Min risk / Max win                 │  │
│  │  - Balance remaining                  │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  TripItem                         │  │
│  └───────────────────────────────────────┘  │
│  ...                                        │
│  (scrollable)                               │
└─────────────────────────────────────────────┘
```

### 3.2

Use TripItem component but don't apply the folder filters to show them all

```

### 3.3 Remove Folder Components

The following can be deprecated/removed:
- `TripFolders.svelte` - No longer needed
- `TripFolderItem.svelte` - No longer needed
- Folder selection in trip creation (see 3.4)

Keep for potential future use:
- Sanity CMS folder definitions (may be repurposed for tags/categories)

### 3.4 Admin: Create Trip UI Changes

**Goal**: Simplify trip creation to a binary choice: Challenge or Regular Trip.

Location: `packages/client/src/lib/components/Admin/CreateTrip/CreateTrip.svelte`

**Remove**:
- Folder selection step (`currentStep: "folder" | "details"`)
- `TripFolders` component usage
- `selectedFolderId` state
- `availableFolders` derived

**New Flow**:
```

┌─────────────────────────────────────────────┐
│ CREATE │
│ │
│ ┌─────────────────┐ ┌─────────────────┐ │
│ │ │ │ │ │
│ │ CHALLENGE │ │ TRIP │ │
│ │ │ │ │ │
│ │ Min: 5000 $RAT │ │ Adjustable │ │
│ │ 100% max win │ │ min and max │ │
│ │ │ │ │ │
│ └─────────────────┘ └─────────────────┘ │
│ │
└─────────────────────────────────────────────┘

````

**New State**:
```typescript
let tripType: "challenge" | "regular" | null = $state(null)
````

**Logic**:

- Challenge button disabled if `!$challengeInfo.canCreateNewChallenge`
- Show "Active challenge expires in X:XX:XX" when disabled
- After selection, show appropriate form:
  - Challenge: `CreateRestrictedTripForm.svelte` (with fixed values)
  - Regular: `CreateTripForm.svelte`

### 3.3 Restricted Form adjustments

Change the restrictions here.

- Always pre-fill the 5000 min and only allow adjusting up
- Make the max win percentage sign larger. It is hard to read

**Remove from CreateTripForm.svelte**:

- `selectedFolderTitle` prop
- `onFolderSelect` prop
- Folder selection UI in the form

### 3.5 Server-Side: Remove Folder Requirement

The server/contract may need to be updated to not require a folderId for trip creation. If folderId is currently required:

- Make it optional in the contract
- Or use a default/placeholder folder ID

---

## 4. Implementation Checklist

### Phase 1: NFT Export Confirmation

- [ ] Add `CONFIRM_EXPORT_NFT` to `RAT_BOX_STATE`
- [ ] Update `VALID_TRANSITIONS`
- [ ] Add `exportItem` state to `ratState`
- [ ] Create `ConfirmExportNFT.svelte` component
- [ ] Update inventory item export button to use new flow
- [ ] Update `RatBox.svelte` to render new state

### Phase 2: NFT Import

- [ ] Add `IMPORTING_OBJECTS_FROM_NFT` to `RAT_BOX_STATE`
- [ ] Update `VALID_TRANSITIONS`
- [ ] Create `packages/client/src/lib/modules/nft/stores.ts`
- [ ] Implement `fetchPlayerNFTs()` function
- [ ] Create `ImportNFTs.svelte` component
- [ ] Update `RatInfo.svelte` with import button
- [ ] Update `RatBox.svelte` to render new state
- [ ] Remove existing item NFT display (if present)

### Phase 3: Challenge Helper Store

- [ ] Create `packages/client/src/lib/modules/state/challenge.svelte.ts`
- [ ] Implement `challengeInfo` derived store
- [ ] Export `canCreateNewChallenge` helper
- [ ] Update existing challenge components to use new store

### Phase 4: Enhanced Challenge Display

- [ ] Rename/refactor `ChallengeFolderItem.svelte` → `ChallengeCard.svelte`
- [ ] Add creator name display
- [ ] Add max reward display
- [ ] Update props and styling

### Phase 5: Flat Trip Structure

- [ ] Refactor `TripListing.svelte`:
  - [ ] Fixed challenge section at top
  - [ ] Scrollable trip list below
  - [ ] Remove folder filtering logic
- [ ] Deprecate `TripFolders.svelte`
- [ ] Deprecate `TripFolderItem.svelte`

### Phase 6: Admin Create Trip Simplification

- [ ] Refactor `CreateTrip.svelte`:
  - [ ] Remove folder selection
  - [ ] Add Challenge/Trip binary choice
  - [ ] Show challenge availability status
- [ ] Update `CreateTripForm.svelte`:
  - [ ] Remove folder-related props
- [ ] Update `CreateRestrictedTripForm.svelte` if needed

---

## 5. Technical Notes

### NFT Contract Reference

From `packages/contracts/src/external/ItemNFT.sol`:

- ERC721 with enumerable extension
- `tokenOfOwnerByIndex(address, index)` for listing
- `itemIds(tokenId)` - MUD entity ID
- `itemNames(tokenId)` - Display name
- `itemValues(tokenId)` - Numeric value
- Rarity colors: Purple (≥100), Yellow (≥50), Gray (≥20), Brown (<20)

### Memory/Performance Considerations

- NFT list should use virtual scrolling if >20 items expected
- Challenge info store should be memoized appropriately
- Follow CLAUDE.md logger guidelines - no `console.log()` with object references
