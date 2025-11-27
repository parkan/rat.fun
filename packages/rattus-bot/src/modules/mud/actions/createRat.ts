import type { SetupResult } from "../setup"

export async function createRat(mud: SetupResult, name: string): Promise<string> {
  console.log(`Creating rat with name: ${name}...`)

  const tx = await mud.worldContract.write.ratfun__createRat([name])
  console.log(`CreateRat transaction sent: ${tx}`)

  await mud.waitForTransaction(tx)
  console.log(`Rat created successfully!`)

  return tx
}
