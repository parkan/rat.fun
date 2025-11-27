export type TextSegment = { type: string; text: string }

export function parseLogText(text: string, knownTags: string[]): TextSegment[] {
  const segments: TextSegment[] = []
  let currentIndex = 0

  const regex = /\[([A-Z]+)\](.*?)\[\/\1\]/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > currentIndex) {
      segments.push({
        type: "plain",
        text: text.substring(currentIndex, match.index)
      })
    }

    const tagName = match[1]
    const content = match[2]

    if (knownTags.includes(tagName)) {
      segments.push({ type: tagName, text: content })
    } else {
      segments.push({ type: "plain", text: match[0] })
    }

    currentIndex = match.index + match[0].length
  }

  if (currentIndex < text.length) {
    segments.push({ type: "plain", text: text.substring(currentIndex) })
  }

  return segments
}
