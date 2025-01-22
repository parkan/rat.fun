<script lang="ts">
  export let trait: Trait
</script>

<div class="trait-item">
  <div class="text">
    {trait.name} ({Number(trait.value) < 0 ? "-" : ""}${Math.abs(
      Number(trait.value)
    )})
  </div>
</div>

<style lang="scss">
  .trait-item {
    display: inline-block;
    margin-right: 5px;
    margin-bottom: 5px;
    padding: 10px;
    background: var(--color-grey-dark);
    font-size: var(--font-size-normal);
    color: var(--white);

    .text {
      position: relative;
      top: 2px;
    }
  }
</style>
