<script lang="ts">
  import { playSound } from "$lib/modules/sound"
  import { Tooltip } from "$lib/components/Shared"
  import { CURRENCY_SYMBOL } from "$lib/modules/ui/constants"
  import { ShaderLocal } from "$lib/components/Shared"

  export type BigButtonType =
    | "default"
    | "abort"
    | "confirm"
    | "danger"
    | "cash_out"
    | "buy_rat"
    | "create_trip"

  let {
    text,
    cost,
    tippyText,
    disabled = false,
    extraBig = false,
    type = "default",
    onclick
  }: {
    text: string
    cost?: number
    tippyText?: string
    disabled?: boolean
    extraBig?: boolean
    type?: BigButtonType
    onclick: () => void
  } = $props()

  const onmousedown = () => {
    playSound({ category: "ratfunUI", id: "bigButtonDown" })
  }

  const onmouseup = () => {
    playSound({ category: "ratfunUI", id: "bigButtonUp" })
    onclick()
  }
</script>

<Tooltip content={tippyText}>
  <button class="type-{type}" class:disabled class:extraBig {onmouseup} {onmousedown}>
    <div class="button-content">
      <span class="button-text">{text}</span>
      {#if cost}
        <span class="button-cost">({cost} {CURRENCY_SYMBOL})</span>
      {/if}
    </div>
    <div class="canvas-container">
      <ShaderLocal shaderKey="plasma" />
    </div>
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
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    border-radius: 40px;

    .button-content {
      z-index: 2;
      position: relative;
      color: white;

      .button-text {
        font-size: var(--font-size-extra-large);
        font-family: var(--special-font-stack);
        line-height: 1em;
      }

      .button-cost {
        font-size: var(--font-size-normal);
      }
    }

    .canvas-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      border-radius: 40px;
      overflow: hidden;

      // opacity: 0.5;
    }

    &:active {
      border-style: inset;
      transform: translateY(2px);
      position: relative;
      color: white;
    }

    &.disabled {
      pointer-events: none;
      opacity: 0.5;
      cursor: default;
    }

    &.extraBig {
      .button-content {
        .button-text {
          font-size: var(--font-size-super-large);
        }
      }
    }

    /* Button types */
    &.type-default {
      background: var(--color-alert-priority);
      &:hover {
        background: var(--color-alert-priority-light);
      }
      &:active {
        background: var(--color-alert-priority-muted);
      }
    }

    &.type-abort {
      background: var(--color-death);
      &:hover {
        background: var(--color-death-light);
      }
      &:active {
        background: var(--color-death-muted);
      }
    }

    &.type-confirm {
      background: var(--color-alert-priority);
      &:hover {
        background: var(--color-alert-priority-light);
      }
      &:active {
        background: var(--color-alert-priority-muted);
      }
    }

    &.type-danger {
      background: var(--color-death);
      &:hover {
        background: var(--color-death-light);
      }
      &:active {
        background: var(--color-death-muted);
      }
    }

    &.type-cash_out {
      background: var(--color-death);
      &:hover {
        background: var(--color-death-light);
      }
      &:active {
        background: var(--color-death-muted);
      }
    }

    &.type-buy_rat {
      background: var(--color-alert-priority);
      &:hover {
        background: var(--color-alert-priority-light);
      }
      &:active {
        background: var(--color-alert-priority-muted);
      }
    }

    &.type-create_trip {
      background: var(--color-alert-priority);
      &:hover {
        background: var(--color-alert-priority-light);
      }
      &:active {
        background: var(--color-alert-priority-muted);
      }
    }
  }
</style>
