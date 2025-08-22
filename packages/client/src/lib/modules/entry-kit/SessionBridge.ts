import { useEffect } from "react"
import { useEntryKitConfig, useSessionClient } from "@latticexyz/entrykit/internal"
import { entryKitConnector, entryKitSession } from "$lib/modules/entry-kit/stores"
import { useWalletClient } from "wagmi"

export default function SessionBridge() {
  const { chainId } = useEntryKitConfig()
  const sessionClient = useSessionClient()

  const connectorClient = useWalletClient({ chainId })

  // Transfer session updates to svelte store
  useEffect(() => {
    entryKitSession.set(sessionClient.data)
    console.log("We have established the bridge between entrykit and the app", sessionClient.data)
  }, [sessionClient.data])

  // Transfer connector updates to svelte store
  useEffect(() => {
    entryKitConnector.set(connectorClient.data)
    console.log("We have set up the connector for entrykit and the app", connectorClient.data)
  }, [connectorClient.data])

  return null
}
