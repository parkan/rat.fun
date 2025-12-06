export type TutorialStep = 1 | 2 | 3 | 4 | 5

export type TutorialPlacement = "top" | "bottom" | "left" | "right"

export type TutorialStepConfig = {
  target: string
  placement: TutorialPlacement
  mobile?: {
    target?: string
    placement?: TutorialPlacement
  }
}
