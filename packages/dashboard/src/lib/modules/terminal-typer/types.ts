export type TerminalOutputUnit = {
  type: "text" | "loader"
  content: string
  loaderCharacters?: string
  duration?: number
  typeSpeed?: number
  delayAfter?: number
  color: string
  backgroundColor: string
}
