<script lang="ts">
  import { onMount } from "svelte"
  import gsap from "gsap"
  import { BigButton, Mascot } from "$lib/components/Shared"
  import { spawnState, SPAWN_STATE } from "$lib/components/Spawn/state.svelte"

  let mascotElement = $state<HTMLDivElement | null>(null)
  let textElement = $state<HTMLDivElement | null>(null)
  let buttonElement = $state<HTMLDivElement | null>(null)

  const timeline = gsap.timeline()

  function handleContinue() {
    console.log("[Introduction] Continue button clicked")
    spawnState.state.transitionTo(SPAWN_STATE.SPAWN_FORM)
  }

  onMount(() => {
    console.log("[Introduction] Component mounted")

    if (!mascotElement || !textElement || !buttonElement) {
      return
    }

    // Set initial opacity to 0
    gsap.set([mascotElement, textElement, buttonElement], {
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
        textElement,
        {
          opacity: 1,
          duration: 0.3
        },
        "0.1"
      )
      .to(
        buttonElement,
        {
          opacity: 1,
          duration: 0.3
        },
        "0.2"
      )
  })
</script>

<div class="outer-container">
  <div class="inner-container">
    <div class="mascot-container" bind:this={mascotElement}>
      <Mascot entranceOn={true} bigDanceOn={true} />
    </div>
    <div class="text-container" bind:this={textElement}>
      <p>Gooood moooooorning OPERATOR!</p>

      <p>
        Welcome to the SLOP MACHINE for exposing test-subject to drug-induced experiences aka TRIPS.
      </p>

      <p>
        Don't worry! You are not the test-subject! We would never use humans for these experiments.
        We tried… but you are too expensive. So now we use RATS instead.
      </p>

      <p>
        As an operator, you send rats into trips to earn TOKENS. The more they take from each trip,
        the more valuable they become. Cash out by killing your rat at any moment. Can you feel your
        dopamine injectors tingling already?
      </p>

      <p>THIS IS VERY IMPORTANT!!!! DO NOT GET ATTACHED TO YOUR RAT!!!!</p>

      <p class="disclaimer">
        DISCLAIMER: The company does not take any responsibility for causing addiction through
        repetitive and operant conditioning patterns.
      </p>
    </div>
    <div class="button-container" bind:this={buttonElement}>
      <BigButton text="Continue" onclick={handleContinue} />
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
        width: 300px;
        height: 300px;
        pointer-events: none;
        display: none;
      }

      .text-container {
        text-align: center;
        margin: 20px 0;
        background: var(--background);
        color: var(--foreground);
        padding: 20px;

        p {
          font-size: var(--font-size-normal);
          margin: 10px 0;
          line-height: 1.5;

          &.disclaimer {
            font-size: var(--font-size-small);
          }
        }
      }

      .button-container {
        width: 100%;
        height: 200px;
      }
    }
  }
</style>
