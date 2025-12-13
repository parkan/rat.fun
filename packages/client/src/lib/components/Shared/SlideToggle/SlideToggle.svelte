<script lang="ts">
  import { BaseSlideToggle, type SlideToggleOption } from "@ratfun/shared-ui/SlideToggle"
  import { playSound } from "$lib/modules/sound"

  let {
    options,
    value,
    onchange,
    disabled = false,
    height = 60,
    compact = false
  }: {
    options: SlideToggleOption[]
    value: string
    onchange: (value: string) => void
    disabled?: boolean
    height?: number
    compact?: boolean
  } = $props()

  function handleSelect() {
    playSound({ category: "ratfunUI", id: "smallButtonUp" })
  }
</script>

<BaseSlideToggle {options} {value} {onchange} {disabled} {height} onSelect={handleSelect} />
