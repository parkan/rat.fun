<script lang="ts">
  import { playSound } from "$lib/modules/sound"
  import { Tooltip } from "$lib/components/Shared"

  let {
    tippyText,
    disabled = false,
    extraClass = "",
    onclick
  }: {
    tippyText?: string
    disabled?: boolean
    extraClass?: string
    onclick?: (e: MouseEvent) => void
  } = $props()

  const onclickHandler = (e: MouseEvent) => {
    playSound("ratfunUI", "boing")
    onclick?.(e)
  }
</script>

<Tooltip content={tippyText}>
  <button class={extraClass} class:disabled onpointerdown={onclickHandler}>
    <span class="button-text">X</span>
  </button>
</Tooltip>

<style lang="scss">
  button {
    width: 100%;
    height: 100%;
    background: var(--color-alert-priority);
    border: none;
    border-style: outset;
    border-width: 10px;
    border-color: rgba(0, 0, 0, 0.3);

    &.red {
      background: var(--color-death);
    }

    .button-text {
      font-size: var(--font-size-large);
      font-family: var(--typewriter-font-stack);
      line-height: 1em;
      text-transform: uppercase;
      color: rgb(63, 63, 63);
    }

    &:hover {
      background: var(--color-alert-priority-light);
    }

    &:active {
      background: var(--color-alert-priority-muted);
      border-style: inset;
      transform: translateY(2px);
      border-width: 10px;
      position: relative;
      top: -2px;
    }

    &.disabled {
      pointer-events: none;
      opacity: 0.5;
      cursor: default;
    }
  }
</style>
