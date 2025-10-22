<script lang="ts">
  import type { EntityMap, ColumnConfig } from "./types"
  import { entities as allEntities } from "$lib/modules/state/stores"
  import { ENTITY_TYPE } from "contracts/enums"

  const {
    entities,
    columns,
    entityType
  }: {
    entities: EntityMap
    columns: ColumnConfig[]
    entityType?: string
  } = $props()

  const entriesArray = $derived(Object.entries(entities))

  // Fields that reference other entities by ID
  const ENTITY_REFERENCE_FIELDS = ["currentRat", "owner", "pastRats", "inventory"]

  /**
   * Check if a field contains entity references
   */
  function isEntityReferenceField(key: string): boolean {
    return ENTITY_REFERENCE_FIELDS.includes(key)
  }

  /**
   * Get entity name by ID
   */
  function getEntityName(entityId: string): string {
    const entity = $allEntities[entityId]
    return entity?.name || entityId.slice(0, 8) + "..."
  }

  /**
   * Get display name for a column
   */
  function getDisplayName(column: ColumnConfig): string {
    return column.displayName
  }

  /**
   * Check if a column has priority
   */
  function isPriorityColumn(column: ColumnConfig): boolean {
    return column.priority === true
  }

  /**
   * Create a scroll link to another entity table
   */
  function scrollToEntity(entityId: string) {
    console.log("entity iid", entityId)

    // Remove any existing active classes first
    document.querySelectorAll("tr.active").forEach(el => {
      el.classList.remove("active")
    })

    const element1 = document.querySelector(`[data-entity-address="${entityId}"]`)
    console.log("element", element1)

    if (element1) {
      element1.classList.add("active")
      element1.scrollIntoView({ behavior: "smooth" })

      // Remove active class after animation completes
      setTimeout(() => {
        element1.classList.remove("active")
      }, 3000)
    } else {
      const entity = $allEntities[entityId]
      if (!entity || !entity.entityType) return

      const entityType = ENTITY_TYPE[entity.entityType]
      const element2 = document.querySelector(`[data-entity-type="${entityType}"]`)
      console.log(element2, entityType)
      if (element2) {
        element2.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }
</script>

<div data-entity-type={entityType}>
  <div class="table-wrapper">
    <table>
      {#if entriesArray.length > 0}
        <thead>
          <tr>
            {#each columns as column}
              <th class:priority={isPriorityColumn(column)}>{getDisplayName(column)}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each entriesArray as [id, entity], index (id)}
            <tr class:even={index % 2 === 0} data-entity-address={id}>
              {#each columns as column}
                <td class:priority={isPriorityColumn(column)}>
                  {#if isEntityReferenceField(column.key) && entity[column.key]}
                    {#if Array.isArray(entity[column.key])}
                      <div class="entity-links">
                        {#each entity[column.key] as entityId, idx}
                          <button class="entity-link" onclick={() => scrollToEntity(entityId)}>
                            {getEntityName(entityId)}
                          </button>
                          {#if idx < entity[column.key].length - 1},
                          {/if}
                        {/each}
                      </div>
                    {:else}
                      <button
                        class="entity-link"
                        onclick={() => scrollToEntity(entity[column.key])}
                      >
                        {getEntityName(entity[column.key])}
                      </button>
                    {/if}
                  {:else}
                    {entity[column.key] ?? ""}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      {:else}
        <tbody>
          <tr>
            <td colspan={columns.length} class="no-data">
              <span>NO DATA</span>
            </td>
          </tr>
        </tbody>
      {/if}
    </table>
  </div>
</div>

<style lang="scss">
  .table-wrapper {
    width: 100%;
    max-width: 100vw;
    overflow-x: auto;
    margin-bottom: 2rem;
  }

  table {
    width: 100%;
    max-width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    table-layout: fixed;
  }

  th,
  td {
    padding: 0.25rem;
    text-align: left;
    border: 1px solid #ccc;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    white-space: nowrap;
    max-width: 0;
  }

  /* Priority columns get more space */
  th.priority,
  td.priority {
    min-width: 200px;
    max-width: 300px;
    width: 25%;
  }

  th {
    font-weight: bold;
    background-color: #f5f5f5;
  }

  tr.even {
    background-color: white;
  }

  tr:not(.even) {
    background-color: #f9f9f9;
  }

  .no-data {
    text-align: center;
    padding: 2rem;
  }

  .entity-link {
    background: none;
    border: none;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font: inherit;
  }

  .entity-links {
    display: inline;
  }

  /* Highlight active/selected entity row */
  :global(tr.active) {
    background-color: #e3f2fd !important;
  }
</style>
