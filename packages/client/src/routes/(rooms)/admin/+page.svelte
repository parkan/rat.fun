<script lang="ts">
  import SEO from "$lib/components/Shared/SEO/SEO.svelte"
  import {
    AdminTripMonitor,
    AdminPastTripsMonitor,
    AdminTripTable,
    CreateRoom
  } from "$lib/components/Admin"
  import { BigButton } from "$lib/components/Shared"
  import { getModalState } from "$lib/components/Shared/Modal/state.svelte"

  let { modal } = getModalState()

  const startCreateRoom = () => {
    modal.set(createTrip)
  }
</script>

<SEO prependTitle="ADMIN" />

<div class="">
  <AdminTripMonitor />
  <BigButton text="Create trip" onclick={startCreateRoom} />
  <!-- In top bar: ProfitLossOverview -->

  <!-- Active Trip Monitor -->
  <!-- New Trip Dialog -->
  <AdminTripTable />
  <!-- Active Trip Table -->
  <!-- Event feed -->

  <!-- Past Trip Monitor -->
  <AdminPastTripsMonitor />
  <!-- Past Trip Table -->
</div>

{#snippet createTrip()}
  <div class="create-room-wrapper">
    <CreateRoom />
  </div>
{/snippet}

<style>
  .create-room-wrapper {
    width: 600px;
    z-index: 99;
  }
</style>
