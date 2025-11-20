<script lang="ts">
  import { onMount } from "svelte"
  import gsap from "gsap"
  import { BigButton, Mascot } from "$lib/components/Shared"
  import { spawnState, SPAWN_STATE } from "$lib/components/Spawn/state.svelte"

  let mascotElement = $state<HTMLDivElement | null>(null)
  let mascotRef = $state<Mascot | null>(null)
  let buttonElement = $state<HTMLDivElement | null>(null)
  let currentTextIndex = $state(0)

  const timeline = gsap.timeline()

  type IntroductionSteps = {
    text: string
    buttonLabel: string
  }

  const introductionSteps: IntroductionSteps[] = [
    {
      text: "Gooood moooooorning **OPERATOR**!",
      buttonLabel: "OK"
    },
    {
      text: "Welcome to our rat controlled remote viewing **SLOP MACHINE**.",
      buttonLabel: "OK"
    },
    {
      text: "If operated skilfully this machine will bring you great riches!",
      buttonLabel: "OK"
    },
    {
      text: "Pump your rats with drugs and send them tripping, then cash out tokens by exploiting their success.",
      buttonLabel: "OK"
    },
    {
      text: "I can feel your dopamine injectors tingling! What are you waiting for?",
      buttonLabel: "I AM READY"
    }
  ]

  function handleContinue() {
    // If we haven't shown all texts yet, show the next one
    if (currentTextIndex < introductionSteps.length) {
      mascotRef?.showSpeechBubble(introductionSteps[currentTextIndex].text, { autoHide: false })
      currentTextIndex++
    } else {
      // After all texts are shown, transition to next step
      spawnState.state.transitionTo(SPAWN_STATE.SPAWN_FORM)
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleContinue()
    }
  }

  onMount(() => {
    if (mascotRef) {
      mascotRef.showSpeechBubble(introductionSteps[0].text, { autoHide: false })
      currentTextIndex = 1
    }

    if (!mascotElement || !buttonElement) {
      return
    }

    // Set initial opacity to 0
    gsap.set([mascotElement, buttonElement], {
      opacity: 0
    })

    // Staggered fade-in animations
    timeline
      .to(
        mascotElement,
        {
          opacity: 1,
          duration: 0.4
        },
        "0"
      )
      .to(
        buttonElement,
        {
          opacity: 1,
          duration: 0.3
        },
        "0.1"
      )
  })
</script>

<div class="outer-container">
  <div class="inner-container">
    <div
      class="mascot-container"
      bind:this={mascotElement}
      role="button"
      tabindex="0"
      onclick={handleContinue}
      onkeydown={handleKeydown}
    >
      <Mascot bind:this={mascotRef} entranceOn={true} smallDanceOn={true} />
    </div>
    <div class="button-container" bind:this={buttonElement}>
      <BigButton
        text={introductionSteps[currentTextIndex - 1]?.buttonLabel ?? ""}
        onclick={handleContinue}
      />
    </div>
  </div>
</div>

<style lang="scss">
  .outer-container {
    display: flex;
    flex-flow: column nowrap;
    height: var(--game-window-height);
    align-items: center;
    justify-content: center;
    color: var(--background);

    .inner-container {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      width: 700px;
      max-width: 90dvw;

      .mascot-container {
        width: 400px;
        height: 400px;
        margin-bottom: 20px;
        cursor: pointer;
      }

      .button-container {
        width: 100%;
        height: 160px;
      }
    }
  }
</style>
