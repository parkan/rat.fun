import { useEffect, useRef } from "react"
import { useEntryKitConfig, useSessionClient } from "@latticexyz/entrykit/internal"
import { entryKitConnector, entryKitSession } from "$lib/modules/entry-kit/stores"
import { useWalletClient } from "wagmi"

export default function SessionBridge() {
  const { chainId } = useEntryKitConfig()
  const sessionClient = useSessionClient()
  const connectorClient = useWalletClient({ chainId })

  const prevSessionRef = useRef(sessionClient.data)
  const prevConnectorRef = useRef(connectorClient.data)

  // Transfer session updates to svelte store
  useEffect(() => {
    if (sessionClient.data !== prevSessionRef.current) {
      console.log("SessionBridge: Session data updated", sessionClient.data)
      entryKitSession.set(sessionClient.data)
      prevSessionRef.current = sessionClient.data

      // Dispatch custom event for session changes
      if (sessionClient.data?.userAddress) {
        window.dispatchEvent(
          new CustomEvent("entrykit-session-ready", {
            detail: sessionClient.data
          })
        )
      }
    }
  }, [sessionClient.data])

  // Transfer connector updates to svelte store
  useEffect(() => {
    if (connectorClient.data !== prevConnectorRef.current) {
      console.log("SessionBridge: Connector data updated", connectorClient.data)
      entryKitConnector.set(connectorClient.data)
      prevConnectorRef.current = connectorClient.data

      // Dispatch custom event for connector changes
      if (connectorClient.data) {
        window.dispatchEvent(
          new CustomEvent("entrykit-connector-ready", {
            detail: connectorClient.data
          })
        )
      }
    }
  }, [connectorClient.data])

  // Notify when bridge is mounted and ready
  useEffect(() => {
    console.log("SessionBridge: Component mounted")
    window.dispatchEvent(new CustomEvent("entrykit-bridge-mounted"))
  }, [])

  return null
}
