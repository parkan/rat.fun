<script lang="ts">
  let {
    checked = false,
    disabled = false,
    onchange
  }: {
    checked?: boolean
    disabled?: boolean
    onchange?: () => void
  } = $props()

  const handleChange = () => {
    onchange?.()
  }
</script>

<input type="checkbox" {checked} {disabled} onchange={handleChange} />

<style lang="scss">
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    flex-shrink: 0;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
</style>
