import { useEffect } from "react"
import { useSessionClient } from "@latticexyz/entrykit/internal"
import { entryKitSession } from "./stores"

export default function SessionBridge() {
  const sessionClient = useSessionClient()

  useEffect(() => {
    entryKitSession.set(sessionClient)
  }, [sessionClient.data, sessionClient])

  return null
}
