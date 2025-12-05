<script lang="ts">
  import { getTripMaxValuePerWin } from "$lib/modules/state/utils"

  import RiskMeterSimple from "./RiskMeterSimple.svelte"

  let { trip }: { trip: Trip } = $props()

  const maxValuePerWin = getTripMaxValuePerWin(trip.tripCreationCost, trip.balance)
</script>

<div class="meta-data">
  <RiskMeterSimple {trip} maxValuePerWin={$maxValuePerWin} />
  <!-- Rest of alerts moved to trip avatar overlay -->
</div>

<style lang="scss">
  .meta-data {
    width: 100%;
    height: 100%;
    user-select: none;

    @media (max-width: 800px) {
      display: flex;
      flex-direction: row;
      gap: 10px;
      padding: 10px;
    }
  }
</style>
