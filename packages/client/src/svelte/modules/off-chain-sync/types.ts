import { ServerReturnValue } from "@components/Main/RoomResult/types"

export type MessageContent = {
  topic: "test" | "clients__update" | "room__creatorfee" | "room__outcome" | "room__kill"
  message: ServerReturnValue | string | string[]
}