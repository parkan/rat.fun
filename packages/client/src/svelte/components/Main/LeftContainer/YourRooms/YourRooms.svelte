<script lang="ts">
  import CreateRoomButton from "@components/Main/LeftContainer/YourRooms/CreateRoomButton.svelte"
  import PlayerRoomListing from "@components/Main/LeftContainer/YourRooms/PlayerRoomListing.svelte"
</script>

<div class="your-rooms">
  <CreateRoomButton />
  <PlayerRoomListing />
</div>

<style lang="scss">
  .your-rooms {
    height: 100%;
    flex-direction: column;
  }
</style>
