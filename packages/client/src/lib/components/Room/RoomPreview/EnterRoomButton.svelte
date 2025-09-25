<script lang="ts">
  import type { Hex } from "viem"
  import { player, ratTotalValue } from "$lib/modules/state/stores"
  import { goto } from "$app/navigation"
  import { BigButton } from "$lib/components/Shared"
  import { shaderManager } from "$lib/modules/webgl/shaders/index.svelte"

  let { roomId, room, disabled }: { roomId: Hex; room: Room; disabled: boolean } = $props()

  const onClick = async () => {
    shaderManager.setShader("blank")
    await goto(`/${roomId}/tripping?enter=true&rat=${$player.currentRat}&t=${Date.now()}`)
  }
</script>

<div class="room-enter">
  {#if Number(room.minRatValueToEnter) > Number($ratTotalValue)}
    <BigButton
      disabled={true}
      text={`Rat value too low (at least ${Number(room.minRatValueToEnter)})`}
      onclick={onClick}
    />
  {/if}
  <BigButton id="send_rat" {disabled} text="Send rat to trip" onclick={onClick} />
</div>

<style>
  .room-enter {
    display: block;
    height: 100%;
    padding: 5px;
    width: 100%;
  }
</style>
