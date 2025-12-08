import type { TerminalOutputUnit } from "$lib/modules/terminal-typer/types"
import { playSound, randomPitch } from "$lib/modules/sound"

function onType() {
  playSound({ category: "ratfunUI", id: "chirp", pitch: randomPitch() })
}

export const spawnMascotText: TerminalOutputUnit[] = [
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
    content: "Sign here to get your Slop Machine pass.",
    color: "var(--foreground)",
    typeMode: "word",
    typeSpeed: 100,
    backgroundColor: "transparent",
    onType
  }
]
