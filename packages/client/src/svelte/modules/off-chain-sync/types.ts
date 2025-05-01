export type MessageContent = {
  topic: "test" | "clients__update" | "room__outcome" | "rat__death" | "chat__message"
  message: string | string[]
  timestamp?: number
}