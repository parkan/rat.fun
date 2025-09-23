<script lang="ts">
  import { derived } from "svelte/store"
  import { playerLiquidatedRooms, playerRooms } from "$lib/modules/state/stores"
  import { MultiTripGraph } from "$lib/components/Room"

  let { focus } = $props()

  const investment = derived(playerLiquidatedRooms, $playerLiquidatedRooms =>
    Object.values($playerLiquidatedRooms).reduce((a, b) => a + Number(b.roomCreationCost), 0)
  )
  const balance = derived(playerLiquidatedRooms, $playerLiquidatedRooms =>
    Object.values($playerLiquidatedRooms).reduce((a, b) => a + Number(b.balance), 0)
  )
  const profitLoss = derived([balance, investment], ([$b, $i]) => $b - $i)
  const portfolioClass = derived([profitLoss, balance], ([$profitLoss, $balance]) => {
    if ($profitLoss === 0) return "neutral"
    return $profitLoss < $balance ? "upText" : "downText"
  })

  $inspect($playerLiquidatedRooms)
  $inspect($playerRooms)
</script>

<div class="admin-trip-monitor">
  <div class="p-l-overview">
    <div class="top">
      <p>Realized P&L</p>
      <h1>
        <span class="main {$portfolioClass}"
          >{$profitLoss}
          <span class="small">({(($balance / $investment) * 100).toFixed(2)}%)</span></span
        >
        <!-- {$balance / $investment} -->
      </h1>
    </div>
  </div>
</div>

<style lang="scss">
  .admin-trip-monitor {
    width: 100%;
    background: blue;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 2rem;

    .p-l-overview {
      // background: #000;
      width: 500px;
      padding-right: 1rem;
      display: grid;
      grid-template-columns: repeat(1fr, 2);
      grid-template-rows: repeat(1fr, 2);
      gap: 1rem;

      .top {
        grid-column: 1/3;
        background: red;
        padding: 0.2rem;
      }
      .bottom-left,
      .bottom-right {
        padding: 0.2rem;
        margin: 0;
        background: blue;
      }
      p {
        margin: 0;
      }
    }

    .p-l-graph {
      height: 400px;
      width: 100%;
      background: #222;
    }
  }
</style>
