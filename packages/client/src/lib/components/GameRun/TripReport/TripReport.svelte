<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import { Log } from "$lib/components/GameRun"
  import { playUISound } from "$lib/modules/sound/state.svelte"
  import { shaderManager } from "$lib/modules/webgl/shaders/index.svelte"
  import type { EnterRoomReturnValue } from "@server/modules/types"

  // import { NormalResultSummary, RatDeadResultSummary } from "$lib/components/GameRun"

  let { result }: { result: EnterRoomReturnValue | null } = $props()

  let sound = $state()

  const onComplete = () => {
    console.log("### log output completed ###")
    console.log("### result ###", result)

    if (result?.ratDead) {
      console.log("### rat dead ###")
    } else {
      console.log("### rat alive ###")
    }
  }

  onMount(() => {
    console.log("### result ###", result)
    shaderManager.setShader("blank")
    sound = playUISound("ratfun", "tripResultLoop")
    playUISound("ratfun", "tripResultTrigger")
  })

  onDestroy(async () => {
    const resultSnd = await sound
    if (resultSnd) {
      resultSnd.stop()
    }
  })
</script>

<!-- LOG -->
<Log {result} {onComplete} />

<!-- <NormalResultSummary /> -->
<!-- Result Summary: Rat Dead -->
<!-- <RatDeadResultSummary /> -->

<style lang="scss">
</style>
