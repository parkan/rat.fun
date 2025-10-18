<script lang="ts">
  import { page } from "$app/state"
  import { playSound } from "$lib/modules/sound"
  import { shaderManager } from "$lib/modules/webgl/shaders/index.svelte"
  import { goto } from "$app/navigation"

  import ModeSwitchButton from "../Buttons/ModeSwitchButton.svelte"

  let { isAdminView }: { isAdminView: boolean } = $props()

  const buttonText = $derived(isAdminView ? "X" : "CASHBOARD")

  const enterAdmin = () => {
    playSound("ratfunTransitions", "adminEnter")
    shaderManager.unsetShader()
    goto("/admin")
  }

  const exitAdmin = () => {
    playSound("ratfunTransitions", "adminExit")
    shaderManager.setShader("clouds", true)
    goto(page.route.id?.includes("tripId") ? "/" + page.params.tripId : "/")
  }
</script>

<div class="mode-switch">
  <ModeSwitchButton text={buttonText} onclick={isAdminView ? exitAdmin : enterAdmin} />
</div>

<style lang="scss">
  .mode-switch {
    width: 160px;
    height: 100%;
  }
</style>
