<script lang="ts">
  type EntityMap = {
    [key: string]: any
  }

  const {
    title,
    entities,
    keys
  }: {
    title: string
    entities: EntityMap
    keys: string[]
  } = $props()

  const entriesArray = $derived(Object.entries(entities))
  let isOpen = $state(false)
</script>

<details bind:open={isOpen}>
  <summary class="table-title">
    <span>
      {title}
    </span>
    <span class="toggle">{isOpen ? "-" : "+"}</span>
  </summary>

  <div class="table-wrapper">
    <div class="table" style:grid-template-columns="repeat({keys.length}, 1fr)">
      {#if entriesArray.length > 0}
        {#each entriesArray as [id, entity], index (id)}
          {#if index === 0}
            {#each keys as key}
              <div class="cell header">
                {key}
              </div>
            {/each}
          {/if}
          {#each keys as key}
            <div class="cell">
              {entity[key] ?? ""}
            </div>
          {/each}
        {/each}
      {:else}
        <div class="no-data">
          <span>NO DATA</span>
        </div>
      {/if}
    </div>
  </div>
</details>

<style lang="scss">
  details > summary {
    list-style: none;
  }
  details > summary::-webkit-details-marker {
    display: none;
  }

  details {
    border-bottom: 1px solid white;
  }

  .table-title {
    display: flex;
    justify-content: space-between;
    font-family: var(--typewriter-font-stack);
    padding: 4px;
    font-weight: bold;
    border-top: 1px solid white;
    cursor: pointer;
    user-select: none;
  }

  .toggle {
    display: inline-block;
    width: 1.5rem;
    text-align: center;
  }

  .table-wrapper {
    max-width: 100vw;
    overflow-x: auto;
    margin-bottom: 2rem;
  }

  .table {
    display: grid;
    gap: 1rem;
    width: 100%;
  }

  .cell {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    padding: 0.25rem;
    min-width: 0;
  }

  .cell.header {
    font-weight: bold;
  }

  .no-data {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }
</style>
