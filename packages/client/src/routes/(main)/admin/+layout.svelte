<script lang="ts">
  import { goto } from "$app/navigation"
  import { fly } from "svelte/transition"
  import { page } from "$app/state"
  import { player } from "$lib/modules/state/stores"
  import SEO from "$lib/components/Shared/SEO/SEO.svelte"
  import {
    AdminEventLog,
    AdminTripMonitor,
    AdminPastTripsMonitor,
    AdminTripTable,
    AdminPastTripTable
  } from "$lib/components/Admin"

  let { children }: { children?: any } = $props()

  let focus = $state("")
  let graphData = $state([])

  $inspect(graphData)

  // Redirect to game route if player is not authorized to view admin page
  $effect(() => {
    if ($player) {
      if (!$player.masterKey) {
        if (page.route.id === "/(main)/admin/[roomId]") {
          goto(`/${page.params.roomId}`)
        } else {
          goto("/")
        }
      }
    }
  })
</script>

<SEO prependTitle="ADMIN" />

<div class="span-all">
  <div class="l-4">
    <AdminTripMonitor bind:graphData {focus} />
  </div>
  <div class="r-2">
    <AdminEventLog bind:focus eventData={graphData} />
  </div>
  <div class="l-3 border-warning">
    <AdminTripTable bind:focus />
  </div>
  <div class="r-3">
    <AdminPastTripTable bind:focus />
  </div>
</div>

{#if children}
  <div transition:fly|global={{ x: 600, opacity: 1 }} class="sidebar open">
    {@render children?.()}
  </div>
{/if}

<style lang="scss">
  .span-all {
    grid-column: 1/4;
    position: relative;
    overflow-x: hidden;
    overflow-y: scroll;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 400px calc(var(--game-window-main-height) - 400px);
    height: var(--game-window-main-height);
    background-image: url("/images/texture-5.png");
    background-size: 200px;

    .l-4 {
      grid-column: 1 / 10;
      grid-row: 1 / 4;
    }

    .r-2 {
      grid-column: 10 / 13;
      grid-row: 1 / 2;
    }

    .l-3 {
      grid-column: 1 / 7;
      grid-row: 2 / 3;
    }

    .r-3 {
      grid-column: 7 / 13;
      grid-row: 2 / 3;
    }

    .right {
      grid-column: 10 / 13;
      grid-row: 1 / 3;
    }

    .all {
      grid-column: 1 / 13;
    }
  }

  .create-room-wrapper {
    width: 600px;
    z-index: 99;
  }

  .create-room-button {
    width: 100%;
    height: 80px;
  }

  .sidebar {
    position: fixed;
    height: 100dvh;
    width: 600px;
    overflow-x: hidden;
    z-index: 999;
    top: 0;
    right: 0;
    background: black;
    transform: translate(100%, 0);
    transition: transform 0.2s ease;
    border-left: 1px solid var(--color-grey-mid);
    &.open {
      transform: translate(0, 0);
    }
  }
</style>
