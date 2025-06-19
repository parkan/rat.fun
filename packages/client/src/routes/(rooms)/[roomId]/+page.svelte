<script lang="ts">
  import { slide } from "svelte/transition"
  import { rooms } from "$lib/modules/state/base/stores"
  import { page } from "$app/state"
  import RoomPreview from "$lib/components/Main/Shared/RoomPreview/RoomPreview.svelte"
  
  let clientWidth = $state(400)
</script>


<RoomPreview isOwnRoomListing={page.url.searchParams.has("landlord")} roomId={page.params.roomId} room={$rooms?.[page.params.roomId]} />


<style>
  .slide-container {
    overflow: hidden;
    width: 100%;
  }
</style>