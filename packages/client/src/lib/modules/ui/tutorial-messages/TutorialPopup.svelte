<script lang="ts">
  import { onDestroy } from "svelte"
  import { mount, unmount } from "svelte"
  import tippy, { type Instance } from "tippy.js"
  import { tutorialActive, tutorialStep, nextStep } from "./store"
  import { TUTORIAL_STEPS } from "./steps"
  import { isPhone } from "$lib/modules/ui/state.svelte"
  import TutorialContent from "./TutorialContent.svelte"
  import TutorialOverlay from "./TutorialOverlay.svelte"

  let tippyInstance: Instance | null = null
  let mountedComponent: Record<string, unknown> | null = null

  function cleanup() {
    // Remove highlight from previous target
    document.querySelector("[data-tutorial-highlight]")?.removeAttribute("data-tutorial-highlight")

    if (tippyInstance) {
      tippyInstance.destroy()
      tippyInstance = null
    }

    if (mountedComponent) {
      unmount(mountedComponent)
      mountedComponent = null
    }
  }

  $effect(() => {
    // Cleanup previous instance
    cleanup()

    if (!$tutorialActive) return

    const stepData = TUTORIAL_STEPS[$tutorialStep]
    const isMobile = $isPhone

    // Get target and placement, with mobile overrides
    const target = isMobile && stepData.mobile?.target ? stepData.mobile.target : stepData.target
    const placement =
      isMobile && stepData.mobile?.placement ? stepData.mobile.placement : stepData.placement

    const targetEl = document.querySelector(target)

    if (!targetEl) {
      console.warn(`Tutorial target not found: ${target}`)
      return
    }

    // Create container for Svelte component
    const container = document.createElement("div")

    // Mount Svelte component into container
    mountedComponent = mount(TutorialContent, {
      target: container,
      props: {
        step: $tutorialStep,
        onNext: nextStep
      }
    })

    // Create tippy with DOM element as content
    tippyInstance = tippy(targetEl, {
      content: container,
      theme: "tutorial",
      placement: placement,
      trigger: "manual",
      interactive: true,
      arrow: true,
      showOnCreate: true,
      appendTo: document.body,
      hideOnClick: false
    })

    // Add highlight to target
    targetEl.setAttribute("data-tutorial-highlight", "")
  })

  onDestroy(cleanup)
</script>

<TutorialOverlay />
