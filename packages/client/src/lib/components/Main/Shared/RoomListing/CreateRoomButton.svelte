<script lang="ts">
  import BigButton from "$lib/components/Main/Shared/Buttons/BigButton.svelte"
</script>

<a href="/rooms/create" class="create-room-button">
  <BigButton text="Create Room" />
</a>

<style lang="scss">
  .create-room-button {
    height: var(--create-room-button-height);
    display: flex;
    justify-content: center;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: var(--z-high);
    background: var(--background);
    overflow: hidden;
  }
</style>
