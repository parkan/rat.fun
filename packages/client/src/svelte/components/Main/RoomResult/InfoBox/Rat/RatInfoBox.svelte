<script lang="ts">
  import { frozenRat } from "@svelte/components/Main/RoomResult/state.svelte"
  import { tippy } from "svelte-tippy"
  import { onMount } from "svelte"
  import { gsap } from "gsap"

  const prepare = () => {
    gsap.set(".death", { opacity: 0 })
  }

  onMount(() => {
    prepare()
  })
</script>

<div class="info-box">
  {#if $frozenRat}
    <!-- INFO -->
    <div class="column info">
      <div class="death"></div>
      <div class="image-container">
        <img
          use:tippy={{ content: $frozenRat.name, placement: "bottom" }}
          src="/images/rat.png"
          alt={$frozenRat.name}
        />
      </div>
      <div class="meta">
        <div class="balance">${$frozenRat.balance}</div>
        <div class="health">{$frozenRat.health}</div>
      </div>
    </div>
    <!-- TRAITS -->
    <div class="column traits">
      <div class="header">traits</div>
    </div>
    <!-- INVENTORY -->
    <div class="column inventory">
      <div class="header">inventory</div>
    </div>
  {/if}
</div>

<style lang="scss">
  .info-box {
    width: 50%;
    height: 100%;
    border: 1px solid white;
    border-right: none;
    overflow: hidden;
    display: flex;
    background: var(--color-grey-dark);
    position: relative;
  }

  .image-container {
    gap: 12px;
    width: 100%;
    min-height: 140px;
    outline: 1px dashed white;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: black;
    }
  }

  .column {
    width: calc(100% / 3);
    padding: 10px;
    border-right: 1px dashed white;

    .header {
      width: 100%;
      padding-bottom: 10px;
      margin-bottom: 10px;
      border-bottom: 1px dashed white;
    }

    &.info {
      display: grid;
      grid-template-rows: 1fr 20px;
      gap: 12px;
      position: relative;

      .death {
        position: absolute;
        background: red;
        justify-content: center;
        text-align: center;
        inset: 0;
        display: flex;
        z-index: 2;
        mix-blend-mode: screen;
        pointer-events: none;
      }

      .meta {
        display: flex;
        gap: 12px;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        height: 100%;

        .balance {
          background: var(--color-value);
          color: var(--black);
        }

        .health {
          background: var(--color-death);
          color: var(--white);
        }
      }
    }

    &:last-child {
      border-right: none;
    }
  }
</style>
