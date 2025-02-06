import { ENVIRONMENT } from "@mud/enums"
import { clientList, newEvent } from "@modules/off-chain-sync/stores"
import { MessageContent } from "./types"

let socket: WebSocket

export function initOffChainSync(environment: ENVIRONMENT, ratId: string) {
  console.log("Initializing off chain sync", environment, ratId)

  let url = `ws://localhost:3131/ws/${ratId}`

  if ([ENVIRONMENT.GARNET].includes(environment)) {
    url = `wss://reality-model-1.mc-infra.com/ws/${ratId}`
  }

  socket = new WebSocket(url)

  socket.onmessage =(message: MessageEvent<string>) => {
    // console.log("Received message:", message)
    const messageContent = JSON.parse(message.data) as MessageContent
    // console.log("Received outcome:", messageContent)

    // Update client list when players connect/disconnect
    if (messageContent.topic === "clients__update") {
      clientList.set(messageContent.message as string[])
      return
    }

    // Pass message to store
    newEvent.set(messageContent)
  }

  socket.onclose = message => {
    console.log("Socket closed", message)
  }
}
