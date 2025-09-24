<script lang="ts">
  import type { Hex } from "viem"
  import { rooms } from "$lib/modules/state/stores"
  import { RoomSEO } from "$lib/components/Room"
  import { GameRoomPreview } from "$lib/components/Room"

  let { data } = $props()

  let room = $derived($rooms[data.roomId])

  console.log("### routes/(main)/(game)/[roomId]/+page.svelte ###")
</script>

<RoomSEO room={data.roomContent} />

{#if room && data.roomContent}
  <GameRoomPreview {room} roomId={data.roomId as Hex} sanityRoomContent={data.roomContent} />
{/if}
