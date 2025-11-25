<script lang="ts">
  let {
    checked = $bindable(false),
    disabled = false
  }: {
    checked?: boolean
    disabled?: boolean
  } = $props()
</script>

<input type="checkbox" bind:checked {disabled} />

<style lang="scss">
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 4px;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
</style>
