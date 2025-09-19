<script lang="ts">
  let investment = $state(700)
  let balance = $state(3000)
</script>

<div class="admin-trip-monitor">
  <div class="p-l-overview">
    <div class="top">
      <p>Unrealized P&L</p>
      <h1>{balance - investment} ({((balance / investment) * 100).toFixed(2)}%)</h1>
      <!-- Investment minus balance (percentage of investment) -->
    </div>
    <div class="bottom-left">
      <p>Portfolio</p>
      <h1>{balance}</h1>
      <!-- Complete balance of all active trips -->
    </div>
    <div class="bottom-right">
      <p>Invested</p>
      <h1>{investment}</h1>
      <!-- Complete invested  -->
    </div>
  </div>
  <div class="p-l-graph"></div>
</div>

<style lang="scss">
  .admin-trip-monitor {
    width: 100%;
    height: 400px;
    background: green;
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
