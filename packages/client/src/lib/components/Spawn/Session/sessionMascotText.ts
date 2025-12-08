import type { TerminalOutputUnit } from "$lib/modules/terminal-typer/types"
import { playSound, randomPitch } from "$lib/modules/sound"

function onType() {
  playSound({ category: "ratfunUI", id: "chirp", pitch: randomPitch() })
}

export const sessionMascotText: TerminalOutputUnit[] = [
  {
    type: "text",
    content: "Welcome back operator!",
    color: "var(--foreground)",
    typeMode: "word",
    typeSpeed: 100,
    backgroundColor: "transparent",
    onType
  },
  {
    type: "text",
    content: "Retrieve your account below",
    color: "var(--foreground)",
    typeMode: "word",
    typeSpeed: 100,
    backgroundColor: "transparent",
    onType
  }
]
