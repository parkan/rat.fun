import { cubicInOut } from "svelte/easing"
import type { EasingFunction, TransitionConfig } from "svelte/transition"

/**
 * Reversed draw transition - animates SVG paths from end to start
 * @param node - SVG element with getTotalLength method
 * @param params - Transition parameters
 */
export function drawReverse(
  node: SVGElement & { getTotalLength(): number },
  {
    delay = 0,
    speed,
    duration,
    easing = cubicInOut
  }: {
    delay?: number
    speed?: number
    duration?: number | ((len: number) => number)
    easing?: EasingFunction
  } = {}
): TransitionConfig {
  let len = node.getTotalLength()
  const style = getComputedStyle(node)
  if (style.strokeLinecap !== "butt") {
    len += parseInt(style.strokeWidth)
  }

  let finalDuration: number
  if (duration === undefined) {
    if (speed === undefined) {
      finalDuration = 800
    } else {
      finalDuration = len / speed
    }
  } else if (typeof duration === "function") {
    finalDuration = duration(len)
  } else {
    finalDuration = duration
  }

  return {
    delay,
    duration: finalDuration,
    easing,
    css: (_, u) => `
      stroke-dasharray: ${len};
      stroke-dashoffset: ${-u * len};
    `
  }
}
