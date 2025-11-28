import type { SetupResult } from "../setup"

export async function spawn(mud: SetupResult, name: string): Promise<string> {
  console.log(`Spawning player with name: ${name}...`)

  const tx = await mud.worldContract.write.ratfun__spawn([name])
  console.log(`Spawn transaction sent: ${tx}`)

  await mud.waitForTransaction(tx)
  console.log(`Player spawned successfully!`)

  return tx
}
