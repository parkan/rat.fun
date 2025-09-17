import type { TransitionConfig } from "./types"
import { circOut as easing } from "svelte/easing"

const mainLayoutTransitionConfig: TransitionConfig[] = [
  {
    from: "/(rooms)/(game)",
    to: "/(rooms)/admin",
    in: {
      transition: "flip",
      params: {
        direction: "in",
        duration: 200,
        delay: 200
      }
    },
    out: {
      transition: "flip",
      params: {
        direction: "out",
        duration: 200
      }
    }
  },
  {
    from: "/(rooms)/admin",
    to: "/(rooms)/(game)",
    in: {
      transition: "flip",
      params: {
        direction: "in",
        duration: 200,
        delay: 200
      }
    },
    out: {
      transition: "flip",
      params: {
        direction: "out",
        duration: 200
      }
    }
  }
]

const gameLayoutTransitionConfig: TransitionConfig[] = [
  {
    from: "/(rooms)/(game)",
    to: "/(rooms)/(game)/[roomId]",
    in: {
      transition: "wipeDiagonal",
      params: {
        direction: "in",
        duration: 450,
        easing
      }
    },
    out: {
      transition: "fade",
      params: {
        delay: 400,
        duration: 50
      }
    }
  },
  {
    from: "/(rooms)/(game)/[roomId]",
    to: "/(rooms)/(game)",
    in: {
      transition: "none"
    },
    out: {
      transition: "wipeDiagonal",
      params: {
        direction: "in",
        duration: 400,
        easing
      }
    }
  }
]

export { mainLayoutTransitionConfig, gameLayoutTransitionConfig }
