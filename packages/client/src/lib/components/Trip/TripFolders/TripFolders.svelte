<script lang="ts">
  import type { TripFolder } from "@sanity-types"
  let {
    folders,
    foldersCounts,
    onselect
  }: {
    folders: TripFolder[]
    foldersCounts: number[]
    onselect: (str: string) => void
  } = $props()

  $inspect(foldersCounts)

  let totalAmount = $derived(foldersCounts.reduce((a, b) => a + b, 0))
</script>

<div class="tiles">
  {#each folders as folder, i}
    <div class="tile">
      <button
        style:background-image="url('/images/texture-{2 + (i % 5)}.png');"
        onclick={() => onselect(folder._id)}
        class="title"
      >
        {folder.title}<br />
        {foldersCounts[i]}/{totalAmount}
      </button>
    </div>
  {/each}
</div>

<style lang="scss">
  .tiles {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
    place-content: center;
    padding: 8px;
    gap: 8px;

    .tile {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;

      .title {
        width: 100%;
        height: 100%;
        font-size: var(--font-size-normal);

        &:active {
          filter: invert(1);
        }
      }
    }
  }
</style>
