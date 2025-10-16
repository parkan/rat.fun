import type { TerminalOutputUnit } from "./types.js"
import { playSound } from "$lib/modules/sound"

const DEFAULT_TYPE_SPEED = 10
const DEFAULT_DELAY_AFTER = 500
const DEFAULT_LOADER_DURATION = 3000

export function terminalTyper(targetElement: HTMLElement, units: TerminalOutputUnit[]) {
  let isStopped = false

  const controller = {
    stop: () => {
      isStopped = true
    },
    promise: (async () => {
      for (const unit of units) {
        if (isStopped) break
        await typeUnit(targetElement, unit, () => isStopped)
      }
    })()
  }

  return controller
}

async function typeUnit(
  targetElement: HTMLElement,
  unit: TerminalOutputUnit,
  isStopped: () => boolean
) {
  const typeSpeed = unit.typeSpeed ?? DEFAULT_TYPE_SPEED
  const delayAfter = unit.delayAfter ?? DEFAULT_DELAY_AFTER

  if (unit.type === "text") {
    await typeText(
      targetElement,
      unit.content,
      typeSpeed,
      unit.color,
      unit.backgroundColor,
      unit.duration,
      isStopped
    )
    if (!isStopped()) await sleep(delayAfter)
  } else if (unit.type === "loader") {
    await typeLoader(
      targetElement,
      unit.content,
      unit.duration ?? DEFAULT_LOADER_DURATION,
      typeSpeed,
      unit.color,
      unit.backgroundColor,
      unit.loaderCharacters ?? "",
      isStopped
    )
    if (!isStopped()) await sleep(delayAfter)
  }
}

async function typeText(
  targetElement: HTMLElement,
  content: string,
  typeSpeed: number,
  color: string,
  backgroundColor: string,
  duration: number | undefined,
  isStopped: () => boolean
) {
  // Start new line
  addLine(targetElement, "text")

  // If duration is 0, output everything at once
  if (duration === 0) {
    addTextToLine(targetElement, content, color, backgroundColor)
    playSound("ratfunUI", "lineHit")
    return
  }

  for (const char of content) {
    if (isStopped()) break
    addChar(targetElement, char, color, backgroundColor)
    playSound("ratfunUI", "type")
    await sleep(typeSpeed)
  }
}

async function typeLoader(
  targetElement: HTMLElement,
  content: string,
  duration: number,
  typeSpeed: number,
  color: string,
  backgroundColor: string,
  loaderCharacters: string,
  isStopped: () => boolean
) {
  // Start new line
  addLine(targetElement, "loader")

  // First, output the content with sound effects
  for (const char of content) {
    if (isStopped()) return
    addChar(targetElement, char, color, backgroundColor)
    await sleep(typeSpeed)
  }

  // If duration is 0, output everything at once
  if (duration === 0) {
    return
  }

  // Then repeat loaderCharacters for the duration
  const startTime = Date.now()
  let currentLoaderContent = ""

  while (Date.now() - startTime < duration && !isStopped()) {
    // Clear current line content
    const currentLine = targetElement.lastElementChild as HTMLElement
    if (currentLine) {
      currentLine.innerHTML = ""
    }

    // Re-add the content
    for (const char of content) {
      if (isStopped()) return
      addChar(targetElement, char, color, backgroundColor)
    }

    // Add all accumulated loader characters
    addTextToLine(targetElement, currentLoaderContent, color, backgroundColor)

    // Add loader characters repeatedly with sound effects
    for (const char of loaderCharacters) {
      if (isStopped()) return
      currentLoaderContent += char
      addChar(targetElement, char, color, backgroundColor)
      playSound("ratfunUI", "type3")
      await sleep(typeSpeed)

      // Check if we've exceeded duration after each character
      if (Date.now() - startTime >= duration) {
        break
      }
    }
  }
}

function addLine(targetElement: HTMLElement, type: "text" | "loader") {
  const line = document.createElement("div")
  line.className = `terminal-line terminal-line--${type}`
  targetElement.appendChild(line)
}

function addChar(targetElement: HTMLElement, char: string, color: string, backgroundColor: string) {
  const currentLine = targetElement.lastElementChild as HTMLElement
  if (currentLine) {
    const span = document.createElement("span")
    span.textContent = char
    span.style.color = color
    span.style.backgroundColor = backgroundColor
    currentLine.appendChild(span)
  }
}

function addTextToLine(
  targetElement: HTMLElement,
  text: string,
  color: string,
  backgroundColor: string
) {
  const currentLine = targetElement.lastElementChild as HTMLElement
  if (currentLine) {
    const span = document.createElement("span")
    span.textContent = text
    span.style.color = color
    span.style.backgroundColor = backgroundColor
    currentLine.appendChild(span)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
