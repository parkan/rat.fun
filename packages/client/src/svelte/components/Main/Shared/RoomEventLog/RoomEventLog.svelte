<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  // import { rooms } from "@modules/state/base/stores"
  import { client } from "@modules/content/sanity"
  import { queries } from "@modules/content/sanity/groq"
  import { formatDate, timeSince } from "@modules/utils"
  import { publicNetwork } from "@modules/network"

  let { roomId, initialOutcomes } = $props()

  let subscription = $state<any>(null)
  let outcomes = $state(initialOutcomes)

  const query = queries.outcomesForRoom
  const params = { roomId, worldAddress: $publicNetwork.worldAddress }

  const callback = update => {
    if (!outcomes) {
      console.error("Outcomes is undefined")
      return
    }

    if (!outcomes.map(o => o._id).includes(update?.result?._id)) {
      outcomes.pop(update.result)
    }
  }

  onMount(() => {
    subscription = client.listen(query, params).subscribe(callback)
  })

  onDestroy(() => {
    subscription?.unsubscribe()
  })
</script>

<div class="outcomes">
  <div class="header">ROOM LOGS</div>
  <div class="logs">
    {#each outcomes as outcome (outcome._id)}
      {@const elapsed = timeSince(new Date(outcome._createdAt).getTime())}
      {@const ago = elapsed !== "now" && "ago"}
      <div class="log-entry">
        <span class="timestamp">
          {elapsed}
          {ago}
        </span>
        {outcome.outcomeMessage}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .outcomes {
    margin-bottom: 12px;
    max-height: 400px;
    overflow-y: scroll;
    border: 1px solid var(--color-grey-mid);
  }
  .outcome {
    display: block;
    margin-bottom: 12px;
  }

  .logs {
    padding: 12px;
    display: flex;
    flex-flow: column nowrap;
    gap: 4px;
  }

  .header {
    border-bottom: 1px dashed var(--color-grey-mid);
    padding: 12px;
    display: flex;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: black;
  }

  .log-entry {
    display: block;
    margin-bottom: 0.5em;
    line-height: 1.4em;

    .timestamp {
      background: var(--color-grey-dark);
      padding: 2px 5px;
      color: white;
      display: inline-block;
    }
  }
</style>
