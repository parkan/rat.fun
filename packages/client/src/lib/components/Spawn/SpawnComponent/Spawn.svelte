<script lang="ts">
  import { onMount } from "svelte"
  import gsap from "gsap"

  import { typeHit } from "$lib/modules/sound"
  import { isSessionReady, sessionClient } from "$lib/modules/drawbridge"

  import { BigButton, Mascot } from "$lib/components/Shared"
  import { spawnState, SPAWN_STATE } from "$lib/components/Spawn/state.svelte"
  import { spawnMascotText } from "./spawnMascotText"
  import { createLogger } from "$lib/modules/logger"

  const logger = createLogger("[Spawn]")

  let name = $state("")

  // Check if wallet is ready (session established)
  const isWalletReady = $derived($isSessionReady && !!$sessionClient)

  let mascotElement: HTMLDivElement | null = $state(null)
  let inputElement: HTMLInputElement | null = $state(null)
  let buttonElement: HTMLDivElement | null = $state(null)

  const timeline = gsap.timeline()

  function submitForm() {
    logger.log("Submit form with name:", name)

    // Validate name before transitioning
    if (!name || name.trim() === "") {
      logger.warn("Name cannot be empty")
      return
    }

    // Crop name to limit
    const finalName = name.slice(0, 50)

    // Store name in state machine
    spawnState.data.setPlayerName(finalName)
    logger.log("Name stored, transitioning to SPAWNING")

    // Transition to spawning state
    spawnState.state.transitionTo(SPAWN_STATE.SPAWN__LOADING)
  }

  onMount(() => {
    logger.log("Component mounted")

    if (!mascotElement || !inputElement || !buttonElement) {
      return
    }

    // Set initial opacity to 0
    gsap.set([mascotElement, inputElement, buttonElement], {
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
        inputElement,
        {
          opacity: 1,
          duration: 0.3
        },
        "0.2"
      )
      .to(
        buttonElement,
        {
          opacity: 1,
          duration: 0.3
        },
        "0.3"
      )

    timeline.call(() => {
      if (inputElement) {
        inputElement.focus()
      }
    })
  })
</script>

<div class="outer-container">
  <div class="inner-container">
    <!-- MASCOT -->
    <div class="mascot-container" bind:this={mascotElement}>
      <Mascot headBobOn={true} smallText={true} text={spawnMascotText} finishTextOnClick={true} />
    </div>

    <!-- FORM -->
    <div class="form" bind:this={buttonElement}>
      <!-- INPUT -->
      <input
        type="text"
        placeholder="YOUR NAME"
        bind:value={name}
        bind:this={inputElement}
        onkeydown={e => {
          typeHit()
          if (e.key === "Enter") {
            submitForm()
          }
        }}
      />
      <div class="button-container">
        <BigButton
          text={!isWalletReady ? "Setting up..." : "SIGN"}
          onclick={submitForm}
          disabled={!name || !isWalletReady}
        />
      </div>
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
      width: var(--spawn-inner-width);
      max-width: 90dvw;

      .mascot-container {
        width: var(--spawn-mascot-size);
        height: var(--spawn-mascot-size);
        margin-bottom: var(--spawn-mascot-margin-bottom);
        pointer-events: none;
      }

      .form {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        margin-top: 20px;

        input {
          margin-right: 10px;
          font-size: var(--font-size-large);
          padding: 10px;
          background: var(--foreground);
          color: var(--background);
          border: none;
          margin-bottom: 0;
          font-family: var(--special-font-stack);
          text-transform: uppercase;
          border-bottom: var(--default-border-style);
          outline: none;
          width: 100%;
          height: 80px;
          margin-bottom: 20px;
          text-align: center;

          &::placeholder {
            color: var(--color-grey-light);
          }
        }

        .button-container {
          width: 100%;
          height: var(--spawn-button-height);
        }
      }
    }
  }
</style>
