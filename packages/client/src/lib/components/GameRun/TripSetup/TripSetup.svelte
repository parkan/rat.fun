<script lang="ts">
  import { onMount } from "svelte"
  import { gsap } from "gsap"
  import { TextPlugin } from "gsap/TextPlugin"
  import type { Room as SanityRoom } from "@sanity-types"
  import { terminalTyper } from "$lib/modules/terminal-typer/index"
  import { generateTripSetupOutput } from "./tripSetupOutput"

  gsap.registerPlugin(TextPlugin)

  let terminalBoxElement = $state<HTMLDivElement>()

  const {
    onComplete,
    staticRoomContent
  }: {
    onComplete: () => void
    staticRoomContent: SanityRoom | undefined
  } = $props()

  const SETUP_DURATION = 5000

  // const text = [
  //   "= Pneumatic system engaged",
  //   `= Rat ${$rat.name} conveyed to trip chamber`,
  //   "= Trip chamber lid closed",
  //   "= RAT-o-FUN harness secured",
  //   "= PETA approved Diaper attached",
  //   "= Intercranial probes attached",
  //   "= Rat dosed with 44mg of Slopamine",
  //   "= Video feed activated",
  //   "= Trip initiated....."
  // ]

  onMount(async () => {
    setTimeout(() => {
      onComplete()
    }, SETUP_DURATION)

    if (terminalBoxElement) {
      await terminalTyper(terminalBoxElement, generateTripSetupOutput())
    }
  })
</script>

<div class="splash-screen">
  <div class="terminal-box" bind:this={terminalBoxElement}></div>
</div>

<style lang="scss">
  .splash-screen {
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    color: var(--foreground);
    font-size: var(--font-size-normal);
    background: rgba(0, 0, 0, 0.1);

    .terminal-box {
      font-size: var(--font-size-normal);
      width: calc(100% - 30px);
      height: calc(100% - 40px);
    }
  }
</style>
