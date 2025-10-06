<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { Log, NormalResultSummary, RatDeadResultSummary } from "$lib/components/GameRun"
  import { playSound } from "$lib/modules/sound"
  import { shaderManager } from "$lib/modules/webgl/shaders/index.svelte"
  import type { EnterRoomReturnValue } from "@server/modules/types"
  import { RESULT_SUMMARY } from "$lib/components/GameRun/state.svelte"
  import { Howl } from "howler"

  let { result }: { result: EnterRoomReturnValue | null } = $props()

  let resultSummary = $state<RESULT_SUMMARY>(RESULT_SUMMARY.UNKNOWN)
  let backgroundMusic: Howl | undefined = $state()
  let logComponent: any = $state()

  // Called after log output is complete
  const onComplete = () => {
    if (result?.ratDead) {
      resultSummary = RESULT_SUMMARY.RAT_DEAD
    } else {
      resultSummary = RESULT_SUMMARY.NORMAL
    }
  }

  const replay = () => {
    teardownTripReport()
    setupTripReport()
    // Replay timeline in LOG from here
    if (logComponent && logComponent.replayTimeline) {
      logComponent.replayTimeline()
    }
  }

  const setupTripReport = () => {
    resultSummary = RESULT_SUMMARY.UNKNOWN
    playSound("ratfunTransitions", "tripReportEnter")
    shaderManager.setShader("blank")
    backgroundMusic = playSound("ratfunMusic", "tripReport", true)
  }

  const teardownTripReport = () => {
    // Stop background music
    if (backgroundMusic) {
      backgroundMusic.stop()
      backgroundMusic = undefined
    }
  }

  onMount(() => {
    setupTripReport()
  })

  onDestroy(async () => {
    teardownTripReport()
  })
</script>

<div class="replay-button-container">
  <button onclick={replay}>Replay</button>
</div>

<div class="trip-report-container">
  <!-- LOG -->
  <div class="log-container">
    <Log {result} {onComplete} bind:this={logComponent} />
  </div>

  <!-- RESULT SUMMARY -->
  <div class="result-summary-container">
    {#if resultSummary === RESULT_SUMMARY.NORMAL}
      <NormalResultSummary />
    {:else if resultSummary === RESULT_SUMMARY.RAT_DEAD}
      <RatDeadResultSummary />
    {/if}
  </div>
</div>

<style lang="scss">
  .replay-button-container {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: var(--z-top);
  }

  .trip-report-container {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;

    .log-container {
      width: 50%;
      height: 100%;
    }

    .result-summary-container {
      width: 50%;
      height: 100%;
    }
  }
</style>
