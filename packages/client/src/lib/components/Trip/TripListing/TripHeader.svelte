<script lang="ts">
  import {
    entriesChronologically,
    entriesByVisit,
    entriesByBalance,
    entriesByKillCount,
    entriesByPopularity
  } from "./sortFunctions"

  let {
    totalCount,
    hasBackButton = false,
    sortFunction = entriesChronologically,
    textFilter = "",
    showDepleted = false,
    onSort,
    onTextFilterChange,
    onTextFilterClear,
    onToggleDepleted
  }: {
    totalCount?: number
    hasBackButton?: boolean
    sortFunction?: (a: [string, any], b: [string, any]) => number
    textFilter?: string
    showDepleted?: boolean
    onSort?: (fn: (a: [string, any], b: [string, any]) => number) => void
    onTextFilterChange?: (value: string) => void
    onTextFilterClear?: () => void
    onToggleDepleted?: () => void
  } = $props()

  // Build the description text based on current filter state
  let filterDescription = $derived.by(() => {
    if (totalCount === undefined) return "search trips"
    const count = totalCount
    const s = count === 1 ? "" : "s"

    // Determine sort description
    let sortDesc = ""
    if (sortFunction === entriesByPopularity) {
      sortDesc = ", sorted by popularity"
    } else if (sortFunction === entriesByVisit) {
      sortDesc = ", sorted by visits"
    } else if (sortFunction === entriesByBalance) {
      sortDesc = ", sorted by balance"
    } else if (sortFunction === entriesByKillCount) {
      sortDesc = ", sorted by kills"
    }

    if (showDepleted) {
      return `search ${count} depleted trip${s}${sortDesc}`
    }

    return `search ${count} trip${s}${sortDesc}`
  })
</script>

<div class="trip-header" class:with-back-button={hasBackButton}>
  <!-- Left side: search input styled as text, with filter description as placeholder -->
  <div class="search-area">
    {#if onSort}
      <input
        placeholder={filterDescription}
        type="text"
        name="filter"
        value={textFilter}
        oninput={e => onTextFilterChange?.(e.currentTarget.value)}
      />{#if textFilter !== ""}<button class="clear-button" onclick={onTextFilterClear}>x</button
        >{/if}
    {:else}
      <span class="trips-count">{filterDescription}</span>
    {/if}
  </div>

  <!-- Sort buttons -->
  {#if onSort}
    <div class="filters">
      <button
        class="filter-button"
        class:active={sortFunction === entriesByPopularity}
        onclick={() => onSort(entriesByPopularity)}
        title="sort by popularity">p</button
      >
      <button
        class="filter-button"
        class:active={sortFunction === entriesChronologically}
        onclick={() => onSort(entriesChronologically)}
        title="sort chronologically">c</button
      >
      <button
        class="filter-button"
        class:active={sortFunction === entriesByVisit}
        onclick={() => onSort(entriesByVisit)}
        title="sort by visits">v</button
      >
      <button
        class="filter-button"
        class:active={sortFunction === entriesByBalance}
        onclick={() => onSort(entriesByBalance)}
        title="sort by balance">$</button
      >
      <button
        class="filter-button"
        class:active={sortFunction === entriesByKillCount}
        onclick={() => onSort(entriesByKillCount)}
        title="sort by kills">k</button
      >
      <button
        class="filter-button"
        class:active={showDepleted}
        onclick={onToggleDepleted}
        title="show depleted trips">d</button
      >
    </div>
  {/if}
</div>

<style lang="scss">
  .trip-header {
    line-height: 40px;
    height: 40px;
    border-bottom: var(--default-border-style);
    padding-inline: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--background-semi-transparent);
    user-select: none;
  }

  .search-area {
    display: flex;
    align-items: center;
    font-size: var(--font-size-small);
    font-family: var(--typewriter-font-stack);
    color: var(--color-grey-light);
    flex: 1;
    min-width: 0;

    input {
      color: var(--color-grey-light);
      background: transparent;
      border: none;
      outline: none;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      flex: 1;
      min-width: 0;
      padding: 0;
      margin: 0;

      &::placeholder {
        color: var(--color-grey-light);
        opacity: 1;
      }
    }
  }

  .trips-count {
    color: var(--color-grey-light);
  }

  .clear-button {
    background: transparent;
    border: none;
    color: var(--color-grey-light);
    font-family: inherit;
    font-size: inherit;
    padding: 0;
    margin-left: 8px;
    cursor: pointer;
    line-height: 1;
    flex-shrink: 0;
    padding-right: 1rem;
  }

  .filters {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .filter-button {
    background: transparent;
    color: var(--color-grey-light);
    border: none;
    font-family: var(--typewriter-font-stack);
    font-size: var(--font-size-small);
    padding: 2px 4px;
    cursor: pointer;

    &.active {
      background: var(--color-grey-light);
      color: var(--background);
    }
  }
</style>
