<script lang="ts">
  import { rat, traits, items } from "@svelte/modules/state/base/stores"
  import { dropItem } from "@modules/action"
  import { waitForCompletion } from "@modules/action/actionSequencer/utils"

  const initialState = {
    address: "",
    type: "",
    payload: null,
  }

  let busy = $state(false)
  let dragState = $state({ ...initialState })
  let dragAddress = $state("")

  const onDragStart = (address: string, type: string, payload: any) => {
    dragAddress = address
    dragState = {
      address,
      type,
      payload,
    }
    console.log(dragState.address)
  }

  const onDragEnd = () => {
    console.log("on drag end")
    dragState = { ...initialState }
    console.log(dragState.address)
  }

  const allowDrop = e => e.preventDefault()

  const onDrop = async e => {
    console.log("on drop")
    e.preventDefault()
    if (busy) return
    busy = true

    try {
      let action
      if (dragState.type === "item") {
        action = dropItem(dragState.address)
      } else {
        console.log("let go of this trait")
      }
      if (action) {
        const result = await waitForCompletion(action)
        console.log(result)
      }
      busy = false
      dragState = { ...initialState }
    } catch (error) {
      console.error(error)
    } finally {
      busy = false
      onDragEnd()
      dragAddress = ""
    }
  }
</script>

{#snippet draggableItemOrTrait(t, a)}
  {@const itemOrTrait = t === "trait" ? $traits?.[a] : $items?.[a]}
  {#if itemOrTrait}
    <span
      ondragstart={() => onDragStart(a, t, itemOrTrait)}
      ondragend={onDragEnd}
      draggable="true"
      class={t}
    >
      {itemOrTrait?.name}
    </span>
  {/if}
{/snippet}

<div class="rat-editor" class:actions={dragAddress !== ""}>
  <div class="inner">
    {$rat?.name ?? ""} with
    <span draggable="true" class="health">
      {$rat.health} health
    </span>
    is
    {#each $rat?.traits ?? [] as trait}
      {@render draggableItemOrTrait("trait", trait)}
    {/each}
    has
    {#each $rat?.inventory ?? [] as item}
      {@render draggableItemOrTrait("item", item)}
    {/each}
  </div>

  <div ondrop={onDrop} ondragover={allowDrop} class="trash" />
</div>

<style lang="scss">
  .rat-editor {
    display: grid;
    border-bottom: 1px solid white;
    height: var(--rat-editor-height);
    grid-template-rows: 1fr 0;
    transition: grid-template-rows 0.2s ease;

    &.actions {
      grid-template-rows: 1fr 60px;
    }
  }

  .inner,
  .trash {
    padding: var(--default-padding);
  }

  .trait,
  .item,
  .health {
    cursor: grab;
    white-space: nowrap;
  }

  .trait {
    background-color: #eee;
    color: black;
  }
  .item {
    background-color: orange;
    color: black;
  }

  .health {
    background-color: #a30000;
    color: white;
  }

  .trash {
    border-top: 1px solid white;
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
