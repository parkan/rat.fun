<script lang="ts">
  import { frozenRat } from "@components/Main/RoomResult/state.svelte"

  import Trait from "@components/Main/RoomResult/InfoBox/Rat/Trait.svelte"
  import Item from "@components/Main/RoomResult/InfoBox/Rat/Item.svelte"
</script>

<div class="info-box">
  {#if $frozenRat}
    <!-- INFO -->
    <div class="column info">
      <!-- ID -->
      <div class="info-item">
        <span class="id">RAT #{$frozenRat.index}</span>
      </div>
      <!-- NAME -->
      <div class="info-item">
        <span class="name">{$frozenRat.name}</span>
      </div>
      <!-- IMAGE -->
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
      <div class="info-item">
        <!-- BALANCE -->
        <span class="balance">${$frozenRat.balance}</span>
        <!-- HEALTH -->
        <span class="health">HEALTH {$frozenRat.health}</span>
      </div>
    </div>
    <!-- TRAITS -->
    <div class="column traits">
      <!-- HEADER -->
      <div class="header">
        <div class="label">Traits</div>
        <div class="counter">{$frozenRat?.traits.length}/5</div>
      </div>
      <!-- TRAITS -->
      {#each $frozenRat.traits as trait}
        <Trait {trait} />
      {/each}
    </div>
    <!-- INVENTORY -->
    <div class="column inventory">
      <!-- HEADER -->
      <div class="header">
        <div class="label">Inventory</div>
        <div class="counter">{$frozenRat?.inventory.length}/5</div>
      </div>
      <!-- INVENTORY -->
      {#each $frozenRat.inventory as item}
        <Item {item} />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .rat-info-box {
    width: calc(50% - 50px);
    height: 100%;
    border: 1px solid white;
    border-right: none;
    overflow: hidden;
    display: flex;
    background: var(--color-grey-dark);
    position: relative;
  }

  .image-container {
    width: 100px;
    height: 100px;
    border: 1px solid white;
    margin: 10px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: black;
    }
  }

  .column {
    width: calc(100% / 3);
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

  .info-item {
    display: flex;
    margin: 10px;
    gap: 5px;

    .id {
      background: var(--color-grey-light);
      padding: 5px;
      color: black;
      font-size: var(--font-size-small);
    }

    .name {
      background: var(--color-alert);
      padding: 5px;
      color: black;
    }

    .balance {
      background: var(--color-value);
      padding: 5px;
      color: black;
    }

    .health {
      background: var(--color-health);
      padding: 5px;
      color: black;
    }
  }

  .header {
    border-bottom: 1px dashed white;
    padding: 10px;
    display: flex;
    justify-content: space-between;

    .counter {
      font-size: var(--font-size-small);
      color: var(--color-grey-light);
      position: relative;
      top: 3px;
    }
  }
</style>
