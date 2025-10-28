<script lang="ts">
  import SignedNumber from "$lib/components/Shared/SignedNumber/SignedNumber.svelte"
  import { staticContent } from "$lib/modules/content"
</script>

<div class="stats">
  <div class="balance">
    <h2 class="top">
      <span class="label"> Rats </span>
      <SignedNumber withTween value={$staticContent?.statistics?.ratTotalBalance || 0} /> /
      <SignedNumber withTween value={$staticContent?.statistics?.tripTotalBalance || 0} />
      <span class="label"> Trips </span>
    </h2>
    <h2>
      <span class="label"> Throughput: </span>
      <SignedNumber
        noColor
        withTween
        hideSign
        value={$staticContent?.statistics?.totalThroughput || 0}
      />
    </h2>
  </div>
  <p class="bottom">
    {#if $staticContent.statistics.ratTotalBalance !== 0 && $staticContent.statistics.tripTotalBalance !== 0}
      {#if Math.abs($staticContent.statistics.ratTotalBalance) > Math.abs($staticContent.statistics.tripTotalBalance)}
        <SignedNumber
          withTween
          noColor
          value={Math.abs(
            ($staticContent.statistics.ratTotalBalance /
              $staticContent.statistics.tripTotalBalance -
              1) *
              100
          )}
        />% <small>rats</small>
      {:else}
        <SignedNumber
          withTween
          noColor
          value={Math.abs(
            ($staticContent.statistics.tripTotalBalance /
              $staticContent.statistics.ratTotalBalance -
              1) *
              100
          )}
        />% <small>trips</small>
      {/if}
    {:else}
      0
    {/if}

    {#if $staticContent?.statistics?.totalThroughput && $staticContent?.statistics?.totalThroughput > 0}
      {(
        Math.abs(
          $staticContent.statistics.totalBalance / $staticContent.statistics.totalThroughput
        ) * 100
      ).toFixed(2)}%
    {:else}
      0.00%
    {/if}
    <small>imbalance</small>
  </p>
</div>

<style lang="scss">
  .stats {
    height: 300px;
    display: flex;
    flex-flow: column wrap;
    justify-content: start;
    // align-items: center;

    h1,
    h2,
    p {
      margin: 0;
    }
  }
</style>
