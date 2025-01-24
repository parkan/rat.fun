/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   *   Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from getContract, see
   *     https://github.com/latticexyz/mud/blob/main/templates/vanilla/packages/client/src/mud/setupNetwork.ts#L63-L69).
   *
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/main/templates/vanilla/packages/client/src/mud/setupNetwork.ts#L77-L83).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs
   *   (https://github.com/latticexyz/mud/blob/main/templates/vanilla/packages/client/src/mud/setupNetwork.ts#L77-L83).
   */
  { worldContract, waitForTransaction }: SetupNetworkResult
) {

  // ___ Health

  const increaseHealth = async (ratId: string, change: number) => {
    const tx = await worldContract.write.ratroom__increaseHealth([ratId, change]);
    await waitForTransaction(tx);
  }

  const decreaseHealth = async (ratId: string, change: number) => {
    const tx = await worldContract.write.ratroom__decreaseHealth([ratId, change]);
    await waitForTransaction(tx);
  }
  
  // ___ Traits

  const addTraitToRat = async (ratId: string, newTrait: string, value: number ) => {
    const tx = await worldContract.write.ratroom__addTraitToRat([ratId, newTrait, value]);
    await waitForTransaction(tx);
  };

  const removeTraitFromRat = async (ratId: string, traitId: string ) => {
    const tx = await worldContract.write.ratroom__removeTraitFromRat([ratId, traitId]);
    await waitForTransaction(tx);
  };

  // ___ Items

  const addItemToLoadOut = async (ratId: string, newTrait: string, value: number ) => {
    const tx = await worldContract.write.ratroom__addItemToLoadOut([ratId, newTrait, value]);
    await waitForTransaction(tx);
  };

  const removeItemFromLoadOut = async (ratId: string, itemId: string ) => {
    console.log("removeItemFromLoadOut", ratId, itemId);
    const tx = await worldContract.write.ratroom__removeItemFromLoadOut([ratId, itemId]);
    await waitForTransaction(tx);
  }

  // ___ Balance

  const increaseBalance = async (id: string, change: number) => {
    const tx = await worldContract.write.ratroom__increaseBalance([id, change]);
    await waitForTransaction(tx);
  };

  const decreaseBalance = async (id: string, change: number) => {
    const tx = await worldContract.write.ratroom__decreaseBalance([id, change]);
    await waitForTransaction(tx);
  };

  return {
    // Health
    increaseHealth,
    decreaseHealth,
    // Traits
    addTraitToRat,
    removeTraitFromRat,
    // Items
    addItemToLoadOut,
    removeItemFromLoadOut,
    // Balance
    increaseBalance,
    decreaseBalance,
  };
}
