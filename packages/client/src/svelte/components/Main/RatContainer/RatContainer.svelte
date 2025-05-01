<script lang="ts">
  import YourRat from "@components/Main/RatContainer/YourRat/YourRat.svelte"
  import ChatRoom from "@components/Main/RatContainer/ChatRoom/ChatRoom.svelte"
</script>

<div class="rat-container">
  <YourRat />
  <ChatRoom />
</div>

<style lang="scss">
  .rat-container {
    height: 100%;
    width: 100%;
    border-bottom: var(--default-border-style);
    display: grid;
    grid-template-rows: 440px 1fr;
    position: relative;
  }
</style>
