<script lang="ts">
  import { page } from "$app/state"
</script>

<div class="pane-switch">
  <!-- ALL ROOMS -->
  <div
    class="pane-switch-item"
    class:selected={page.url.pathname.includes("/landlord")}
  >
    <a
      href="/rooms"
    >
      ALL ROOMS
    </a>
  </div>
  <!-- YOUR ROOMS -->
  <div
    class="pane-switch-item"
    class:selected={false}
  >
    <a href="/rooms/landlord"
    >
      YOUR ROOMS
    </a>
  </div>
</div>

<style lang="scss">
  .pane-switch {
    display: flex;
    flex-direction: row;
    border-bottom: var(--default-border-style);
    height: var(--pane-switch-height);
    line-height: var(--pane-switch-height);

    .pane-switch-item {
      text-align: center;
      padding-inline: 20px;
      border: none;
      outline: none;
      font-family: var(--label-font-stack);
      background: var(--color-grey-mid);
      color: var(--background);
      width: 50%;

      button {
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: var(--background);
        font-family: var(--label-font-stack);
        font-size: var(--font-size-large);
        letter-spacing: -0.2em;
      }

      &:hover {
        background: var(--color-grey-light);

        button {
          transform: scale(1.4);
          transition: transform 0.2s ease-in-out;
        }
      }

      &.selected {
        background: var(--color-alert);
        color: var(--foreground);

        &:hover {
          // background: var(--color-alert-priority);
        }
      }
    }
  }
</style>
