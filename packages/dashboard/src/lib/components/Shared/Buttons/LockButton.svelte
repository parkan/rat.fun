<script lang="ts">
  import { playSound } from "$lib/modules/sound"
  import { Tooltip } from "$lib/components/Shared"

  let {
    text,
    tippyText,
    disabled = false,
    extraClass = "",
    onmouseup,
    onclick
  }: {
    text: string
    tippyText?: string
    disabled?: boolean
    extraClass?: string
    onmouseup?: (e: MouseEvent) => void
    onclick?: (e: MouseEvent) => void
  } = $props()

  const onmousedown = () => {
    playSound("ratfunUI", "smallButtonDown")
  }

  const onmouseupHandler = (e: MouseEvent) => {
    playSound("ratfunUI", "wheelLock")
    onmouseup?.(e)
    onclick?.(e)
  }
</script>

<Tooltip content={tippyText}>
  <button class={extraClass} class:disabled onmouseup={onmouseupHandler} {onmousedown}>
    <span class="button-text">{text}</span>
  </button>
</Tooltip>

<style lang="scss">
  button {
    width: 100%;
    height: 100%;
    background: var(--color-alert-priority);
    border: none;
    border-style: outset;
    border-width: 4px;
    border-color: rgba(0, 0, 0, 0.5);

    &.red {
      background: var(--color-death);
    }

    .button-text {
      font-size: var(--font-size-normal);
      font-family: var(--special-font-stack);
    }

    &:hover {
      background: var(--color-alert-priority-light);
    }

    &:active {
      background: var(--color-alert-priority-muted);
      border-style: inset;
      transform: translateY(2px);
      border-width: 4px;
      position: relative;
      top: -2px;
      color: white;
    }

    &.disabled {
      pointer-events: none;
      opacity: 0.5;
      cursor: default;
    }
  }
</style>
