import type { TerminalOutputUnit } from "$lib/modules/terminal-typer/types"

export function generateTripErrorOutput(): TerminalOutputUnit[] {
  const errorLine: TerminalOutputUnit = {
    type: "loader",
    content: "",
    loaderCharacters: "ERROR ",
    color: "red",
    backgroundColor: "black",
    duration: 10000,
    delayAfter: 0
  }

  const output: TerminalOutputUnit[] = [errorLine]
  return output
}
