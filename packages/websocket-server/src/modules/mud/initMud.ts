import { setup } from "@modules/mud/setup"

const PRIVATE_KEY = process.env.PRIVATE_KEY as string
const CHAIN_ID = Number(process.env.CHAIN_ID) as number

// Initialize MUD
const { network } = await setup(PRIVATE_KEY, CHAIN_ID)

export { network }
