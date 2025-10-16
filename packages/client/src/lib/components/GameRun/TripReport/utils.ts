import { gsap } from "gsap"

// Helper function to serialize timeline structure
export const serializeTimeline = (tl: ReturnType<typeof gsap.timeline>, depth = 0) => {
  const indent = "  ".repeat(depth)
  let output = `${indent}Timeline (dur: ${tl.duration()}, start: ${tl.startTime()})\n`

  // Walk through children
  let child = tl._first
  while (child) {
    if (child._targets && child._targets.length) {
      // It's a tween
      output += `${indent}  Tween (dur: ${child._dur}, start: ${child._start}, targets: ${child._targets.length})\n`
    } else if (child.duration) {
      // It's a nested timeline
      output += serializeTimeline(child, depth + 1)
    } else if (child._func) {
      // It's a callback
      output += `${indent}  Callback (start: ${child._start})\n`
    }
    child = child._next
  }

  return output
}
